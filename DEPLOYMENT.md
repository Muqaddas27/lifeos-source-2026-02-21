# Deployment Checklist

Use this checklist after every deployment to ensure register/login are working.

## 1) Environment Variables

### Frontend
- Set `VITE_API_BASE_URL` to your backend API base URL.
- Example: `https://api.yourdomain.com/api`

### Backend
- Set `JWT_SECRET` to a strong secret.
- Set `CORS_ORIGIN` to allowed frontend origins.
- Example: `https://app.yourdomain.com,https://staging.yourdomain.com`
- Set `NODE_ENV=production` in your hosting environment settings.

## 2) Build and Start

1. Install dependencies.
   - `npm install`
2. Build frontend assets.
   - `npm run build`
3. Start server.
   - `npm run start`

## 3) Verify Health

Run health check script against deployed API:

- PowerShell:
  - `$env:API_BASE_URL="https://api.yourdomain.com/api"; npm run check:health`
- Bash:
  - `API_BASE_URL="https://api.yourdomain.com/api" npm run check:health`

Expected output includes `HEALTH_OK`.

## 4) Verify Register/Login

Run auth smoke test against deployed API:

- PowerShell:
  - `$env:API_BASE_URL="https://api.yourdomain.com/api"; npm run check:auth`
- Bash:
  - `API_BASE_URL="https://api.yourdomain.com/api" npm run check:auth`

Expected output includes `AUTH_OK`.

## 5) If Check Fails with HTML Instead of JSON

- Confirm frontend `VITE_API_BASE_URL` points to backend API (must include `/api`).
- Confirm backend routes are deployed and reachable.
- Confirm reverse proxy / platform routing does not rewrite `/api/*` to frontend index.html.
- Confirm `CORS_ORIGIN` includes the exact frontend origin.

## 6) Quick Manual Endpoints

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
