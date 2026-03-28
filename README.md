# SeniorEase Desktop

SeniorEase Desktop is a senior-first Windows launcher built with Electron, React, TypeScript, and Tailwind CSS.

## Residential-First Direction

This project follows a residential-first product spec:
- Home user and caregiver simplicity first
- One local admin model (PIN + shared household config)
- OpenClaw integration staged later behind adapter boundaries

Roadmap and build packs:
- PRD: `docs/PRD.md`
- Build packs: `docs/BUILD_PACKS.md`
- OpenClaw staging: `docs/OPENCLAW_INTEGRATION.md`

Current implementation includes:
- Phase 1 launcher UI scaffold (fullscreen shell + large modules + sticky nav)
- Phase 2 local bridge service scaffold (Node/Express)
- Help screen assistant integration using structured mock command responses
- Risk-level banners (`safe`, `caution`, `blocked`) for assistant guidance
- Bridge-backed configuration loading for reminders, family contacts, and internet favorites
- Admin Settings screen for editing and saving configuration data
- Module visibility policy controls with locked Help/Settings
- Support escalation API + recent support request logs in Help
- Admin support ticket activity section with close-ticket action
- Strict safety mode behavior that upgrades caution actions to blocked
- Settings PIN lock flow with configurable 4-8 digit admin PIN
- Config export/import and reset-to-default workflows for repeatable support setups
- Global safety mode banner and strict-mode Internet guardrail behavior
- Email module upgraded with inbox workflow, suspicious warnings, and confirmation-based actions
- Family module quick actions now route to Email/Video Call/Photos with policy-aware guidance
- Assistant now enforces module visibility policy when interpreting commands
- Photos module upgraded with album views, slideshow controls, and share-to-family flow
- Video Call module upgraded with family shortcuts, saved meetings, and confirmation prompts
- Facebook module upgraded with guided actions and suspicious-message safety prompts
- Help assistant now routes commands to Email/Photos/Internet/Facebook/Video Call/Family modules
- Help screen now supports optional voice command capture (browser speech API)
- Internet favorites now use label + URL + trusted flags with stricter open-site safety checks
- Home screen reminders are now interactive (snooze/mark-done) with config persistence
- Configurable web guardrails for direct website entry and untrusted favorites
- Family contacts now support direct email, message, and call shortcuts with safe fallbacks
- Top-bar weather now shows live conditions by configured 5-digit ZIP code
- Bridge assistant now runs through a pluggable adapter (mock today, OpenClaw-ready later)
- Assistant now keeps session memory per `sessionId` for follow-up commands like "open it" and "call them"

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
- `POST /config/reset`
- `GET /weather/current?zip=10001`
- `POST /admin/verify-pin`
- `POST /support/request`
- `GET /support/logs`
- `POST /support/logs/:id/close`

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
- Help with printer
- Take me to my church website
- Call Fred / Call support
- Is this safe?
- Call support

Sample config update payload:

```json
{
  "internetFavorites": ["Church Website", "Local Weather", "Family Photos"],
  "safetyMode": "strict",
  "webGuardrails": {
    "directWebsiteEntry": "block",
    "untrustedFavorite": "confirm"
  },
  "requireAdminPin": true,
  "adminPin": "2468"
}
```

`GET /config` responses expose `adminPinConfigured` and never include a plain-text PIN.

## Notes

- OpenClaw is still not integrated; this phase uses a mock bridge response layer.
- Assistant provider defaults to `mock` (set `ASSISTANT_PROVIDER=openclaw` to enable adapter path).
- OpenClaw adapter env vars:
  - `OPENCLAW_URL` (required when provider is `openclaw`)
  - `OPENCLAW_COMMAND_PATH` (optional, default `/assistant/command`)
  - `OPENCLAW_TIMEOUT_MS` (optional, default `7000`)
  - `OPENCLAW_MAX_FAILURES` (optional, default `3`)
  - `OPENCLAW_COOLDOWN_MS` (optional, default `120000`)
- High-risk actions are not automated and are represented as caution/blocked flows.
- Voice actions remain placeholder-only in this phase.
