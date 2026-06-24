# Production Deployment

Use this path for production: build once on a trusted build machine, then deploy a tarball to Linux. The production server does not need Vite, pnpm, TypeScript, or build tooling.

## Build The Artifact

On your build machine:

```bash
corepack pnpm build:artifact
```

This creates:

```text
artifacts/oci-sql-migration-app-<timestamp>.tar.gz
```

The artifact contains:

- `dist/` production frontend and server bundle
- `node_modules/` production dependencies only
- production-only `package.json` and lockfile for traceability
- `install.sh` production installer

## Install On Linux

Copy the artifact to the Linux server:

```bash
tar -xzf oci-sql-migration-app-<timestamp>.tar.gz
sudo ./install.sh
```

The installer creates:

- app directory: `/opt/oci-sql-migration-app`
- environment file: `/etc/oci-sql-migration-app.env`
- systemd service: `oci-sql-migration-app`

## Required Production Environment

Edit `/etc/oci-sql-migration-app.env` after install:

```bash
NODE_ENV=production
PORT=3000
PERSISTENCE_MODE=oci

ADMIN_USERNAME=admin
ADMIN_PASSWORD=<set-strong-admin-password>
ADMIN_SESSION_SECRET=<set-long-random-session-secret>

ATP_USER=SQLAPP
ATP_PASSWORD=<set-sqlapp-password>
ATP_CONNECTION_STRING=(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.us-ashburn-1.oraclecloud.com))(connect_data=(service_name=gd3e6af0af13349_sqlassessment_tp.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))

OCI_REGION=us-ashburn-1
OCI_OBJECT_STORAGE_BUCKET=sqlappbucket
OCI_OBJECT_STORAGE_BUCKET_OCID=ocid1.bucket.oc1.iad.aaaaaaaaw6pkn3oasyos63zyeaguwwspvltqr3tnsiaydqrvzn6cttsecnva
OCI_OBJECT_STORAGE_NAMESPACE=<set-object-storage-namespace>
OCI_S3_ACCESS_KEY_ID=<set-customer-secret-key-access-key>
OCI_S3_SECRET_ACCESS_KEY=<set-customer-secret-key-secret>

OAUTH_SERVER_URL=
DATABASE_URL=
```

`ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` are required for production admin access. The admin dashboard uses a server-issued HttpOnly session cookie; assessment history APIs require admin authentication.

Restart after editing:

```bash
sudo systemctl restart oci-sql-migration-app
```

## Data Storage

- ATP table: `SQLAPP_ASSESSMENTS`
- Object Storage bucket: `sqlappbucket`
- Object key pattern: `assessments/YYYY-MM/<assessment-id>.json`

The app creates the ATP table automatically on first successful save.

## Operations

```bash
sudo systemctl status oci-sql-migration-app
sudo journalctl -u oci-sql-migration-app -f
sudo systemctl restart oci-sql-migration-app
```

## Notes

Object Storage currently uses OCI Object Storage's S3-compatible endpoint. That requires an Object Storage namespace plus a customer secret key pair for the runtime identity. If you want instance principal/resource principal auth instead, the storage adapter can be swapped without changing the app UI.
