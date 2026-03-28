import type {
  AssistantExecutionResult,
  AssistantSessionSnapshot,
  AssistantCommandRequest
} from '../types/assistant.js';
import type { AppConfig } from '../types/config.js';
import { runMockAssistant } from './mockAssistant.js';
import { AnythingLLMAdapter } from './anythingLLMAdapter.js';

type AssistantExecutionContext = {
  config: AppConfig;
  session: AssistantSessionSnapshot | null;
};

export type AssistantProvider = 'mock' | 'anythingllm';
export type EffectiveAssistantProvider = 'mock' | 'anythingllm';

export type AssistantRuntimeStatus = {
  configuredProvider: AssistantProvider;
  effectiveProvider: EffectiveAssistantProvider;
  anythingLlmConfigured: boolean;
  anythingLlmReady: boolean;
  consecutiveFailures: number;
  fallbackUntil: string | null;
  lastError: string | null;
};

export interface AssistantAdapter {
  execute(
    request: AssistantCommandRequest,
    context: AssistantExecutionContext
  ): Promise<AssistantExecutionResult> | AssistantExecutionResult;
  getProvider(): AssistantProvider;
  getRuntimeStatus(): AssistantRuntimeStatus;
}

const normalizeProvider = (value: string | undefined): AssistantProvider => {
  const normalized = value?.trim().toLowerCase();
  return normalized === 'anythingllm' || normalized === 'openclaw' ? 'anythingllm' : 'mock';
};

const parseTimeoutMs = (value: string | undefined): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 7000;
};

const parsePositiveInteger = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

class ResilientAssistantAdapter implements AssistantAdapter {
  private readonly configuredProvider: AssistantProvider;
  private readonly anythingLlmAdapter: AnythingLLMAdapter | null;
  private readonly maxFailures: number;
  private readonly cooldownMs: number;
  private consecutiveFailures = 0;
  private fallbackUntilEpoch = 0;
  private lastError: string | null;
  private effectiveProvider: EffectiveAssistantProvider = 'mock';

  constructor(
    provider: AssistantProvider,
    anythingLlmAdapter: AnythingLLMAdapter | null,
    options: {
      maxFailures: number;
      cooldownMs: number;
      initialError?: string | null;
    }
  ) {
    this.configuredProvider = provider;
    this.anythingLlmAdapter = anythingLlmAdapter;
    this.maxFailures = options.maxFailures;
    this.cooldownMs = options.cooldownMs;
    this.lastError = options.initialError ?? null;
  }

  getProvider(): AssistantProvider {
    return this.configuredProvider;
  }

  getRuntimeStatus(): AssistantRuntimeStatus {
    const now = Date.now();
    const fallbackUntil = this.fallbackUntilEpoch > now
      ? new Date(this.fallbackUntilEpoch).toISOString()
      : null;

    return {
      configuredProvider: this.configuredProvider,
      effectiveProvider: this.effectiveProvider,
      anythingLlmConfigured: this.configuredProvider === 'anythingllm',
      anythingLlmReady:
        this.configuredProvider === 'anythingllm' &&
        this.anythingLlmAdapter !== null &&
        fallbackUntil === null,
      consecutiveFailures: this.consecutiveFailures,
      fallbackUntil,
      lastError: this.lastError
    };
  }

  async execute(
    request: AssistantCommandRequest,
    context: AssistantExecutionContext
  ): Promise<AssistantExecutionResult> {
    const now = Date.now();
    const inCooldown = this.fallbackUntilEpoch > now;

    if (this.configuredProvider === 'anythingllm' && this.anythingLlmAdapter && !inCooldown) {
      try {
        const result = await this.anythingLlmAdapter.execute(request, { config: context.config });
        this.effectiveProvider = 'anythingllm';
        this.consecutiveFailures = 0;
        this.fallbackUntilEpoch = 0;
        this.lastError = null;
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown AnythingLLM adapter error';
        this.lastError = message;
        this.consecutiveFailures += 1;

        if (this.consecutiveFailures >= this.maxFailures) {
          this.fallbackUntilEpoch = Date.now() + this.cooldownMs;
          console.warn(
            `[assistant] AnythingLLM adapter entered cooldown for ${this.cooldownMs}ms after ${this.consecutiveFailures} failures.`
          );
        } else {
          console.warn(
            `[assistant] AnythingLLM adapter failed (${this.consecutiveFailures}/${this.maxFailures}), using mock fallback: ${message}`
          );
        }
      }
    } else if (this.configuredProvider === 'anythingllm' && !this.anythingLlmAdapter) {
      this.lastError = this.lastError ?? 'AnythingLLM URL is missing.';
    }

    this.effectiveProvider = 'mock';
    return runMockAssistant(request, context.config, context.session);
  }
}

const createAssistantAdapter = (): AssistantAdapter => {
  const provider = normalizeProvider(process.env.ASSISTANT_PROVIDER);
  const maxFailures = parsePositiveInteger(
    process.env.ANYTHINGLLM_MAX_FAILURES ?? process.env.OPENCLAW_MAX_FAILURES,
    3
  );
  const cooldownMs = parsePositiveInteger(
    process.env.ANYTHINGLLM_COOLDOWN_MS ?? process.env.OPENCLAW_COOLDOWN_MS,
    120000
  );

  if (provider === 'anythingllm') {
    const baseUrl = (process.env.ANYTHINGLLM_URL ?? process.env.OPENCLAW_URL)?.trim();

    if (!baseUrl) {
      console.warn(
        '[assistant] ASSISTANT_PROVIDER=anythingllm but ANYTHINGLLM_URL is missing. Using mock.'
      );
      return new ResilientAssistantAdapter('anythingllm', null, {
        maxFailures,
        cooldownMs,
        initialError: 'ANYTHINGLLM_URL missing'
      });
    }

    const path =
      (process.env.ANYTHINGLLM_COMMAND_PATH ?? process.env.OPENCLAW_COMMAND_PATH)?.trim() ||
      '/assistant/command';
    const timeoutMs = parseTimeoutMs(process.env.ANYTHINGLLM_TIMEOUT_MS ?? process.env.OPENCLAW_TIMEOUT_MS);
    const apiKey = (process.env.ANYTHINGLLM_API_KEY ?? process.env.OPENCLAW_API_KEY)?.trim() || null;
    const anythingLlmAdapter = new AnythingLLMAdapter({
      baseUrl,
      path,
      timeoutMs,
      apiKey
    });
    return new ResilientAssistantAdapter('anythingllm', anythingLlmAdapter, {
      maxFailures,
      cooldownMs
    });
  }

  return new ResilientAssistantAdapter('mock', null, {
    maxFailures,
    cooldownMs
  });
};

const assistantAdapter = createAssistantAdapter();

export const getAssistantAdapter = (): AssistantAdapter => {
  return assistantAdapter;
};

export const getAssistantProvider = (): AssistantProvider => {
  return assistantAdapter.getProvider();
};

export const getAssistantRuntimeStatus = (): AssistantRuntimeStatus => {
  return assistantAdapter.getRuntimeStatus();
};
