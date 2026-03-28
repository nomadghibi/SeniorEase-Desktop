# SeniorEase Desktop Build Packs

This file defines the implementation packs for the residential-first roadmap.

## Build Pack 1: Launcher Foundation

### Goal
Generate the actual Electron + React senior launcher scaffold with accessible home UX.

### Scope
- Electron shell + React + TypeScript + Tailwind
- Fullscreen launcher home
- 7 large home buttons
- Sticky bottom nav (`Home`, `Back`, `Speak`, `Help`)
- Module screen routing (placeholders acceptable in this pack)
- Clean folder structure and run scripts

### Safety Constraints
- No autonomous high-risk actions
- No backend automation complexity
- No OpenClaw integration yet

### Deliverables
- Working local launcher app
- Reusable UI components (tile/button/layout)
- Windows run instructions

### Build Prompt
```md
You are a senior software engineer building SeniorEase Desktop.

Goal:
Build a residential-first senior launcher using Electron + React + TypeScript + Tailwind.

Requirements:
- Fullscreen launcher with 7 primary tiles: Email, Photos, Internet, Facebook, Video Call, Family, Help
- Persistent bottom nav: Home, Back, Speak, Help
- Large accessible text and touch targets
- Calm, high-contrast UI
- Screen routing between modules
- Keep code modular and production-minded

Constraints:
- No backend complexity
- No OpenClaw integration in this pack
- No autonomous risky actions

Output:
- Full file tree + files + Windows run instructions
```

## Build Pack 2: Local Bridge + Structured Assistant

### Goal
Introduce a local bridge and safe assistant interaction layer with risk-aware responses.

### Scope
- Node/Express local bridge
- `POST /assistant/command` contract
- Help screen command input + quick actions
- Structured response cards and risk-level banners
- Mocked command handling with safe behavior
- Config and support escalation endpoints

### Safety Constraints
- Risky actions require confirmation
- No unrestricted shell/OS control
- Keep assistant behavior deterministic and constrained

### Deliverables
- Working bridge + frontend integration
- Typed request/response contracts
- Mocked command flows for common residential use cases

### Build Prompt
```md
Extend SeniorEase Desktop with a local bridge and safe mock assistant layer.

Requirements:
- Add Node/Express bridge service
- Add assistant command endpoint and typed contracts
- Add Help UI that sends commands and renders structured responses
- Add risk-level support: safe/caution/blocked
- Add support escalation action path
- Keep adapter boundaries for future OpenClaw integration

Constraints:
- Do not integrate real OpenClaw yet
- Do not allow unrestricted command execution
```

## Build Pack 3: Controlled OpenClaw Integration (Later Stage)

### Goal
Swap mock assistant execution with OpenClaw via adapter without changing senior-facing UX patterns.

### Scope
- Implement OpenClaw adapter behind assistant interface
- Preserve existing bridge API contract
- Keep policy checks and confirmation gates
- Add logging/observability for support diagnostics

### Safety Constraints
- No silent risky actions
- Maintain human-in-the-loop confirmation flows
- Keep strict policy enforcement in bridge

### Deliverables
- Adapter-backed assistant execution
- Safe fallback behavior if OpenClaw unavailable
- Documented deployment toggles and rollback path

### Build Prompt
```md
Integrate OpenClaw into SeniorEase Desktop using the existing assistant adapter contract.

Requirements:
- Implement OpenClaw adapter for assistant execution
- Keep existing bridge route contracts stable
- Preserve risk-level behavior and confirmation gates
- Add robust fallback to mock/safe responses when OpenClaw is unavailable
- Keep support escalation intact

Constraints:
- Do not bypass safety checks
- Do not add autonomous high-risk behavior
```
