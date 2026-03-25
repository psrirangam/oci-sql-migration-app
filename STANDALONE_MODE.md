# Standalone Mode (Guest Access)

The SQL Migration Assessment app now supports **Standalone Mode**, which allows you to run the app without OAuth authentication. This is perfect for:

- **Local development** without Manus OAuth setup
- **Demos** where you don't want to require login
- **Testing** assessment flows quickly
- **Offline deployments** without external dependencies

## How It Works

When `OAUTH_SERVER_URL` is not configured:

1. **Backend**: Automatically creates a "Guest User" on first request
2. **Frontend**: Skips OAuth login and goes directly to the app
3. **Database**: Guest user is stored with `openId: "local-guest-user"`

## Running in Standalone Mode

### Option 1: Local Development

```bash
# No need to set OAUTH_SERVER_URL
npm run dev
```

The app will start in standalone mode and auto-login as "Guest User".

### Option 2: Production Build (No OAuth)

```bash
# Build without OAuth environment variables
npm run build

# Start without OAUTH_SERVER_URL
PORT=3001 NODE_ENV=production node dist/index.js
```

### Option 3: Docker/OCI Deployment

```bash
# Start the app without OAUTH_SERVER_URL
nohup bash -c 'PORT=3001 NODE_ENV=production node dist/index.js' > app.log 2>&1 &
```

The app will automatically detect standalone mode and enable guest access.

## What's Different in Standalone Mode

| Feature | OAuth Mode | Standalone Mode |
|---------|-----------|-----------------|
| Login Required | Yes | No (auto-login) |
| User Identity | Manus OAuth | "Guest User" |
| Session Persistence | JWT Cookie | Database |
| External Dependencies | Manus OAuth | None |
| Use Case | Production | Dev/Demo |

## Enabling OAuth Later

To switch from standalone mode to OAuth:

1. Set `OAUTH_SERVER_URL` environment variable
2. Rebuild the app
3. Restart the server

```bash
OAUTH_SERVER_URL=https://api.manus.im npm run build
PORT=3001 NODE_ENV=production OAUTH_SERVER_URL=https://api.manus.im node dist/index.js
```

## Backend Changes

### SDK Initialization

```typescript
// In server/_core/sdk.ts
if (!ENV.oAuthServerUrl) {
  console.log("[OAuth] ⚠️  STANDALONE MODE: OAuth not configured. Running in guest mode.");
}
```

### Request Authentication

```typescript
// In server/_core/sdk.ts - authenticateRequest()
const isStandalone = !ENV.oAuthServerUrl;
if (isStandalone) {
  // Auto-login as guest user
  const guestOpenId = "local-guest-user";
  // ... create/fetch guest user ...
  return user;
}
```

## Frontend Changes

### Login URL

```typescript
// In client/src/const.ts - getLoginUrl()
if (!oauthPortalUrl) {
  return "/"; // Skip OAuth, go straight to app
}
```

## Testing Standalone Mode

```bash
# Run tests
npm test

# All tests pass, including:
# - API Gateway configuration tests
# - Auth logout tests
```

## Logs

When running in standalone mode, you'll see:

```
[OAuth] ⚠️  STANDALONE MODE: OAuth not configured. Running in guest mode.
Server running on http://localhost:3001/
```

## Troubleshooting

### "Guest User" not created

Check the database logs:
```bash
tail -50 app.log
```

### Still redirecting to OAuth

Make sure `OAUTH_SERVER_URL` is **not** set:
```bash
echo $OAUTH_SERVER_URL  # Should be empty
```

### Want to switch back to OAuth

Set the environment variable and rebuild:
```bash
export OAUTH_SERVER_URL=https://api.manus.im
npm run build
```

## Security Note

Standalone mode is intended for **development and demos only**. For production deployments with multiple users, use OAuth mode to ensure proper authentication and user isolation.
