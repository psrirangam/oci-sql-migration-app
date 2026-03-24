# OCI API Gateway Deployment Guide

This document explains how to deploy the SQL Migration Assessment app to Oracle Cloud Infrastructure (OCI) API Gateway.

## Overview

The app is deployed as follows:
- **Frontend**: Built React app served from OCI instance (port 3001)
- **Backend**: Express.js server on OCI instance (port 3001)
- **Gateway**: OCI API Gateway routes requests to the backend

## Critical Environment Variables

The following environment variables **MUST** be set during the build process:

```bash
VITE_OAUTH_PORTAL_URL="https://api.manus.im"
VITE_API_HOST="https://ozmis5wf2qkcpdc3sadsajokey.apigateway.us-ashburn-1.oci.customer-oci.com"
VITE_API_URL="https://ozmis5wf2qkcpdc3sadsajokey.apigateway.us-ashburn-1.oci.customer-oci.com"
VITE_BASE_URL="https://ozmis5wf2qkcpdc3sadsajokey.apigateway.us-ashburn-1.oci.customer-oci.com"
```

### Why These Variables Matter

- **VITE_API_HOST**: Tells the frontend where to send API requests (the API Gateway URL)
- **VITE_API_URL**: Alternative API URL configuration
- **VITE_BASE_URL**: Base URL for the application (ensures correct routing)
- **VITE_OAUTH_PORTAL_URL**: OAuth authentication endpoint

## Build Process

### Local Build (for testing)

```bash
# Clean old build
rm -rf dist

# Build with API Gateway URLs
VITE_OAUTH_PORTAL_URL="https://api.manus.im" \
VITE_API_HOST="https://ozmis5wf2qkcpdc3sadsajokey.apigateway.us-ashburn-1.oci.customer-oci.com" \
VITE_API_URL="https://ozmis5wf2qkcpdc3sadsajokey.apigateway.us-ashburn-1.oci.customer-oci.com" \
VITE_BASE_URL="https://ozmis5wf2qkcpdc3sadsajokey.apigateway.us-ashburn-1.oci.customer-oci.com" \
npm run build
```

### Using the Deployment Script

```bash
chmod +x scripts/deploy-oci.sh
./scripts/deploy-oci.sh
```

## OCI Instance Deployment

### 1. SSH to Your OCI Instance

```bash
ssh -i your-key.pem ubuntu@141.148.66.226
```

### 2. Pull Latest Changes

```bash
cd /home/ubuntu/oci-sql-migration-app
git pull origin main
```

### 3. Build the App

```bash
npm run build
```

### 4. Stop Old Process

```bash
ps aux | grep "node dist" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null || true
sleep 2
```

### 5. Start the App

```bash
nohup bash -c 'PORT=3001 NODE_ENV=production OAUTH_SERVER_URL=https://api.manus.im node dist/index.js' > app.log 2>&1 &
```

### 6. Verify Deployment

```bash
# Check if running
ps aux | grep node | grep -v grep

# Check logs
tail -10 app.log

# Test locally
curl -s http://localhost:3001/ | head -20

# Test via API Gateway
curl -s https://ozmis5wf2qkcpdc3sadsajokey.apigateway.us-ashburn-1.oci.customer-oci.com/ | head -20
```

## OCI API Gateway Configuration

The API Gateway is configured with:

- **Path**: `/{item*}` (wildcard to catch all routes)
- **Backend URL**: `http://141.148.66.226:3001`
- **Methods**: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS

This configuration ensures all requests (including asset requests) are properly routed to the backend.

## Troubleshooting

### 500 Error from API Gateway

If you see a 500 error, check:

1. **App is running**: `ps aux | grep node`
2. **Logs for errors**: `tail -50 app.log`
3. **Environment variables are set**: Verify the build used the correct `VITE_*` variables
4. **API Gateway route configuration**: Ensure path is `/{item*}` and URL is correct

### Assets Not Loading (404 errors)

This typically means:

1. **Build didn't use relative paths**: Ensure `base: './'` in `vite.config.ts`
2. **Environment variables missing**: Rebuild with the correct `VITE_*` variables
3. **API Gateway route not configured for wildcards**: Check that path is `/{item*}`

### App Works Locally but Not via API Gateway

This means the API Gateway routing is misconfigured. Verify:

1. API Gateway path is `/{item*}`
2. Backend URL is `http://141.148.66.226:3001`
3. App is running on port 3001

## Testing

Run the test suite to verify configuration:

```bash
npm test -- api-gateway.test.ts
```

This tests that all required environment variables are properly configured.

## Git Workflow

After making changes:

1. Commit changes locally
2. Push to GitHub
3. Pull on OCI instance
4. Rebuild and restart

```bash
git add .
git commit -m "Your message"
git push origin main

# On OCI instance:
cd /home/ubuntu/oci-sql-migration-app
git pull origin main
npm run build
# Restart process (see step 4-5 above)
```

## Deployment Checklist

- [ ] Environment variables set correctly during build
- [ ] App builds without errors
- [ ] App starts on port 3001
- [ ] App responds to `http://localhost:3001`
- [ ] API Gateway responds to `https://ozmis5wf2qkcpdc3sadsajokey.apigateway.us-ashburn-1.oci.customer-oci.com`
- [ ] Assets load correctly (check browser console for 404s)
- [ ] API endpoints respond correctly
- [ ] Tests pass: `npm test -- api-gateway.test.ts`

## Support

For issues, check:

1. App logs: `tail -50 app.log`
2. Browser console for errors
3. Network tab for failed requests
4. OCI API Gateway logs in OCI Console
