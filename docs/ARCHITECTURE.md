# Architecture

## Phase 1
- Electron shell hosts a React/TypeScript renderer.
- Renderer uses local state (Zustand) for module routing and navigation history.
- Preload exposes a minimal safe API for non-sensitive UI hints.

## Phase 2 (Current)
- Added local Node/Express bridge service in `bridge/`.
- Added `POST /assistant/command` API with typed structured responses.
- Added `GET /config` and `POST /config` APIs backed by local JSON storage.
- Help screen now uses bridge responses and risk-level UI banners.
- Family and Internet screens now load contacts/favorites from bridge configuration.
- Reminder count in the launcher header now reflects bridge configuration data.
- Added an Admin Settings UI that updates the shared config via bridge APIs.
- Assistant behavior remains mocked and policy-limited.

## Phase 3 (Planned)
- Replace mock bridge assistant with OpenClaw adapter.
- Enforce stronger policy checks and configurable guardrails.
- Add support escalation workflows and richer action confirmations.
