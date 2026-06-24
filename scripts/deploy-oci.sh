#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-oci-sql-migration-app}"
SERVICE_NAME="${SERVICE_NAME:-${APP_NAME}}"
SSH_USER="${SSH_USER:-opc}"
SSH_HOST="${SSH_HOST:-129.153.14.126}"
SSH_KEY="${SSH_KEY:-/Users/pavansrirangam/Desktop/SSH/ps.key}"
REMOTE_TMP="${REMOTE_TMP:-/tmp/${APP_NAME}-deploy}"
ENV_SOURCE="${ENV_SOURCE:-.env}"
ARTIFACT_PATH="${ARTIFACT_PATH:-}"
PORT="${PORT:-3000}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

if [[ ! -f "${SSH_KEY}" ]]; then
  echo "SSH key not found: ${SSH_KEY}" >&2
  exit 1
fi

if [[ ! -f "${ENV_SOURCE}" ]]; then
  echo "Environment file not found: ${ENV_SOURCE}" >&2
  echo "Create ${ENV_SOURCE} from .env.example and set production secrets." >&2
  exit 1
fi

if [[ -z "${ARTIFACT_PATH}" ]]; then
  echo "Building production artifact"
  bash scripts/build-artifact.sh
  ARTIFACT_PATH="$(ls -t artifacts/${APP_NAME}-*.tar.gz | head -n 1)"
fi

if [[ ! -f "${ARTIFACT_PATH}" ]]; then
  echo "Artifact not found: ${ARTIFACT_PATH}" >&2
  exit 1
fi

echo "Deploying ${ARTIFACT_PATH} to ${SSH_USER}@${SSH_HOST}"

SSH_OPTS=(
  -i "${SSH_KEY}"
  -o IdentitiesOnly=yes
  -o StrictHostKeyChecking=accept-new
)

ssh "${SSH_OPTS[@]}" "${SSH_USER}@${SSH_HOST}" "rm -rf '${REMOTE_TMP}' && mkdir -p '${REMOTE_TMP}'"
scp "${SSH_OPTS[@]}" "${ARTIFACT_PATH}" "${SSH_USER}@${SSH_HOST}:${REMOTE_TMP}/app.tar.gz"
scp "${SSH_OPTS[@]}" "${ENV_SOURCE}" "${SSH_USER}@${SSH_HOST}:${REMOTE_TMP}/app.env"

ssh "${SSH_OPTS[@]}" "${SSH_USER}@${SSH_HOST}" "APP_NAME='${APP_NAME}' SERVICE_NAME='${SERVICE_NAME}' PORT='${PORT}' REMOTE_TMP='${REMOTE_TMP}' bash -s" <<'REMOTE'
set -euo pipefail

APP_NAME="${APP_NAME}"
SERVICE_NAME="${SERVICE_NAME}"
PORT="${PORT}"
REMOTE_TMP="${REMOTE_TMP}"
ENV_FILE="/etc/${APP_NAME}.env"

ensure_node() {
  if command -v node >/dev/null 2>&1; then
    major="$(node -p 'Number(process.versions.node.split(".")[0])')"
    if [[ "${major}" -ge 22 ]]; then
      return 0
    fi
  fi

  echo "Installing Node.js 22 runtime"
  if command -v dnf >/dev/null 2>&1; then
    curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
    sudo dnf install -y nodejs
  elif command -v yum >/dev/null 2>&1; then
    curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
    sudo yum install -y nodejs
  else
    echo "Could not install Node.js automatically. Install Node.js 22 and rerun." >&2
    exit 1
  fi
}

write_env_file() {
  tmp_env="${REMOTE_TMP}/merged.env"
  awk -v port="${PORT}" '
    BEGIN {
      print "NODE_ENV=production"
      print "PORT=" port
      print "PERSISTENCE_MODE=oci"
    }
    /^[[:space:]]*($|#)/ { next }
    {
      key=$0
      sub(/=.*/, "", key)
      if (key == "NODE_ENV" || key == "PORT" || key == "PERSISTENCE_MODE") next
      print $0
    }
  ' "${REMOTE_TMP}/app.env" > "${tmp_env}"

  sudo install -m 600 -o root -g root "${tmp_env}" "${ENV_FILE}"
}

ensure_node
write_env_file

rm -rf "${REMOTE_TMP}/extract"
mkdir -p "${REMOTE_TMP}/extract"
tar -xzf "${REMOTE_TMP}/app.tar.gz" -C "${REMOTE_TMP}/extract"

cd "${REMOTE_TMP}/extract"
sudo APP_NAME="${APP_NAME}" SERVICE_NAME="${SERVICE_NAME}" PORT="${PORT}" ./install.sh

echo "Verifying service"
sudo systemctl --no-pager --full status "${SERVICE_NAME}" || true
for attempt in {1..20}; do
  if curl -fsS "http://127.0.0.1:${PORT}/" >/dev/null; then
    break
  fi
  if [[ "${attempt}" -eq 20 ]]; then
    echo "Service did not respond on http://127.0.0.1:${PORT}/" >&2
    sudo journalctl -u "${SERVICE_NAME}" -n 80 --no-pager >&2 || true
    exit 1
  fi
  sleep 1
done

echo "Deployment complete on http://127.0.0.1:${PORT}/"
REMOTE

echo
echo "VM deployment complete."
echo "Internal app URL on VM: http://127.0.0.1:${PORT}/"
