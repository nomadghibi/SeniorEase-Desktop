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
- `POST /support/request`
- `GET /support/logs`
- `POST /support/logs/:id/close`

The bridge currently uses:
- a mock assistant service designed for safe, typed responses
- a local JSON config store at `bridge/data/config.json` for reminders, favorites, and contacts
- a local support log store at `bridge/data/support-logs.json`
