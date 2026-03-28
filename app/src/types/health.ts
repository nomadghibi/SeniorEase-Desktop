export type AssistantProvider = 'mock' | 'anythingllm';

export type AssistantRuntimeStatus = {
  configuredProvider: AssistantProvider;
  effectiveProvider: AssistantProvider;
  anythingLlmConfigured: boolean;
  anythingLlmReady: boolean;
  consecutiveFailures: number;
  fallbackUntil: string | null;
  lastError: string | null;
};

export type BridgeHealthResponse = {
  ok: boolean;
  service: string;
  assistantProvider: AssistantProvider;
  assistantRuntime: AssistantRuntimeStatus;
};

