import type { AppConfig, AppConfigPatch } from '@/types/config';
import { useAdminStore } from '@/store/adminStore';

const bridgeBaseUrl = (import.meta.env.VITE_BRIDGE_URL ?? 'http://localhost:8787').replace(
  /\/$/,
  ''
);

type ErrorResponse = {
  message?: string;
};

const readErrorMessage = async (response: Response, fallback: string): Promise<string> => {
  try {
    const payload = (await response.json()) as ErrorResponse;

    if (typeof payload.message === 'string' && payload.message.trim().length > 0) {
      return payload.message.trim();
    }
  } catch {
    // Fall through to fallback message.
  }

  return fallback;
};

const getAdminTokenHeader = (): Record<string, string> => {
  const token = useAdminStore.getState().adminToken;

  if (!token) {
    return {};
  }

  return {
    'x-admin-token': token
  };
};

export const fetchConfig = async (signal?: AbortSignal): Promise<AppConfig> => {
  const response = await fetch(`${bridgeBaseUrl}/config`, {
    method: 'GET',
    signal
  });

  if (!response.ok) {
    throw new Error(`Config fetch failed with status ${response.status}`);
  }

  return (await response.json()) as AppConfig;
};

export const saveConfig = async (
  patch: AppConfigPatch,
  signal?: AbortSignal
): Promise<AppConfig> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAdminTokenHeader()
  };

  const response = await fetch(`${bridgeBaseUrl}/config`, {
    method: 'POST',
    headers,
    body: JSON.stringify(patch),
    signal
  });

  if (!response.ok) {
    const message = await readErrorMessage(
      response,
      `Config update failed with status ${response.status}`
    );
    throw new Error(message);
  }

  return (await response.json()) as AppConfig;
};

export const resetConfigToDefaults = async (
  signal?: AbortSignal
): Promise<AppConfig> => {
  const headers: Record<string, string> = {
    ...getAdminTokenHeader()
  };

  const response = await fetch(`${bridgeBaseUrl}/config/reset`, {
    method: 'POST',
    headers,
    signal
  });

  if (!response.ok) {
    const message = await readErrorMessage(
      response,
      `Config reset failed with status ${response.status}`
    );
    throw new Error(message);
  }

  return (await response.json()) as AppConfig;
};
