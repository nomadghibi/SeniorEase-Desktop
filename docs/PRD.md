# SeniorEase Desktop PRD (Residential-First)

## 1. Product Definition
SeniorEase Desktop is a **residential-first** Windows launcher for seniors and their households.

It runs on top of Windows and simplifies daily computer use for common home tasks:
- Email
- Photos
- Internet
- Facebook
- Video calls
- Family contact shortcuts
- Immediate help/support

## 2. Primary Outcome
Reduce confusion, risky clicks, and support friction for home users while preserving independence.

## 3. Primary Users
- Senior resident (daily user)
- Family caregiver (remote helper)
- Residential support technician (setup + support)

## 4. Residential-First Positioning
This product is optimized for **single-home deployments** and repeatable household setup.

It is not positioned as a complex enterprise endpoint manager in this stage.

## 5. Core Principles
- Simplicity over feature density
- Safety over autonomy
- Guided flows over open navigation
- Always-visible Help path
- Always-visible way back Home
- Human confirmation before risky actions

## 6. Simplified Admin Model
Admin is intentionally simple for residential support:
- One local admin mode with PIN lock
- One shared household config profile
- Support-friendly settings screen (favorites, contacts, safety, reminders)
- Local export/import/reset for repeatable home setups

Out of scope in this model:
- Multi-tenant org hierarchy
- Role matrices
- Advanced enterprise policy engines

## 7. Scope By Phase

### Phase 1: Launcher Foundation (Build Pack 1)
- Fullscreen launcher shell
- Large-button home experience
- Sticky bottom nav (Home, Back, Speak, Help)
- Core module screens and routing
- Senior-readable, high-contrast UI

### Phase 2: Guided Intelligence Layer (Build Pack 2)
- Local bridge service (Node/Express)
- Structured assistant command contract
- Help screen command input + response cards
- Risk-level banners (`safe`, `caution`, `blocked`)
- Safe mocked assistant behavior (no unrestricted automation)
- Config + support workflows for residential support

### Phase 3: Controlled OpenClaw Rollout (Build Pack 3)
- Keep existing UI/bridge contract
- Add OpenClaw adapter behind the assistant interface
- Keep confirmation gates for risky actions
- Preserve support escalation and safety guardrails
- Expand policy/hardening without removing residential simplicity

## 8. Current Delivery Status (Codebase Snapshot)
- Phase 1: complete
- Phase 2: complete
- Phase 3: started (adapter/session foundation in place; OpenClaw still staged later)

## 9. Success Metrics
- Fewer “I got stuck” support calls
- Faster completion of core tasks (email/photos/web/help)
- Reduced suspicious link interactions
- Higher confidence for senior users and caregivers

## 10. Next Execution Guidance
Use the Build Packs in order:
1. Build Pack 1 baseline (launcher/UI scaffold)
2. Build Pack 2 bridge + structured assistant layer
3. Build Pack 3 controlled OpenClaw integration

OpenClaw should be integrated **after** the UI and bridge contracts are stable.
