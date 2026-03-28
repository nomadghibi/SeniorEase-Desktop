# OpenClaw Integration Plan

OpenClaw integration is intentionally deferred until Phase 2+

Planned integration approach:
1. UI sends structured commands to local bridge service.
2. Bridge applies policy checks and context shaping.
3. Bridge calls OpenClaw runtime and returns constrained responses.
4. UI presents actions with explicit confirmation for risky steps.
