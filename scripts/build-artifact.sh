#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-oci-sql-migration-app}"
ARTIFACT_DIR="${ARTIFACT_DIR:-artifacts}"
PNPM_VERSION="${PNPM_VERSION:-10.4.1}"
VERSION_TAG="${VERSION_TAG:-$(date +%Y%m%d%H%M%S)}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAGE_DIR="$(mktemp -d)"
APP_STAGE="${STAGE_DIR}/app"
ARTIFACT_NAME="${APP_NAME}-${VERSION_TAG}.tar.gz"

cleanup() {
  rm -rf "${STAGE_DIR}"
}
trap cleanup EXIT

cd "${ROOT_DIR}"

echo "Preparing pnpm ${PNPM_VERSION}"
corepack prepare "pnpm@${PNPM_VERSION}" --activate

echo "Installing build dependencies from lockfile"
corepack pnpm install --frozen-lockfile

echo "Building production bundle"
corepack pnpm build

mkdir -p "${APP_STAGE}" "${ARTIFACT_DIR}"

cp package.json pnpm-lock.yaml "${APP_STAGE}/"
cp -R dist "${APP_STAGE}/dist"
cp -R patches "${APP_STAGE}/patches"

echo "Installing production dependencies into artifact"
(
  cd "${APP_STAGE}"
  corepack pnpm install --prod --frozen-lockfile
)

APP_STAGE="${APP_STAGE}" node --input-type=module <<'NODE'
import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

delete pkg.devDependencies;
pkg.scripts = {
  start: "NODE_ENV=production node dist/index.js",
};

fs.writeFileSync(process.env.APP_STAGE + "/package.json", `${JSON.stringify(pkg, null, 2)}\n`);
NODE

cp "${ROOT_DIR}/scripts/install-artifact-linux.sh" "${STAGE_DIR}/install.sh"
chmod +x "${STAGE_DIR}/install.sh"

tar -czf "${ARTIFACT_DIR}/${ARTIFACT_NAME}" -C "${STAGE_DIR}" .

echo
echo "Created artifact: ${ARTIFACT_DIR}/${ARTIFACT_NAME}"
echo "Copy it to a Linux server, extract it, then run: sudo ./install.sh"
