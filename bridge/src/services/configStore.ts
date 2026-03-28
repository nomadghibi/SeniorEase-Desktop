import { createHash, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  AppConfig,
  AppConfigPatch,
  StoredAppConfig
} from '../types/config.js';
import { storedAppConfigSchema } from '../types/config.js';

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

const hashAdminPin = (pin: string): string => {
  return createHash('sha256')
    .update(`seniorease-admin-pin:${pin}`)
    .digest('hex');
};

const normalizeFavorite = (
  entry: unknown,
  index: number
): StoredAppConfig['internetFavorites'][number] | null => {
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

const defaultStoredConfig: StoredAppConfig = {
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
  weatherZipCode: '10001',
  safetyMode: 'standard',
  webGuardrails: {
    directWebsiteEntry: 'confirm',
    untrustedFavorite: 'confirm'
  },
  requireAdminPin: true,
  adminPinHash: hashAdminPin('1234'),
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

const writeStoredConfig = async (config: StoredAppConfig): Promise<void> => {
  await ensureDataDirectory();
  await writeFile(configFilePath, JSON.stringify(config, null, 2), 'utf-8');
};

const toPublicConfig = (stored: StoredAppConfig): AppConfig => {
  return {
    reminders: stored.reminders,
    internetFavorites: stored.internetFavorites,
    familyContacts: stored.familyContacts,
    supportContactName: stored.supportContactName,
    weatherZipCode: stored.weatherZipCode,
    safetyMode: stored.safetyMode,
    webGuardrails: stored.webGuardrails,
    requireAdminPin: stored.requireAdminPin,
    adminPinConfigured: stored.adminPinHash.length > 0,
    allowedModules: stored.allowedModules,
    updatedAt: stored.updatedAt
  };
};

const migrateStoredConfig = (input: unknown): StoredAppConfig => {
  if (!input || typeof input !== 'object') {
    return defaultStoredConfig;
  }

  const partial = input as Partial<StoredAppConfig> & {
    allowedModules?: Partial<StoredAppConfig['allowedModules']>;
    webGuardrails?: Partial<StoredAppConfig['webGuardrails']>;
    internetFavorites?: unknown[];
    adminPin?: unknown;
  };

  const normalizedFavorites = Array.isArray(partial.internetFavorites)
    ? partial.internetFavorites
        .map((entry, index) => normalizeFavorite(entry, index))
        .filter(
          (entry): entry is StoredAppConfig['internetFavorites'][number] =>
            entry !== null
        )
    : [];

  const adminPinHash =
    typeof partial.adminPinHash === 'string' && partial.adminPinHash.trim().length >= 32
      ? partial.adminPinHash
      : typeof partial.adminPin === 'string' && /^\d{4,8}$/.test(partial.adminPin)
        ? hashAdminPin(partial.adminPin)
        : defaultStoredConfig.adminPinHash;

  const webGuardrails: StoredAppConfig['webGuardrails'] = {
    directWebsiteEntry:
      partial.webGuardrails?.directWebsiteEntry === 'block' ? 'block' : 'confirm',
    untrustedFavorite:
      partial.webGuardrails?.untrustedFavorite === 'block' ? 'block' : 'confirm'
  };

  return {
    reminders: Array.isArray(partial.reminders) ? partial.reminders : defaultStoredConfig.reminders,
    internetFavorites:
      normalizedFavorites.length > 0
        ? normalizedFavorites
        : defaultStoredConfig.internetFavorites,
    familyContacts: Array.isArray(partial.familyContacts)
      ? partial.familyContacts
      : defaultStoredConfig.familyContacts,
    supportContactName:
      typeof partial.supportContactName === 'string' && partial.supportContactName.trim().length > 0
        ? partial.supportContactName
        : defaultStoredConfig.supportContactName,
    weatherZipCode:
      typeof partial.weatherZipCode === 'string' && /^\d{5}$/.test(partial.weatherZipCode)
        ? partial.weatherZipCode
        : defaultStoredConfig.weatherZipCode,
    safetyMode: partial.safetyMode === 'strict' ? 'strict' : 'standard',
    webGuardrails,
    requireAdminPin:
      typeof partial.requireAdminPin === 'boolean'
        ? partial.requireAdminPin
        : defaultStoredConfig.requireAdminPin,
    adminPinHash,
    allowedModules: {
      ...defaultStoredConfig.allowedModules,
      ...(partial.allowedModules ?? {}),
      help: true,
      settings: true
    },
    updatedAt: typeof partial.updatedAt === 'string' ? partial.updatedAt : new Date().toISOString()
  };
};

const getStoredConfig = async (): Promise<StoredAppConfig> => {
  try {
    const raw = await readFile(configFilePath, 'utf-8');
    const parsed = JSON.parse(raw);
    const validated = storedAppConfigSchema.safeParse(parsed);

    if (validated.success) {
      return validated.data;
    }

    const migrated = migrateStoredConfig(parsed);
    await writeStoredConfig(migrated);
    return migrated;
  } catch {
    await writeStoredConfig(defaultStoredConfig);
    return defaultStoredConfig;
  }
};

export const getConfig = async (): Promise<AppConfig> => {
  const stored = await getStoredConfig();
  return toPublicConfig(stored);
};

export const updateConfig = async (patch: AppConfigPatch): Promise<AppConfig> => {
  const existing = await getStoredConfig();

  const nextAllowedModules = patch.allowedModules
    ? {
        ...existing.allowedModules,
        ...patch.allowedModules,
        help: true,
        settings: true
      }
    : existing.allowedModules;

  const nextWebGuardrails = patch.webGuardrails
    ? {
        ...existing.webGuardrails,
        ...patch.webGuardrails
      }
    : existing.webGuardrails;

  const {
    adminPin,
    allowedModules: _allowedModules,
    webGuardrails: _webGuardrails,
    ...restPatch
  } = patch;

  const merged: StoredAppConfig = {
    ...existing,
    ...restPatch,
    adminPinHash: adminPin ? hashAdminPin(adminPin) : existing.adminPinHash,
    allowedModules: nextAllowedModules,
    webGuardrails: nextWebGuardrails,
    updatedAt: new Date().toISOString()
  };

  await writeStoredConfig(merged);

  return toPublicConfig(merged);
};

export const resetConfig = async (): Promise<AppConfig> => {
  const next: StoredAppConfig = {
    ...defaultStoredConfig,
    updatedAt: new Date().toISOString()
  };

  await writeStoredConfig(next);
  return toPublicConfig(next);
};

export const verifyAdminPin = async (pin: string): Promise<boolean> => {
  const stored = await getStoredConfig();
  const storedHash = Buffer.from(stored.adminPinHash, 'utf-8');
  const incomingHash = Buffer.from(hashAdminPin(pin), 'utf-8');

  if (storedHash.length !== incomingHash.length) {
    return false;
  }

  return timingSafeEqual(storedHash, incomingHash);
};
