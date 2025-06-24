#!/bin/bash
set -euo pipefail

KEY_PATH="/opt/private.key"
CONFIG_DIR="/tmp/bootstrap"
LOG_FILE="/var/log/bootstrap-agent.log"
POLL_INTERVAL=60  # 1 minute
HOSTNAME=$(hostname)
GITHUB_TOKEN=$(cat /opt/github.token)

CONFIG_URL="https://raw.githubusercontent.com/zuyd-projects/Casusgroep-1/refs/heads/config/infra/configs/${HOSTNAME}.json"
ENC_CONFIG_URL="https://raw.githubusercontent.com/zuyd-projects/Casusgroep-1/main/infra/configs/${HOSTNAME}.enc"
ENC_KEY_URL="https://raw.githubusercontent.com/zuyd-projects/Casusgroep-1/main/infra/configs/${HOSTNAME}.key.enc"

JSON_FILE="$CONFIG_DIR/${HOSTNAME}.json"
ENC_FILE="$CONFIG_DIR/${HOSTNAME}.enc"
ENC_KEY_FILE="$CONFIG_DIR/${HOSTNAME}.key.enc"
AES_KEY_FILE="$CONFIG_DIR/${HOSTNAME}.aes.key"
DEC_FILE="$CONFIG_DIR/${HOSTNAME}.dec.json"

mkdir -p "$CONFIG_DIR"
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"

NETWORK_NAME="bootstrap-network"

log() {
  echo "$(date +'%Y-%m-%d %H:%M:%S') [bootstrap] $*" | tee -a "$LOG_FILE"
}

download_file() {
  local url="$1"
  local output="$2"
  local headers=(
    -H "Authorization: token ${GITHUB_TOKEN}"
    -H "Cache-Control: no-cache, no-store"
    -H "Pragma: no-cache"
  )

  local timestamp=$(date +%s)
  local full_url="${url}?t=${timestamp}"

  rm -f "$output"

  log "Downloading $full_url..."
  curl -fsSL "${headers[@]}" "${full_url}" -o "${output}"
}

download_json() {
  log "Downloading unencrypted config for $HOSTNAME..."
  download_file "$CONFIG_URL" "$JSON_FILE"
}

download_encrypted() {
  log "Downloading AES-encrypted config for $HOSTNAME..."
  download_file "$ENC_CONFIG_URL" "$ENC_FILE"
  log "Downloading RSA-encrypted AES key for $HOSTNAME..."
  download_file "$ENC_KEY_URL" "$ENC_KEY_FILE"
}

decrypt_config() {
  log "Decrypting AES key with RSA private key..."
  openssl pkeyutl -decrypt -inkey "$KEY_PATH" -in "$ENC_KEY_FILE" -out "$AES_KEY_FILE"

  log "Decrypting config file with AES key..."
  openssl enc -d -aes-256-cbc -in "$ENC_FILE" -out "$DEC_FILE" -pass file:"$AES_KEY_FILE"

  rm -f "$AES_KEY_FILE"
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
    # Create volume if it doesn't exist
    if [[ "$vol" == *":"* ]]; then
      vol_name=$(echo "$vol" | cut -d':' -f1)
      docker volume create "$vol_name" 2>/dev/null || true
    fi
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
  if ! docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
    docker network create "$NETWORK_NAME"
    log "Created network $NETWORK_NAME"
  fi

  while true; do
    download_json
    download_encrypted
    decrypt_config

    declare -A images_map=()
    while IFS= read -r container; do
      name=$(echo "$container" | jq -r '.name')
      image=$(echo "$container" | jq -r '.image')
      images_map["$name"]="$image"
    done < <(jq -c '.containers[]' "$JSON_FILE")

    jq -r 'keys[]' "$DEC_FILE" | while read -r name; do
      container_config=$(jq -c --arg name "$name" '.[$name]' "$DEC_FILE")

      image="${images_map[$name]}"
      if [[ -z "$image" ]]; then
        log "Warning: No image found in unencrypted config for container '$name', skipping"
        continue
      fi

      container_def=$(jq -n --argjson cfg "$container_config" --arg img "$image" --arg name "$name" \
        '$cfg + {name: $name, image: $img}')

      run_container "$container_def"
    done

    log "Sleeping for $POLL_INTERVAL seconds..."
    sleep "$POLL_INTERVAL"
  done
}

main_loop
