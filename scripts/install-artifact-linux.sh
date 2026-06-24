#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-oci-sql-migration-app}"
APP_DIR="${APP_DIR:-/opt/${APP_NAME}}"
SERVICE_NAME="${SERVICE_NAME:-${APP_NAME}}"
APP_USER="${APP_USER:-oci-sql-app}"
PORT="${PORT:-3000}"
ENV_FILE="${ENV_FILE:-/etc/${APP_NAME}.env}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root, for example: sudo ./install.sh"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 22 or newer is required on the server."
  exit 1
fi

if ! command -v systemctl >/dev/null 2>&1; then
  echo "systemd is required for service installation."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_APP_DIR="${SCRIPT_DIR}/app"
NODE_BIN="$(command -v node)"

if [[ ! -d "${SOURCE_APP_DIR}/dist" || ! -d "${SOURCE_APP_DIR}/node_modules" ]]; then
  echo "Invalid artifact. Expected app/dist and app/node_modules next to install.sh."
  exit 1
fi

echo "Installing ${APP_NAME} into ${APP_DIR}"
id -u "${APP_USER}" >/dev/null 2>&1 || useradd --system --home-dir "${APP_DIR}" --shell /usr/sbin/nologin "${APP_USER}"

rm -rf "${APP_DIR}"
mkdir -p "${APP_DIR}"
cp -R "${SOURCE_APP_DIR}/." "${APP_DIR}/"
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

if [[ ! -f "${ENV_FILE}" ]]; then
  cat > "${ENV_FILE}" <<'ENV'
NODE_ENV=production
PORT=3000
PERSISTENCE_MODE=oci

ADMIN_USERNAME=admin
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=

ATP_USER=SQLAPP
ATP_PASSWORD=
ATP_CONNECTION_STRING="(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.us-ashburn-1.oraclecloud.com))(connect_data=(service_name=gd3e6af0af13349_sqlassessment_tp.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"

OCI_REGION=us-ashburn-1
OCI_OBJECT_STORAGE_BUCKET=sqlappbucket
OCI_OBJECT_STORAGE_BUCKET_OCID=ocid1.bucket.oc1.iad.aaaaaaaaw6pkn3oasyos63zyeaguwwspvltqr3tnsiaydqrvzn6cttsecnva
OCI_OBJECT_STORAGE_NAMESPACE=
OCI_S3_ACCESS_KEY_ID=
OCI_S3_SECRET_ACCESS_KEY=

OAUTH_SERVER_URL=
DATABASE_URL=
ENV
  chmod 600 "${ENV_FILE}"
  echo "Created ${ENV_FILE}. Edit it and set ADMIN_PASSWORD, ADMIN_SESSION_SECRET, ATP_PASSWORD, and Object Storage credentials before production use."
fi

cat > "/etc/systemd/system/${SERVICE_NAME}.service" <<SERVICE
[Unit]
Description=OCI Windows and SQL Server Migration Assessment App
After=network.target

[Service]
Type=simple
User=${APP_USER}
WorkingDirectory=${APP_DIR}
EnvironmentFile=${ENV_FILE}
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
echo "URL: http://localhost:${PORT}/"
echo "Environment file: ${ENV_FILE}"
echo "Service status: systemctl status ${SERVICE_NAME}"
