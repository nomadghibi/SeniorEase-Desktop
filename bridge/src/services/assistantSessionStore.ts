import type { AssistantSessionSnapshot } from '../types/assistant.js';

type SessionEntry = {
  expiresAt: number;
  snapshot: AssistantSessionSnapshot;
};

const sessionTtlMs = 2 * 60 * 60 * 1000;
const sessions = new Map<string, SessionEntry>();

const pruneExpiredSessions = (): void => {
  const now = Date.now();

  for (const [sessionId, entry] of sessions.entries()) {
    if (entry.expiresAt <= now) {
      sessions.delete(sessionId);
    }
  }
};

export const getAssistantSession = (
  sessionId: string
): AssistantSessionSnapshot | null => {
  pruneExpiredSessions();
  const entry = sessions.get(sessionId);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    return null;
  }

  return entry.snapshot;
};

export const setAssistantSession = (
  sessionId: string,
  snapshot: AssistantSessionSnapshot
): void => {
  sessions.set(sessionId, {
    snapshot,
    expiresAt: Date.now() + sessionTtlMs
  });
};
