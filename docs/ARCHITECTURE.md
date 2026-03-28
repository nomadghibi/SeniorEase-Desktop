# Architecture

## Phase 1 (Current)
- Electron shell hosts a React/TypeScript renderer.
- Renderer uses local state (Zustand) for module routing and navigation history.
- Preload exposes a minimal safe API for non-sensitive UI hints.

## Phase 2 (Planned)
- Add local Node/Express bridge service in `bridge/`.
- Add structured assistant command contract between UI and bridge.

## Phase 3 (Planned)
- Add OpenClaw adapter behind bridge service with strict guardrails.
