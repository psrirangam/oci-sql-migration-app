# Standalone Linux Deployment

This app can run as a self-contained internal Oracle assessment tool without OAuth, API Gateway, or external application services.

For production, use [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md). That path builds a tarball once and installs only the runtime artifact on Linux, so the server does not need Vite, pnpm, TypeScript, or build tooling.

This standalone installer is kept for development or isolated demos where building on the target server is acceptable. It is not the recommended production path.

## What the Installer Does

- Copies the app to `/opt/oci-sql-migration-app`
- Installs dependencies from the lockfile with Corepack and pnpm
- Builds the frontend and Node server into `dist` on the target server
- Creates a locked-down system user named `oci-sql-app`
- Registers and starts a systemd service
- Runs with `OAUTH_SERVER_URL` and `DATABASE_URL` empty, which enables standalone mode

## Server Prerequisites

- Linux server with systemd
- Node.js 22 or newer
- Corepack, included with modern Node.js
- Network access during install to download npm packages

No database server, OAuth service, object storage service, or external API gateway is required at runtime.

## Development/Demo Install

From the repository directory on the Linux server:

```bash
sudo bash scripts/install-linux.sh
```

The app starts on port `3000` by default:

```bash
http://localhost:3000/
```

## Custom Port or Install Path

```bash
sudo PORT=8080 APP_DIR=/opt/oci-sql-assessment bash scripts/install-linux.sh
```

## Service Commands

```bash
sudo systemctl status oci-sql-migration-app
sudo systemctl restart oci-sql-migration-app
sudo journalctl -u oci-sql-migration-app -f
```

## Runtime Mode

Standalone mode is intended for internal demos and field migration planning. Assessment history is stored in the browser for local export. If shared server-side history is required later, add local file-backed storage or SQLite before enabling multi-user production use.
