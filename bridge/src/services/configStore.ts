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

const knownFavoriteUrls: Record<string, string> = {
  'Church Website': 'https://www.churchofjesuschrist.org/',
  'Local Weather': 'https://weather.com/',
  'News You Trust': 'https://www.reuters.com/',
  'Family Photo Album': 'https://photos.google.com/',
  'Pharmacy Portal': 'https://www.cvs.com/pharmacy/',
  'Bank Login': 'https://www.chase.com/'
};

const ensureHttpsUrl = (value: string): string => {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

const normalizeFavorite = (
  entry: unknown,
  index: number
): AppConfig['internetFavorites'][number] | null => {
  if (typeof entry === 'string') {
    const label = entry.trim();

    if (!label) {
      return null;
    }

    const mappedUrl = knownFavoriteUrls[label] ?? `https://duckduckgo.com/?q=${encodeURIComponent(label)}`;
    return {
      id: `favorite-${index + 1}`,
      label,
      url: mappedUrl,
      trusted: Boolean(knownFavoriteUrls[label])
    };
  }

  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const raw = entry as {
    id?: unknown;
    label?: unknown;
    url?: unknown;
    trusted?: unknown;
  };

  const label = typeof raw.label === 'string' ? raw.label.trim() : '';
  const url = typeof raw.url === 'string' ? ensureHttpsUrl(raw.url) : '';

  if (!label || !url) {
    return null;
  }

  return {
    id: typeof raw.id === 'string' && raw.id.trim().length > 0 ? raw.id : `favorite-${index + 1}`,
    label,
    url,
    trusted: Boolean(raw.trusted)
  };
};

const defaultConfig: AppConfig = {
  reminders: [
    { id: 'medication-1', text: 'Take morning medication at 9:00 AM', dueAt: '09:00' },
    { id: 'call-family-1', text: 'Call Anna this evening', dueAt: '18:30' }
  ],
  internetFavorites: [
    {
      id: 'favorite-1',
      label: 'Church Website',
      url: 'https://www.churchofjesuschrist.org/',
      trusted: true
    },
    {
      id: 'favorite-2',
      label: 'Local Weather',
      url: 'https://weather.com/',
      trusted: true
    },
    {
      id: 'favorite-3',
      label: 'News You Trust',
      url: 'https://www.reuters.com/',
      trusted: true
    },
    {
      id: 'favorite-4',
      label: 'Family Photo Album',
      url: 'https://photos.google.com/',
      trusted: true
    },
    {
      id: 'favorite-5',
      label: 'Pharmacy Portal',
      url: 'https://www.cvs.com/pharmacy/',
      trusted: true
    },
    {
      id: 'favorite-6',
      label: 'Bank Login',
      url: 'https://www.chase.com/',
      trusted: true
    }
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
    internetFavorites?: unknown[];
  };

  const normalizedFavorites = Array.isArray(partial.internetFavorites)
    ? partial.internetFavorites
        .map((entry, index) => normalizeFavorite(entry, index))
        .filter(
          (entry): entry is AppConfig['internetFavorites'][number] =>
            entry !== null
        )
    : [];

  return {
    reminders: Array.isArray(partial.reminders) ? partial.reminders : defaultConfig.reminders,
    internetFavorites:
      normalizedFavorites.length > 0
        ? normalizedFavorites
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
