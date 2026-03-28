import { z } from 'zod';
import type {
  AssistantAction,
  AssistantCommandRequest,
  AssistantCommandResponse,
  AssistantExecutionResult,
  RiskLevel
} from '../types/assistant.js';
import type { AppConfig } from '../types/config.js';

type AnythingLLMAdapterOptions = {
  baseUrl: string | null;
  path: string;
  timeoutMs: number;
  apiKey: string | null;
};

type AnythingLLMExecutionContext = {
  config: AppConfig;
};

type ResolvedRuntimeOptions = {
  baseUrl: string | null;
  path: string;
  timeoutMs: number;
  apiKey: string | null;
};

const assistantActionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  requiresConfirmation: z.boolean().optional()
});

const legacyBridgeResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().min(1),
  riskLevel: z.enum(['safe', 'caution', 'blocked']),
  actions: z.array(assistantActionSchema).min(1)
});

const anythingLlmWorkspaceResponseSchema = z
  .object({
    id: z.string().optional(),
    type: z.string().optional(),
    textResponse: z.string().optional(),
    response: z.string().optional(),
    message: z.string().optional(),
    error: z.union([z.string(), z.null()]).optional(),
    sources: z.array(z.unknown()).optional(),
    close: z.boolean().optional()
  })
  .passthrough();

const openAiCompatibleResponseSchema = z
  .object({
    choices: z.array(
      z
        .object({
          message: z
            .object({
              content: z.string().optional()
            })
            .optional(),
          delta: z
            .object({
              content: z.string().optional()
            })
            .optional()
        })
        .passthrough()
    )
  })
  .passthrough();

const buildDefaultActions = (riskLevel: RiskLevel): AssistantAction[] => {
  if (riskLevel === 'blocked') {
    return [
      {
        id: 'call_support',
        label: 'Call Support',
        description: 'Contact your support person before continuing.',
        requiresConfirmation: true
      },
      {
        id: 'go_home',
        label: 'Go Home',
        description: 'Return to the main screen.'
      }
    ];
  }

  if (riskLevel === 'caution') {
    return [
      {
        id: 'ask_help',
        label: 'Get Help',
        description: 'Ask for more guidance before continuing.'
      },
      {
        id: 'go_home',
        label: 'Go Home',
        description: 'Return to the main screen.'
      }
    ];
  }

  return [
    {
      id: 'go_home',
      label: 'Go Home',
      description: 'Return to the main screen.'
    },
    {
      id: 'ask_help',
      label: 'Get Help',
      description: 'Ask for help with your next step.'
    }
  ];
};

const inferRiskLevel = (
  text: string,
  options: {
    hasError: boolean;
    responseType?: string;
  }
): RiskLevel => {
  if (options.hasError || options.responseType?.toLowerCase() === 'abort') {
    return 'blocked';
  }

  const normalized = text.toLowerCase();
  if (
    normalized.includes('suspicious') ||
    normalized.includes('scam') ||
    normalized.includes('do not click') ||
    normalized.includes('untrusted') ||
    normalized.includes('warning')
  ) {
    return 'caution';
  }

  return 'safe';
};

const firstNonEmptyString = (...values: Array<string | undefined>): string | null => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
};

const mapWorkspaceResponse = (
  payload: z.infer<typeof anythingLlmWorkspaceResponseSchema>
): AssistantCommandResponse | null => {
  const text = firstNonEmptyString(payload.textResponse, payload.response, payload.message);
  const hasError = typeof payload.error === 'string' && payload.error.trim().length > 0;
  const responseType = payload.type;

  if (!text && !hasError) {
    return null;
  }

  const resolvedMessage = text ?? `AnythingLLM error: ${payload.error?.trim() ?? 'Unknown error.'}`;
  const riskLevel = inferRiskLevel(resolvedMessage, { hasError, responseType });

  return {
    success: true,
    message: resolvedMessage,
    riskLevel,
    actions: buildDefaultActions(riskLevel)
  };
};

