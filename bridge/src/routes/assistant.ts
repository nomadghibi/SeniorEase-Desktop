import { Router } from 'express';
import { z } from 'zod';
import { getConfig } from '../services/configStore.js';
import { runMockAssistant } from '../services/mockAssistant.js';

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
    const result = runMockAssistant(parsed.data, config.safetyMode);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

export default assistantRouter;
