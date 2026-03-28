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
export type EffectiveAssistantProvider = 'mock' | 'openclaw';

export type AssistantRuntimeStatus = {
  configuredProvider: AssistantProvider;
  effectiveProvider: EffectiveAssistantProvider;
  openClawConfigured: boolean;
  openClawReady: boolean;
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
  return value?.trim().toLowerCase() === 'openclaw' ? 'openclaw' : 'mock';
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
  private readonly openClawAdapter: OpenClawAdapter | null;
  private readonly maxFailures: number;
  private readonly cooldownMs: number;
  private consecutiveFailures = 0;
  private fallbackUntilEpoch = 0;
  private lastError: string | null;
  private effectiveProvider: EffectiveAssistantProvider = 'mock';

  constructor(
    provider: AssistantProvider,
    openClawAdapter: OpenClawAdapter | null,
    options: {
      maxFailures: number;
      cooldownMs: number;
      initialError?: string | null;
    }
  ) {
    this.configuredProvider = provider;
    this.openClawAdapter = openClawAdapter;
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
      openClawConfigured: this.configuredProvider === 'openclaw',
      openClawReady:
        this.configuredProvider === 'openclaw' &&
        this.openClawAdapter !== null &&
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

    if (this.configuredProvider === 'openclaw' && this.openClawAdapter && !inCooldown) {
      try {
        const result = await this.openClawAdapter.execute(request, { config: context.config });
        this.effectiveProvider = 'openclaw';
        this.consecutiveFailures = 0;
        this.fallbackUntilEpoch = 0;
        this.lastError = null;
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown OpenClaw adapter error';
        this.lastError = message;
        this.consecutiveFailures += 1;

        if (this.consecutiveFailures >= this.maxFailures) {
          this.fallbackUntilEpoch = Date.now() + this.cooldownMs;
          console.warn(
            `[assistant] OpenClaw adapter entered cooldown for ${this.cooldownMs}ms after ${this.consecutiveFailures} failures.`
          );
        } else {
          console.warn(
            `[assistant] OpenClaw adapter failed (${this.consecutiveFailures}/${this.maxFailures}), using mock fallback: ${message}`
          );
        }
      }
    } else if (this.configuredProvider === 'openclaw' && !this.openClawAdapter) {
      this.lastError = this.lastError ?? 'OpenClaw URL is missing.';
    }

    this.effectiveProvider = 'mock';
    return runMockAssistant(request, context.config, context.session);
  }
}

const createAssistantAdapter = (): AssistantAdapter => {
  const provider = normalizeProvider(process.env.ASSISTANT_PROVIDER);
  const maxFailures = parsePositiveInteger(process.env.OPENCLAW_MAX_FAILURES, 3);
  const cooldownMs = parsePositiveInteger(process.env.OPENCLAW_COOLDOWN_MS, 120000);

  if (provider === 'openclaw') {
    const baseUrl = process.env.OPENCLAW_URL?.trim();

    if (!baseUrl) {
      console.warn('[assistant] ASSISTANT_PROVIDER=openclaw but OPENCLAW_URL is missing. Using mock.');
      return new ResilientAssistantAdapter('openclaw', null, {
        maxFailures,
        cooldownMs,
        initialError: 'OPENCLAW_URL missing'
      });
    }

    const path = process.env.OPENCLAW_COMMAND_PATH?.trim() || '/assistant/command';
    const timeoutMs = parseTimeoutMs(process.env.OPENCLAW_TIMEOUT_MS);
    const openClawAdapter = new OpenClawAdapter({
      baseUrl,
      path,
      timeoutMs
    });
    return new ResilientAssistantAdapter('openclaw', openClawAdapter, {
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