const mapOpenAiCompatibleResponse = (
  payload: z.infer<typeof openAiCompatibleResponseSchema>
): AssistantCommandResponse | null => {
  const message = payload.choices
    .map((choice) => firstNonEmptyString(choice.message?.content, choice.delta?.content))
    .find((value): value is string => value !== null);

  if (!message) {
    return null;
  }

  const riskLevel = inferRiskLevel(message, { hasError: false });
  return {
    success: true,
    message,
    riskLevel,
    actions: buildDefaultActions(riskLevel)
  };
};

const resolveRuntimeOptions = (
  defaults: AnythingLLMAdapterOptions,
  config: AppConfig
): ResolvedRuntimeOptions => {
  const configUrl = config.assistantSettings.anythingLlmUrl.trim();
  const configPath = config.assistantSettings.anythingLlmCommandPath.trim();
  const configApiKey = config.assistantSettings.anythingLlmApiKey.trim();

  return {
    baseUrl: configUrl.length > 0 ? configUrl : defaults.baseUrl,
    path: configPath.length > 0 ? configPath : defaults.path,
    timeoutMs: defaults.timeoutMs,
    apiKey: configApiKey.length > 0 ? configApiKey : defaults.apiKey
  };
};

const buildAnythingLLMPayload = (
  request: AssistantCommandRequest,
  config: AppConfig
): Record<string, unknown> => {
  return {
    message: request.command,
    mode: 'chat',
    sessionId: request.sessionId,
    reset: false,
    metadata: {
      userId: request.userId,
      context: request.context ?? {},
      safetyMode: config.safetyMode,
      webGuardrails: config.webGuardrails,
      allowedModules: config.allowedModules
    }
  };
};

const normalizeUrl = (baseUrl: string, path: string): string => {
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

const mapResponse = (raw: unknown): AssistantCommandResponse => {
  const legacyParsed = legacyBridgeResponseSchema.safeParse(raw);
  if (legacyParsed.success) {
    return {
      success: true,
      message: legacyParsed.data.message,
      riskLevel: legacyParsed.data.riskLevel,
      actions: legacyParsed.data.actions
    };
  }

  const workspaceParsed = anythingLlmWorkspaceResponseSchema.safeParse(raw);
  if (workspaceParsed.success) {
    const mapped = mapWorkspaceResponse(workspaceParsed.data);
    if (mapped) {
      return mapped;
    }
  }

  const openAiParsed = openAiCompatibleResponseSchema.safeParse(raw);
  if (openAiParsed.success) {
    const mapped = mapOpenAiCompatibleResponse(openAiParsed.data);
    if (mapped) {
      return mapped;
    }
  }

  throw new Error('AnythingLLM adapter returned an unrecognized response shape.');
};

export class AnythingLLMAdapter {
  private readonly options: AnythingLLMAdapterOptions;

  constructor(options: AnythingLLMAdapterOptions) {
    this.options = options;
  }

  async execute(
    request: AssistantCommandRequest,
    context: AnythingLLMExecutionContext
  ): Promise<AssistantExecutionResult> {
    const runtimeOptions = resolveRuntimeOptions(this.options, context.config);

    if (!runtimeOptions.baseUrl) {
      throw new Error('AnythingLLM URL is missing. Set it in Settings or ANYTHINGLLM_URL.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), runtimeOptions.timeoutMs);

    try {
      const endpoint = normalizeUrl(runtimeOptions.baseUrl, runtimeOptions.path);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (runtimeOptions.apiKey) {
        headers.Authorization = `Bearer ${runtimeOptions.apiKey}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(buildAnythingLLMPayload(request, context.config)),
        signal: controller.signal
      });

      const responseText = await response.text();
      let payload: unknown = responseText;

      try {
        payload = responseText.length > 0 ? JSON.parse(responseText) : {};
      } catch {
        // Keep raw response text for diagnostics when JSON parsing fails.
      }

      if (!response.ok) {
        const errorMessage =
          typeof payload === 'object' &&
          payload !== null &&
          'error' in payload &&
          typeof (payload as { error: unknown }).error === 'string'
            ? (payload as { error: string }).error
            : responseText.slice(0, 240);

        throw new Error(
          `AnythingLLM adapter request failed with status ${response.status}${
            errorMessage ? `: ${errorMessage}` : ''
          }`
        );
      }

      return {
        response: mapResponse(payload)
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
