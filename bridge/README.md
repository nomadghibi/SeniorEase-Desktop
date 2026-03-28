# SeniorEase Bridge Service

Local Node/Express bridge used by the desktop UI for structured assistant commands.

## Run

```bash
npm install
npm run dev
```

Default URL: `http://localhost:8787`

## Endpoints

- `GET /health`
- `POST /assistant/command`
- `GET /config`
- `POST /config`
- `POST /config/reset`
- `POST /admin/verify-pin`
- `POST /support/request`
- `GET /support/logs`
- `POST /support/logs/:id/close`

## Admin-Protected Writes

- `POST /config` requires `x-admin-token` when changing protected fields and PIN lock is enabled.
- Reminder-only updates are allowed without admin token (for home-screen reminder actions).
- `POST /config/reset` requires `x-admin-token` when PIN lock is enabled.
- Obtain token from `POST /admin/verify-pin`.

The bridge currently uses:
- a mock assistant service designed for safe, typed responses
- a local JSON config store at `bridge/data/config.json` for reminders, URL-based favorites, contacts, module policy, and admin PIN settings
- a local support log store at `bridge/data/support-logs.json`
