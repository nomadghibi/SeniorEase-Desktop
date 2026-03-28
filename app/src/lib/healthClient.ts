import type { BridgeHealthResponse } from '@/types/health';

const bridgeBaseUrl = (import.meta.env.VITE_BRIDGE_URL ?? 'http://localhost:8787').replace(
  /\/$/,
  ''
);

export const fetchBridgeHealth = async (
  signal?: AbortSignal
): Promise<BridgeHealthResponse> => {
  const response = await fetch(`${bridgeBaseUrl}/health`, {
    method: 'GET',
    signal
  });

  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }

  return (await response.json()) as BridgeHealthResponse;
};

