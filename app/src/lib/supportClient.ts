import type {
  SupportLogsResponse,
  SupportRequestPayload,
  SupportRequestResponse
} from '@/types/support';

const bridgeBaseUrl = (import.meta.env.VITE_BRIDGE_URL ?? 'http://localhost:8787').replace(
  /\/$/,
  ''
);

export const requestSupport = async (
  payload: SupportRequestPayload,
  signal?: AbortSignal
): Promise<SupportRequestResponse> => {
  const response = await fetch(`${bridgeBaseUrl}/support/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    signal
  });

  if (!response.ok) {
    throw new Error(`Support request failed with status ${response.status}`);
  }

  return (await response.json()) as SupportRequestResponse;
};

export const fetchSupportLogs = async (
  limit = 5,
  signal?: AbortSignal
): Promise<SupportLogsResponse> => {
  const response = await fetch(`${bridgeBaseUrl}/support/logs?limit=${limit}`, {
    method: 'GET',
    signal
  });

  if (!response.ok) {
    throw new Error(`Support logs request failed with status ${response.status}`);
  }

  return (await response.json()) as SupportLogsResponse;
};
