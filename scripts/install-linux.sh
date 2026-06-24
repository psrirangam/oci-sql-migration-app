#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-oci-sql-migration-app}"
APP_DIR="${APP_DIR:-/opt/${APP_NAME}}"
SERVICE_NAME="${SERVICE_NAME:-${APP_NAME}}"
APP_USER="${APP_USER:-oci-sql-app}"
PORT="${PORT:-3000}"
PNPM_VERSION="${PNPM_VERSION:-10.4.1}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root, for example: sudo bash scripts/install-linux.sh"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 22 or newer is required before running this installer."
  echo "Install Node.js from your approved Linux package source, then rerun this script."
  exit 1
fi

if ! command -v corepack >/dev/null 2>&1; then
  echo "Corepack is required and should be included with modern Node.js installs."
  exit 1
fi

if ! command -v systemctl >/dev/null 2>&1; then
  echo "systemd is required for one-command service installation."
  exit 1
fi

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_BIN="$(command -v node)"

echo "Installing ${APP_NAME} into ${APP_DIR}"
id -u "${APP_USER}" >/dev/null 2>&1 || useradd --system --home-dir "${APP_DIR}" --shell /usr/sbin/nologin "${APP_USER}"

mkdir -p "${APP_DIR}"

if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete \
    --exclude ".git" \
    --exclude "node_modules" \
    --exclude "dist" \
    --exclude ".manus-logs" \
    "${SOURCE_DIR}/" "${APP_DIR}/"
else
  tar \
    --exclude ".git" \
    --exclude "node_modules" \
    --exclude "dist" \
    --exclude ".manus-logs" \
    -C "${SOURCE_DIR}" -cf - . | tar -C "${APP_DIR}" -xf -
fi

cd "${APP_DIR}"

echo "Preparing pnpm ${PNPM_VERSION}"
corepack prepare "pnpm@${PNPM_VERSION}" --activate

echo "Installing locked dependencies"
corepack pnpm install --frozen-lockfile

echo "Building production bundle"
corepack pnpm build

chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

cat > "/etc/systemd/system/${SERVICE_NAME}.service" <<SERVICE
[Unit]
Description=OCI SQL Migration Assessment App
After=network.target

[Service]
Type=simple
User=${APP_USER}
WorkingDirectory=${APP_DIR}
Environment=NODE_ENV=production
Environment=PORT=${PORT}
Environment=OAUTH_SERVER_URL=
Environment=DATABASE_URL=
ExecStart=${NODE_BIN} ${APP_DIR}/dist/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable "${SERVICE_NAME}"
systemctl restart "${SERVICE_NAME}"

echo
echo "Installed and started ${SERVICE_NAME}."
echo "Local URL: http://localhost:${PORT}/"
echo "Service status: systemctl status ${SERVICE_NAME}"
