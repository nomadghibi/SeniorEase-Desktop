import { z } from 'zod';
import type {
  AssistantExecutionResult,
  AssistantCommandRequest,
  AssistantCommandResponse
} from '../types/assistant.js';
import type { AppConfig } from '../types/config.js';

type OpenClawAdapterOptions = {
  baseUrl: string;
  path: string;
  timeoutMs: number;
};

type OpenClawExecutionContext = {
  config: AppConfig;
};

const actionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  requiresConfirmation: z.boolean().optional()
});

const responseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().min(1),
  riskLevel: z.enum(['safe', 'caution', 'blocked']),
  actions: z.array(actionSchema).min(1)
});

const buildOpenClawPayload = (
  request: AssistantCommandRequest,
  config: AppConfig
): Record<string, unknown> => {
  return {
    userId: request.userId,
    sessionId: request.sessionId,
    command: request.command,
    context: request.context ?? {},
    safety: {
      safetyMode: config.safetyMode,
      webGuardrails: config.webGuardrails
    },
    policy: {
      allowedModules: config.allowedModules
    }
  };
};

const normalizeUrl = (baseUrl: string, path: string): string => {
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

const mapResponse = (raw: z.infer<typeof responseSchema>): AssistantCommandResponse => {
  return {
    success: true,
    message: raw.message,
    riskLevel: raw.riskLevel,
    actions: raw.actions
  };
};

export class OpenClawAdapter {
  private readonly options: OpenClawAdapterOptions;

  constructor(options: OpenClawAdapterOptions) {
    this.options = options;
  }

  async execute(
    request: AssistantCommandRequest,
    context: OpenClawExecutionContext
  ): Promise<AssistantExecutionResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.timeoutMs);

    try {
      const endpoint = normalizeUrl(this.options.baseUrl, this.options.path);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(buildOpenClawPayload(request, context.config)),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`OpenClaw adapter request failed with status ${response.status}`);
      }

      const payload = await response.json();
      const parsed = responseSchema.safeParse(payload);

      if (!parsed.success) {
        throw new Error('OpenClaw adapter returned an invalid response shape.');
      }

      return {
        response: mapResponse(parsed.data)
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
