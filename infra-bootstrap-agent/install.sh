#!/bin/bash
set -euo pipefail

# Configurable variables
SCRIPT_URL="https://raw.githubusercontent.com/zuyd-projects/Casusgroep-1/main/infra-bootstrap-agent/agent.sh"
INSTALL_DIR="/usr/local/bin"
SERVICE_NAME="bootstrap-agent"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
GITHUB_TOKEN=$(cat /opt/github.token)

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
  
  curl -fsSL "${headers[@]}" "${full_url}" -o "${output}"
}

# Step 1: Install dependencies
echo "[INFO] Installing required packages..."
sudo apt-get update && sudo apt-get install -y bash curl openssl jq

# Step 2: Download the bootstrap-agent script
echo "[INFO] Downloading bootstrap agent script..."
download_file "$SCRIPT_URL" "${INSTALL_DIR}/${SERVICE_NAME}.sh"
chmod +x "${INSTALL_DIR}/${SERVICE_NAME}.sh"

# Step 3: Create the systemd service unit
echo "[INFO] Creating systemd service file at ${SERVICE_FILE}..."
cat <<EOF | sudo tee "$SERVICE_FILE" > /dev/null
[Unit]
Description=Bootstrap Agent Service
After=network.target docker.service
Requires=docker.service

[Service]
ExecStart=${INSTALL_DIR}/${SERVICE_NAME}.sh
Restart=always
User=root

[Install]
WantedBy=multi-user.target
EOF

# Step 4: Reload systemd and enable/start the service
echo "[INFO] Enabling and starting the ${SERVICE_NAME} service..."
sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE_NAME"
sudo systemctl start "$SERVICE_NAME"

echo "[SUCCESS] Bootstrap agent installed and running as a systemd service."