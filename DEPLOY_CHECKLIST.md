# Deployment Checklist

## Environment variables

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

Optional:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `FIREBASE_SERVICE_ACCOUNT`
- `GOOGLE_APPLICATION_CREDENTIALS`

## Build and deploy

1. Install dependencies:
   ```bash
   npm install
   ```
2. Verify build:
   ```bash
   npm run build
   ```
3. Ensure static pages are served correctly for all routes:
   - `/`
   - `/login`
   - `/admin`
   - `/rider`
   - `/customer`
   - `/menu`
   - `/track`

## Security

- Confirm `.env` and local secrets are not tracked.
- Confirm `service-account.json` is excluded.
- Confirm client Firebase config uses environment variables only.

## Production readiness

- Confirm `admin/index.html` loads admin UI safely.
- Confirm `rider/index.html` loads rider UI safely.
- Confirm `src/firebase/config.js` does not initialize Firebase without required env values.
- Confirm `functions/` backend code runs with the expected Node version.
