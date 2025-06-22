#!/bin/bash
set -euo pipefail

KEY_PATH="/opt/private.key"
CONFIG_DIR="/tmp/bootstrap"
LOG_FILE="/var/log/bootstrap-agent.log"
POLL_INTERVAL=60  # 1 minute
HOSTNAME=$(hostname)

CONFIG_URL="https://raw.githubusercontent.com/zuyd-projects/Casusgroep-1/main/infra/configs/${HOSTNAME}.json"
ENC_CONFIG_URL="https://raw.githubusercontent.com/zuyd-projects/Casusgroep-1/main/infra/configs/${HOSTNAME}.enc"
JSON_FILE="$CONFIG_DIR/${HOSTNAME}.json"
ENC_FILE="$CONFIG_DIR/${HOSTNAME}.enc"
DEC_FILE="$CONFIG_DIR/${HOSTNAME}.enc.json"

mkdir -p "$CONFIG_DIR"
mkdir -p "$(dirname "$LOG_FILE")"
# Ensure the log file exists
touch "$LOG_FILE"

# Ensure the Docker network is created
NETWORK_NAME="bootstrap-network"

if ! docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
  docker network create "$NETWORK_NAME"
  log "Created network $NETWORK_NAME"
fi

log() {
  echo "$(date +'%Y-%m-%d %H:%M:%S') [bootstrap] $*" | tee -a "$LOG_FILE"
}

download_json() {
  log "Downloading unencrypted config for $HOSTNAME..."
  curl -fsSL "$CONFIG_URL" -o "$JSON_FILE"
}

download_encrypted() {
  log "Downloading encrypted config for $HOSTNAME..."
  curl -fsSL "$ENC_CONFIG_URL" -o "$ENC_FILE"
}

decrypt_config() {
  log "Decrypting config..."
  openssl rsautl -decrypt -inkey "$KEY_PATH" -in "$ENC_FILE" -out "$DEC_FILE"
}

run_container() {
  local container_def="$1"

  local name
  name=$(echo "$container_def" | jq -r '.name')
  local image
  image=$(echo "$container_def" | jq -r '.image')

  local container_name="bootstrap_${name//[^a-zA-Z0-9]/_}"
  local checksum_file="$CONFIG_DIR/.${container_name}.checksum"

  local checksum
  checksum=$(echo "$container_def" | sha256sum | awk '{print $1}')

  if [[ -f "$checksum_file" && "$checksum" == "$(cat "$checksum_file")" ]]; then
    log "No change detected for $container_name."
    return
  fi

  log "Restarting container: $container_name"

  docker rm -f "$container_name" 2>/dev/null || true

  local cmd=(docker run -d --rm --name "$container_name")

  for port in $(echo "$container_def" | jq -r '.ports[]?'); do
    cmd+=(-p "$port")
  done

  for vol in $(echo "$container_def" | jq -r '.volumes[]?'); do
    cmd+=(-v "$vol")
  done

  for key in $(echo "$container_def" | jq -r '.env | keys[]?'); do
    val=$(echo "$container_def" | jq -r --arg k "$key" '.env[$k]')
    cmd+=(-e "$key=$val")
  done

  cmd+=(--network "$NETWORK_NAME")

  cmd+=("$image")

  log "Running: ${cmd[*]}"
  "${cmd[@]}"

  echo "$checksum" > "$checksum_file"
}

main_loop() {
  while true; do
    download_json
    download_encrypted
    decrypt_config

    # Build a map from container name to image from unencrypted config
    declare -A images_map=()
    while IFS= read -r container; do
      name=$(echo "$container" | jq -r '.name')
      image=$(echo "$container" | jq -r '.image')
      images_map["$name"]="$image"
    done < <(jq -c '.containers[]' "$JSON_FILE")

    # Iterate over container names in decrypted (encrypted) config
    jq -r 'keys[]' "$DEC_FILE" | while read -r name; do
      # Get the encrypted container config for this container name (without image)
      container_config=$(jq -c --arg name "$name" '.[$name]' "$DEC_FILE")

      # Get image from unencrypted config map
      image="${images_map[$name]}"
      if [[ -z "$image" ]]; then
        log "Warning: No image found in unencrypted config for container '$name', skipping"
        continue
      fi

      # Merge image into container config JSON
      container_def=$(jq -n --argjson cfg "$container_config" --arg img "$image" \
        '$cfg + {name: $name, image: $img}')

      # Run container with combined config
      run_container "$container_def"
    done

    log "Sleeping for $POLL_INTERVAL seconds..."
    sleep "$POLL_INTERVAL"
  done
}

main_loop