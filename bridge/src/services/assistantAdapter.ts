import type {
  AssistantExecutionResult,
  AssistantSessionSnapshot,
  AssistantCommandRequest
} from '../types/assistant.js';
import type { AppConfig } from '../types/config.js';
import { runMockAssistant } from './mockAssistant.js';

type AssistantExecutionContext = {
  config: AppConfig;
  session: AssistantSessionSnapshot | null;
};

export interface AssistantAdapter {
  execute(
    request: AssistantCommandRequest,
    context: AssistantExecutionContext
  ): Promise<AssistantExecutionResult> | AssistantExecutionResult;
}

class MockAssistantAdapter implements AssistantAdapter {
  execute(
    request: AssistantCommandRequest,
    context: AssistantExecutionContext
  ): AssistantExecutionResult {
    return runMockAssistant(request, context.config, context.session);
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
