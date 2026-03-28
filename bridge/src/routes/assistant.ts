import { Router } from 'express';
import { z } from 'zod';
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

assistantRouter.post('/command', (request, response) => {
  const parsed = requestSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({
      success: false,
      message: 'Invalid assistant command request.',
      errors: parsed.error.issues
    });
    return;
  }

  const result = runMockAssistant(parsed.data);
  response.json(result);
});

export default assistantRouter;
