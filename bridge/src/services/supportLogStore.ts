import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SupportLogEntry, SupportRequest } from '../types/support.js';
import { supportLogEntrySchema } from '../types/support.js';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);
const bridgeRootDirectory = path.resolve(currentDirectory, '../..');
const dataDirectory = path.join(bridgeRootDirectory, 'data');
const logsFilePath = path.join(dataDirectory, 'support-logs.json');

const ensureDataDirectory = async (): Promise<void> => {
  await mkdir(dataDirectory, { recursive: true });
};

const readLogs = async (): Promise<SupportLogEntry[]> => {
  try {
    const raw = await readFile(logsFilePath, 'utf-8');
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry) => supportLogEntrySchema.safeParse(entry))
      .filter((result) => result.success)
      .map((result) => result.data)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch {
    return [];
  }
};

const writeLogs = async (logs: SupportLogEntry[]): Promise<void> => {
  await ensureDataDirectory();
  await writeFile(logsFilePath, JSON.stringify(logs, null, 2), 'utf-8');
};

const createLogId = (): string => {
  return `support-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const createSupportLog = async (request: SupportRequest): Promise<SupportLogEntry> => {
  const existing = await readLogs();

  const entry: SupportLogEntry = {
    ...request,
    id: createLogId(),
    status: 'open',
    createdAt: new Date().toISOString()
  };

  const next = [entry, ...existing].slice(0, 200);
  await writeLogs(next);

  return entry;
};

export const getSupportLogs = async (limit = 20): Promise<SupportLogEntry[]> => {
  const logs = await readLogs();
  const normalizedLimit = Math.max(1, Math.min(100, Number.isFinite(limit) ? limit : 20));
  return logs.slice(0, normalizedLimit);
};
