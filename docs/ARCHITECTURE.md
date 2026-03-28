# Architecture (Residential-First)

## System Layers
1. `app/` Electron + React desktop launcher (senior-visible UX)
2. `bridge/` local Node/Express policy + assistant orchestration layer
3. Assistant backend through adapter (`mock` now, OpenClaw later)
4. Windows/web app handoff for email, browser, video, family actions

## Admin Model (Simplified)
- Single local admin surface in Settings
- PIN-gated admin access
- One household config profile (favorites, contacts, reminders, safety)
- Local export/import/reset for repeatable residential setup

## Revised Roadmap

### Phase 1: Launcher Foundation (Complete)
- Fullscreen launcher shell
- Large tile home UX + sticky nav
- Core module routing and senior-first visual system

### Phase 2: Bridge + Guided Assistant (Complete)
- Local bridge APIs for assistant/config/support/admin
- Structured assistant responses with risk levels
- Settings-driven policy controls and guardrails
- Support escalation workflows
- Configurable web safety + weather by ZIP
- Pluggable assistant adapter boundary

### Phase 3: Controlled OpenClaw Rollout (In Progress)
- Keep bridge contract stable (`/assistant/command`)
- Swap assistant execution from mock to OpenClaw adapter
- Preserve policy checks and confirmation-based safety flows
- Expand observability and deployment hardening

## Current Technical Status
- Assistant behavior currently uses mock adapter
- Session memory is active in bridge per `sessionId`
- OpenClaw adapter path is available via env toggle with mock fallback
- OpenClaw remains staged for Phase 3 adapter implementation
