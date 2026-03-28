# Architecture

## Phase 1
- Electron shell hosts a React/TypeScript renderer.
- Renderer uses local state (Zustand) for module routing and navigation history.
- Preload exposes a minimal safe API for non-sensitive UI hints.

## Phase 2 (Current)
- Added local Node/Express bridge service in `bridge/`.
- Added `POST /assistant/command` API with typed structured responses.
- Added `GET /config` and `POST /config` APIs backed by local JSON storage.
- Added `POST /config/reset` for restoring safe default configuration.
- Added `POST /support/request` and `GET /support/logs` for support escalation tracking.
- Added `POST /support/logs/:id/close` for admin ticket lifecycle control.
- Help screen now uses bridge responses and risk-level UI banners.
- Help screen now submits support requests and displays recent support tickets.
- Family and Internet screens now load contacts/favorites from bridge configuration.
- Reminder count in the launcher header now reflects bridge configuration data.
- Added an Admin Settings UI that updates the shared config via bridge APIs.
- Added module visibility policy controls and strict safety-mode assistant behavior.
- Settings now includes a support activity panel for closing open tickets.
- Added a config-driven admin PIN gate for opening Settings.
- Added a global safety-mode banner and strict-mode blocking for direct unknown web entry.
- Replaced email placeholder with guided inbox/read/reply flow including suspicious-email warning states.
- Family contact actions now route into core modules and respect module visibility policies.
- Assistant behavior remains mocked and policy-limited.

## Phase 3 (Planned)
- Replace mock bridge assistant with OpenClaw adapter.
- Enforce stronger policy checks and configurable guardrails.
- Add support escalation workflows and richer action confirmations.
