# SeniorEase Desktop

SeniorEase Desktop is a senior-first Windows launcher built with Electron, React, TypeScript, and Tailwind CSS.

Current implementation includes:
- Phase 1 launcher UI scaffold (fullscreen shell + large modules + sticky nav)
- Phase 2 local bridge service scaffold (Node/Express)
- Help screen assistant integration using structured mock command responses
- Risk-level banners (`safe`, `caution`, `blocked`) for assistant guidance
- Bridge-backed configuration loading for reminders, family contacts, and internet favorites
- Admin Settings screen for editing and saving configuration data
- Module visibility policy controls with locked Help/Settings
- Support escalation API + recent support request logs in Help
- Strict safety mode behavior that upgrades caution actions to blocked

## Project Structure

```txt
seniorease-desktop/
|- app/        # Electron + React desktop launcher
|- bridge/     # Local Node/Express assistant bridge (mock)
|- docs/       # Product and architecture docs
```

## Run Locally (Windows + VS Code)

1. Open VS Code.
2. Open folder: `C:\Users\<you>\Documents\seniorease-desktop`
3. In terminal, install dependencies:

```powershell
npm install
npm --prefix app install
npm --prefix bridge install
```

4. Start both bridge + desktop app together:

```powershell
npm run dev
```

Services started:
- Bridge API: `http://localhost:8787`
- Vite renderer: `http://localhost:5173`
- Electron window: opens automatically in fullscreen

## Helpful Commands

```powershell
npm run typecheck
npm run build
```

## Mock Assistant API

Endpoint:
- `POST /assistant/command`
- `GET /config`
- `POST /config`
- `POST /support/request`
- `GET /support/logs`

Sample payload:

```json
{
  "userId": "local-user-1",
  "sessionId": "phase2-session",
  "command": "Is this safe?",
  "context": {
    "screen": "help"
  }
}
```

Mock commands implemented:
- Open my email
- Read this email
- Show my photos
- Is this safe?
- Call support

Sample config update payload:

```json
{
  "internetFavorites": ["Church Website", "Local Weather", "Family Photos"],
  "safetyMode": "strict"
}
```

## Notes

- OpenClaw is still not integrated; this phase uses a mock bridge response layer.
- High-risk actions are not automated and are represented as caution/blocked flows.
- Voice actions remain placeholder-only in this phase.
