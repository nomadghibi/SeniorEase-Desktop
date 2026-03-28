import type {
  AssistantCommandRequest,
  AssistantCommandResponse
} from '@/types/assistant';

const bridgeBaseUrl = (import.meta.env.VITE_BRIDGE_URL ?? 'http://localhost:8787').replace(
  /\/$/,
  ''
);

export const sendAssistantCommand = async (
  request: AssistantCommandRequest,
  signal?: AbortSignal
): Promise<AssistantCommandResponse> => {
  const response = await fetch(`${bridgeBaseUrl}/assistant/command`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request),
    signal
  });

  if (!response.ok) {
    throw new Error(`Bridge request failed with status ${response.status}`);
  }

  return (await response.json()) as AssistantCommandResponse;
};
