import { randomUUID } from 'node:crypto';

type AdminSession = {
  token: string;
  expiresAt: number;
};

const defaultSessionTtlMs = 60 * 60 * 1000;

const parsePositiveInteger = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const sessionTtlMs = parsePositiveInteger(process.env.ADMIN_SESSION_TTL_MS, defaultSessionTtlMs);

const sessions = new Map<string, AdminSession>();

const pruneExpiredSessions = (): void => {
  const now = Date.now();

  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt <= now) {
      sessions.delete(token);
    }
  }
};

export const createAdminSession = (): { token: string; expiresInSeconds: number } => {
  pruneExpiredSessions();

  const token = randomUUID();
  sessions.set(token, {
    token,
    expiresAt: Date.now() + sessionTtlMs
  });

  return {
    token,
    expiresInSeconds: Math.floor(sessionTtlMs / 1000)
  };
};

export const isAdminSessionValid = (token: string): boolean => {
  pruneExpiredSessions();

  const trimmed = token.trim();
  if (!trimmed) {
    return false;
  }

  const session = sessions.get(trimmed);
  if (!session) {
    return false;
  }

  if (session.expiresAt <= Date.now()) {
    sessions.delete(trimmed);
    return false;
  }

  return true;
};

export const clearAdminSession = (token: string): void => {
  sessions.delete(token.trim());
};
