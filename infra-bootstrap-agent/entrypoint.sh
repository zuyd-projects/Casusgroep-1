#!/bin/bash

set -euo pipefail

KEY_PATH="/app/private.key"
CONFIG_DIR="/tmp/bootstrap"
LOG_FILE="/var/log/bootstrap-agent.log"
POLL_INTERVAL=600  # 10 minutes

CONFIG_URL="https://raw.githubusercontent.com/zuyd-projects/Casusgroep-1/main/infra/configs/${HOSTNAME}.json"
ENC_CONFIG_URL="https://raw.githubusercontent.com/zuyd-projects/Casusgroep-1/main/infra/configs/${HOSTNAME}.enc"
JSON_FILE="$CONFIG_DIR/${HOSTNAME}.json"
ENC_FILE="$CONFIG_DIR/${HOSTNAME}.enc"
DEC_FILE="$CONFIG_DIR/${HOSTNAME}.yml"

mkdir -p "$CONFIG_DIR"

log() {
  echo "$(date +'%Y-%m-%d %H:%M:%S') [bootstrap] $*" | tee -a "$LOG_FILE"
}

download_json() {
  log "Downloading unencrypted config for $HOSTNAME..."
  curl -fsSL "$CONFIG_URL" -o "$JSON_FILE"
}

download_encrypted() {
  log "Downloading encrypted config from $ENC_CONFIG_URL..."
  curl -fsSL "$ENC_CONFIG_URL" -o "$ENC_FILE"
}

decrypt_config() {
  log "Decrypting config..."
  openssl rsautl -decrypt -inkey "$KEY_PATH" -in "$ENC_FILE" -out "$DEC_FILE"
}

run_container() {
  IMAGE=$(jq -r '.image' "$JSON_FILE")
  NAME=$(echo "$IMAGE" | tr '/:.' '_')  # Safe container name

  log "Running container $NAME with image $IMAGE"

  CMD=(docker run -d --rm --name "$NAME")

  # Ports
  for port in $(yq '.ports[]' "$DEC_FILE"); do
    CMD+=(-p "$port")
  done

  # Volumes
  for vol in $(yq '.volumes[]' "$DEC_FILE"); do
    CMD+=(-v "$vol")
  done

  # Env vars
  for key in $(yq '.env | keys | .[]' "$DEC_FILE"); do
    val=$(yq ".env.\"$key\"" "$DEC_FILE")
    CMD+=(-e "$key=$val")
  done

  CMD+=("$IMAGE")

  # Stop and remove old container if exists
  docker rm -f "$NAME" 2>/dev/null || true

  "${CMD[@]}"
}

main_loop() {
  last_checksum=""
  last_image=""

  while true; do
    download_json
    download_encrypted
    decrypt_config

    # Get current image and config checksum
    current_image=$(jq -r '.image' "$JSON_FILE")
    current_checksum=$(sha256sum "$DEC_FILE" | awk '{print $1}')

    if [[ "$current_image" != "$last_image" || "$current_checksum" != "$last_checksum" ]]; then
      log "Change detected (image or config), restarting container..."
      run_container
      last_image="$current_image"
      last_checksum="$current_checksum"
    else
      log "No changes detected."
    fi

    log "Sleeping for $(($POLL_INTERVAL / 60)) minutes..."
    sleep "$POLL_INTERVAL"
  done
}

main_loop