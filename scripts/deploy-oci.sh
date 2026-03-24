#!/bin/bash

# OCI API Gateway Deployment Script
# This script builds and deploys the SQL Migration app to OCI API Gateway
# 
# Usage: ./scripts/deploy-oci.sh
# 
# Prerequisites:
# - Node.js and npm installed
# - SSH access to OCI instance
# - API Gateway URL configured

set -e

# Configuration
API_GATEWAY_URL="https://ozmis5wf2qkcpdc3sadsajokey.apigateway.us-ashburn-1.oci.customer-oci.com"
OAUTH_PORTAL_URL="https://api.manus.im"
OCI_HOST="141.148.66.226"
OCI_PORT="3001"

echo "🚀 OCI SQL Migration App Deployment"
echo "=================================="
echo ""
echo "API Gateway URL: $API_GATEWAY_URL"
echo "OAuth Portal URL: $OAUTH_PORTAL_URL"
echo ""

# Step 1: Clean old build
echo "1️⃣  Cleaning old build..."
rm -rf dist

# Step 2: Build with API Gateway URLs
echo "2️⃣  Building with API Gateway configuration..."
VITE_OAUTH_PORTAL_URL="$OAUTH_PORTAL_URL" \
VITE_API_HOST="$API_GATEWAY_URL" \
VITE_API_URL="$API_GATEWAY_URL" \
VITE_BASE_URL="$API_GATEWAY_URL" \
npm run build

echo ""
echo "✅ Build complete!"
echo ""
echo "3️⃣  Next steps for OCI instance:"
echo "   SSH to your OCI instance and run:"
echo ""
echo "   cd /home/ubuntu/oci-sql-migration-app"
echo "   git pull origin main"
echo "   npm run build"
echo "   pkill -9 -f 'node dist' 2>/dev/null || true"
echo "   sleep 2"
echo "   nohup bash -c 'PORT=$OCI_PORT NODE_ENV=production OAUTH_SERVER_URL=$OAUTH_PORTAL_URL node dist/index.js' > app.log 2>&1 &"
echo ""
echo "4️⃣  Test the deployment:"
echo "   curl -s $API_GATEWAY_URL | head -20"
echo ""
