import type {
  AssistantCommandRequest,
  AssistantCommandResponse
} from '../types/assistant.js';
import type { AppConfig } from '../types/config.js';
import { runMockAssistant } from './mockAssistant.js';

type AssistantExecutionContext = {
  config: AppConfig;
};

export interface AssistantAdapter {
  execute(
    request: AssistantCommandRequest,
    context: AssistantExecutionContext
  ): Promise<AssistantCommandResponse> | AssistantCommandResponse;
}

class MockAssistantAdapter implements AssistantAdapter {
  execute(
    request: AssistantCommandRequest,
    context: AssistantExecutionContext
  ): AssistantCommandResponse {
    return runMockAssistant(request, context.config);
  }
}

const normalizeProvider = (value: string | undefined): string => {
  return value?.trim().toLowerCase() || 'mock';
};

const createAssistantAdapter = (): AssistantAdapter => {
  const provider = normalizeProvider(process.env.ASSISTANT_PROVIDER);

  if (provider === 'mock') {
    return new MockAssistantAdapter();
  }

  // Fallback to mock until the OpenClaw adapter is wired in Phase 3.
  return new MockAssistantAdapter();
};

const assistantAdapter = createAssistantAdapter();

export const getAssistantAdapter = (): AssistantAdapter => {
  return assistantAdapter;
};
