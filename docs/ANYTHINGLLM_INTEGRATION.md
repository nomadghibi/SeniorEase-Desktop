# AnythingLLM Integration (Staged Later)

AnythingLLM integration is intentionally staged after launcher and bridge contracts are stable.

## Integration Order
1. Stabilize launcher UX (Phase 1)
2. Stabilize local bridge + structured mock assistant behavior (Phase 2)
3. Add AnythingLLM through the assistant adapter (Phase 4)

## Local Install Model
- SeniorEase runs on Windows as an Electron desktop app.
- Bridge runs locally on the same machine (`localhost`) as the policy/safety layer.
- AnythingLLM can run:
  - locally on that same device (desktop/runtime mode), or
  - remotely in a self-hosted environment (home lab/support-hosted).
- SeniorEase connects only to the configured bridge + assistant endpoints; no unrestricted system automation is allowed in senior mode.

## Desktop vs Self-Hosted Mode
- Desktop/local mode:
  - Lowest setup complexity for single household installs
  - Minimal network dependency if model/runtime is local
  - Easier offline fallback with mock assistant
- Self-hosted mode:
  - Better centralized support operations across households
  - Shared model/agent governance and update control
  - Requires secure network path and endpoint hardening

## API Endpoints and Runtime Toggles
- Bridge contract remains stable: `POST /assistant/command`
- Bridge adapter env vars (canonical):
  - `ASSISTANT_PROVIDER=mock|anythingllm` (default is `mock`; opt into AnythingLLM explicitly)
  - `ANYTHINGLLM_URL` (required when provider is `anythingllm`)
  - `ANYTHINGLLM_COMMAND_PATH` (optional, default `/api/v1/workspace/default/chat`)
  - `ANYTHINGLLM_API_KEY` (optional, recommended for secured deployments; env-only)
  - `ANYTHINGLLM_TIMEOUT_MS` (optional, default `7000`)
  - `ANYTHINGLLM_MAX_FAILURES` (optional, default `3`)
  - `ANYTHINGLLM_COOLDOWN_MS` (optional, default `120000`)
- Legacy OpenClaw env vars are still accepted as compatibility aliases during migration.
- Admin Settings persists URL/path per installation and shows masked API-key status from env.

## Workspace and Agent Strategy
- Use one AnythingLLM workspace per household profile by default.
- Keep prompts/task orchestration in bridge-side adapters; senior-facing UX should stay deterministic.
- Maintain explicit context packaging from bridge:
  - current screen/module
  - selected content IDs when relevant
  - safety mode + web guardrails
  - allowed module policy
- Avoid dynamic tool expansion in senior mode; expose only approved action types.

## Safety Boundaries
- AnythingLLM is not the visible shell; SeniorEase UI remains the primary interaction layer.
- Bridge remains the control point for:
  - policy enforcement
  - module access validation
  - risk-level handling (`safe`, `caution`, `blocked`)
  - confirmation gates before risky actions
- Disallowed behavior:
  - silent send/delete/financial actions
  - unrestricted OS command execution
  - automatic opening of suspicious links/attachments

## Fallback and Failure Behavior
- If AnythingLLM is unavailable or returns invalid payloads, bridge falls back to safe mock behavior.
- Adapter maps AnythingLLM workspace chat responses (`textResponse`, `type`, `error`, `sources`) into SeniorEase structured response cards.
- Consecutive failures trigger cooldown fallback to prevent repeated unstable calls.
- `/health` exposes `assistantRuntime` details:
  - configured provider
  - effective provider in use
  - cooldown status
  - failure counters and last error
