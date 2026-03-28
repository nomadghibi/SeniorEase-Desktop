import { Router } from 'express';
import { z } from 'zod';
import { getConfig } from '../services/configStore.js';
import { getAssistantAdapter } from '../services/assistantAdapter.js';

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
    const result = await assistantAdapter.execute(parsed.data, { config });
    response.json(result);
  } catch (error) {
    next(error);
  }
});

export default assistantRouter;
