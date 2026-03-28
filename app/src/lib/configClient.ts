import type { AppConfig, AppConfigPatch } from '@/types/config';

const bridgeBaseUrl = (import.meta.env.VITE_BRIDGE_URL ?? 'http://localhost:8787').replace(
  /\/$/,
  ''
);

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
  const response = await fetch(`${bridgeBaseUrl}/config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(patch),
    signal
  });

  if (!response.ok) {
    throw new Error(`Config update failed with status ${response.status}`);
  }

  return (await response.json()) as AppConfig;
};
