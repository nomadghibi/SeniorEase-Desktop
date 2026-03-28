# OpenClaw Integration (Staged Later)

OpenClaw integration is intentionally deferred until after launcher and bridge contracts are stable.

## Integration Order
1. Finish and stabilize launcher UX (Phase 1)
2. Finish local bridge + structured mock assistant behavior (Phase 2)
3. Add OpenClaw through the assistant adapter (Phase 3)

## Rules
- OpenClaw is not the visible desktop shell
- Bridge remains the policy and safety control point
- Risky actions always require user confirmation
- Support escalation path must remain available
- If OpenClaw is unavailable, fall back to safe mock responses

## Adapter Strategy
- Keep `/assistant/command` contract stable
- Swap execution backend from mock -> OpenClaw adapter
- Preserve structured output (`message`, `actions`, `riskLevel`)

## Runtime Toggles
- `ASSISTANT_PROVIDER=mock|openclaw` (default `mock`)
- `OPENCLAW_URL` required when `ASSISTANT_PROVIDER=openclaw`
- `OPENCLAW_COMMAND_PATH` optional (default `/assistant/command`)
- `OPENCLAW_TIMEOUT_MS` optional (default `7000`)
- `OPENCLAW_MAX_FAILURES` optional (default `3`)
- `OPENCLAW_COOLDOWN_MS` optional (default `120000`)

If OpenClaw fails or is unreachable, bridge falls back to safe mock behavior.

## Hardening Behavior
- Consecutive OpenClaw failures trigger cooldown fallback to mock responses.
- `/health` exposes `assistantRuntime` status, including cooldown and last error.
