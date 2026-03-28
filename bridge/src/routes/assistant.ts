import { Router } from 'express';
import { z } from 'zod';
import { getConfig } from '../services/configStore.js';
import { getAssistantAdapter } from '../services/assistantAdapter.js';
import {
  getAssistantSession,
  setAssistantSession
} from '../services/assistantSessionStore.js';

const requestSchema = z.object({
  userId: z.string().min(1),
  sessionId: z.string().min(1),
  command: z.string().min(1),
  context: z
    .object({
      screen: z.string().optional(),
      selectedEmailId: z.string().optional()
    })
    .optional()
});

const assistantRouter = Router();
const assistantAdapter = getAssistantAdapter();

assistantRouter.post('/command', async (request, response, next) => {
  const parsed = requestSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({
      success: false,
      message: 'Invalid assistant command request.',
      errors: parsed.error.issues
    });
    return;
  }

  try {
    const config = await getConfig();
    const session = getAssistantSession(parsed.data.sessionId);
    const result = await assistantAdapter.execute(parsed.data, { config, session });

    setAssistantSession(parsed.data.sessionId, {
      lastCommand: parsed.data.command,
      lastRiskLevel: result.response.riskLevel,
      lastActionId:
        result.sessionUpdate?.lastActionId ??
        result.response.actions[0]?.id ??
        session?.lastActionId,
      lastIntent: result.sessionUpdate?.lastIntent ?? session?.lastIntent ?? 'unknown',
      lastContactName:
        result.sessionUpdate?.lastContactName ?? session?.lastContactName,
      lastFavoriteLabel:
        result.sessionUpdate?.lastFavoriteLabel ?? session?.lastFavoriteLabel,
      updatedAt: new Date().toISOString()
    });

    response.json(result.response);
  } catch (error) {
    next(error);
  }
});

export default assistantRouter;
