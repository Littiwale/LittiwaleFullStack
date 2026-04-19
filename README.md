# Littiwale Ordering System

This repository contains the Littiwale web ordering system.

## What is included

- `index.html`, storefront pages, and customer flows
- `admin/index.html` and admin panel scripts
- `rider/index.html` and rider panel pages
- `src/` client-side application source
- `functions/` Firebase Cloud Functions backend
- `scripts/` small tooling scripts for migration and import

## Setup

1. Copy `.env.example` to `.env`
2. Add your Firebase web SDK values and optional backend variables.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run development server:
   ```bash
   npm run dev
   ```

## Notes

- Do not commit `.env` or `service-account.json`.
- The root `package.json` is used for the web app.
- The `functions/` folder has its own `package.json` and backend dependencies.
- The legacy import script may use `GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_SERVICE_ACCOUNT`.
