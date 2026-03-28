import type {
  AssistantExecutionResult,
  AssistantSessionSnapshot,
  AssistantCommandRequest
} from '../types/assistant.js';
import type { AppConfig } from '../types/config.js';
import { runMockAssistant } from './mockAssistant.js';
import { OpenClawAdapter } from './openClawAdapter.js';

type AssistantExecutionContext = {
  config: AppConfig;
  session: AssistantSessionSnapshot | null;
};

export type AssistantProvider = 'mock' | 'openclaw';

export interface AssistantAdapter {
  execute(
    request: AssistantCommandRequest,
    context: AssistantExecutionContext
  ): Promise<AssistantExecutionResult> | AssistantExecutionResult;
  getProvider(): AssistantProvider;
}

const normalizeProvider = (value: string | undefined): AssistantProvider => {
  return value?.trim().toLowerCase() === 'openclaw' ? 'openclaw' : 'mock';
};

const parseTimeoutMs = (value: string | undefined): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 7000;
};

class ResilientAssistantAdapter implements AssistantAdapter {
  private readonly provider: AssistantProvider;
  private readonly openClawAdapter: OpenClawAdapter | null;

  constructor(provider: AssistantProvider, openClawAdapter: OpenClawAdapter | null) {
    this.provider = provider;
    this.openClawAdapter = openClawAdapter;
  }

  getProvider(): AssistantProvider {
    return this.provider;
  }

  async execute(
    request: AssistantCommandRequest,
    context: AssistantExecutionContext
  ): Promise<AssistantExecutionResult> {
    if (this.provider === 'openclaw' && this.openClawAdapter) {
      try {
        return await this.openClawAdapter.execute(request, { config: context.config });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown OpenClaw adapter error';
        console.warn(`[assistant] OpenClaw adapter failed, using mock fallback: ${message}`);
      }
    }

    return runMockAssistant(request, context.config, context.session);
  }
}

const createAssistantAdapter = (): AssistantAdapter => {
  const provider = normalizeProvider(process.env.ASSISTANT_PROVIDER);

  if (provider === 'openclaw') {
    const baseUrl = process.env.OPENCLAW_URL?.trim();

    if (!baseUrl) {
      console.warn('[assistant] ASSISTANT_PROVIDER=openclaw but OPENCLAW_URL is missing. Using mock.');
      return new ResilientAssistantAdapter('mock', null);
    }

    const path = process.env.OPENCLAW_COMMAND_PATH?.trim() || '/assistant/command';
    const timeoutMs = parseTimeoutMs(process.env.OPENCLAW_TIMEOUT_MS);
    const openClawAdapter = new OpenClawAdapter({
      baseUrl,
      path,
      timeoutMs
    });
    return new ResilientAssistantAdapter('openclaw', openClawAdapter);
  }

  return new ResilientAssistantAdapter('mock', null);
};

const assistantAdapter = createAssistantAdapter();

export const getAssistantAdapter = (): AssistantAdapter => {
  return assistantAdapter;
};

export const getAssistantProvider = (): AssistantProvider => {
  return assistantAdapter.getProvider();
};
