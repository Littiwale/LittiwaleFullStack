# Security Guidelines

## Secrets

- Never commit `.env`, `.env.local`, or `service-account.json`.
- `.gitignore` now includes `.env*` and `service-account.json`.

## Firebase

- Client-side Firebase config is loaded from `import.meta.env` in `src/firebase/config.js`.
- Backend functions should use environment credentials via `GOOGLE_APPLICATION_CREDENTIALS` or local service account only when needed.

## Local admin tooling

- `scripts/import-legacy-announcements.mjs` now supports:
  - `FIREBASE_SERVICE_ACCOUNT` as JSON string
  - `GOOGLE_APPLICATION_CREDENTIALS` path to credentials file
  - standard Application Default Credentials when available

## Best practices

- Use strong secrets and rotate them if accidentally exposed.
- Keep production credentials out of source control.
