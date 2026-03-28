import { Router } from 'express';
import { z } from 'zod';
import { getConfig } from '../services/configStore.js';
import { createSupportLog, getSupportLogs } from '../services/supportLogStore.js';
import { supportRequestSchema } from '../types/support.js';

const supportRouter = Router();

supportRouter.post('/request', async (request, response, next) => {
  const parsed = supportRequestSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({
      success: false,
      message: 'Invalid support request payload.',
      errors: parsed.error.issues
    });
    return;
  }

  try {
    const entry = await createSupportLog(parsed.data);
    const config = await getConfig();

    response.json({
      success: true,
      ticketId: entry.id,
      message: `${config.supportContactName} has been notified and will follow up shortly.`,
      estimatedCallbackMinutes: entry.riskLevel === 'blocked' ? 5 : 15
    });
  } catch (error) {
    next(error);
  }
});

supportRouter.get('/logs', async (request, response, next) => {
  const limit = z.coerce.number().int().positive().max(100).optional().safeParse(request.query.limit);

  try {
    const logs = await getSupportLogs(limit.success ? limit.data : 20);
    response.json({
      success: true,
      logs
    });
  } catch (error) {
    next(error);
  }
});

export default supportRouter;
