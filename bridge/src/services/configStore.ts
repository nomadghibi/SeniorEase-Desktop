import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AppConfig, AppConfigPatch } from '../types/config.js';
import { appConfigSchema } from '../types/config.js';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);
const bridgeRootDirectory = path.resolve(currentDirectory, '../..');
const dataDirectory = path.join(bridgeRootDirectory, 'data');
const configFilePath = path.join(dataDirectory, 'config.json');

const defaultConfig: AppConfig = {
  reminders: [
    { id: 'medication-1', text: 'Take morning medication at 9:00 AM', dueAt: '09:00' },
    { id: 'call-family-1', text: 'Call Anna this evening', dueAt: '18:30' }
  ],
  internetFavorites: [
    'Church Website',
    'Local Weather',
    'News You Trust',
    'Family Photo Album',
    'Pharmacy Portal',
    'Bank Login'
  ],
  familyContacts: [
    { id: 'anna', name: 'Anna', relation: 'Daughter', email: 'anna@example.com' },
    { id: 'michael', name: 'Michael', relation: 'Grandson', email: 'michael@example.com' },
    { id: 'fred', name: 'Fred', relation: 'Support Contact', phone: '(555) 010-3300' }
  ],
  supportContactName: 'Fred',
  safetyMode: 'standard',
  requireAdminPin: true,
  adminPin: '1234',
  allowedModules: {
    email: true,
    photos: true,
    internet: true,
    facebook: true,
    videocall: true,
    family: true,
    help: true,
    settings: true
  },
  updatedAt: new Date().toISOString()
};

const ensureDataDirectory = async (): Promise<void> => {
  await mkdir(dataDirectory, { recursive: true });
};

const writeConfig = async (config: AppConfig): Promise<void> => {
  await ensureDataDirectory();
  await writeFile(configFilePath, JSON.stringify(config, null, 2), 'utf-8');
};

const migrateConfig = (input: unknown): AppConfig => {
  if (!input || typeof input !== 'object') {
    return defaultConfig;
  }

  const partial = input as Partial<AppConfig> & {
    allowedModules?: Partial<AppConfig['allowedModules']>;
  };

  return {
    reminders: Array.isArray(partial.reminders) ? partial.reminders : defaultConfig.reminders,
    internetFavorites: Array.isArray(partial.internetFavorites)
      ? partial.internetFavorites
      : defaultConfig.internetFavorites,
    familyContacts: Array.isArray(partial.familyContacts)
      ? partial.familyContacts
      : defaultConfig.familyContacts,
    supportContactName:
      typeof partial.supportContactName === 'string' && partial.supportContactName.trim().length > 0
        ? partial.supportContactName
        : defaultConfig.supportContactName,
    safetyMode: partial.safetyMode === 'strict' ? 'strict' : 'standard',
    requireAdminPin:
      typeof partial.requireAdminPin === 'boolean'
        ? partial.requireAdminPin
        : defaultConfig.requireAdminPin,
    adminPin:
      typeof partial.adminPin === 'string' && /^\d{4,8}$/.test(partial.adminPin)
        ? partial.adminPin
        : defaultConfig.adminPin,
    allowedModules: {
      ...defaultConfig.allowedModules,
      ...(partial.allowedModules ?? {}),
      help: true,
      settings: true
    },
    updatedAt: typeof partial.updatedAt === 'string' ? partial.updatedAt : new Date().toISOString()
  };
};

export const getConfig = async (): Promise<AppConfig> => {
  try {
    const raw = await readFile(configFilePath, 'utf-8');
    const parsed = JSON.parse(raw);
    const validated = appConfigSchema.safeParse(parsed);

    if (validated.success) {
      return validated.data;
    }

    const migrated = migrateConfig(parsed);
    await writeConfig(migrated);
    return migrated;
  } catch {
    await writeConfig(defaultConfig);
    return defaultConfig;
  }
};

export const updateConfig = async (patch: AppConfigPatch): Promise<AppConfig> => {
  const existing = await getConfig();

  const nextAllowedModules = patch.allowedModules
    ? {
        ...existing.allowedModules,
        ...patch.allowedModules,
        help: true,
        settings: true
      }
    : existing.allowedModules;

  const merged: AppConfig = {
    ...existing,
    ...patch,
    allowedModules: nextAllowedModules,
    updatedAt: new Date().toISOString()
  };

  await writeConfig(merged);

  return merged;
};

export const resetConfig = async (): Promise<AppConfig> => {
  const next: AppConfig = {
    ...defaultConfig,
    updatedAt: new Date().toISOString()
  };

  await writeConfig(next);
  return next;
};
