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

The bridge currently uses a mock assistant service designed for safe, typed responses.
