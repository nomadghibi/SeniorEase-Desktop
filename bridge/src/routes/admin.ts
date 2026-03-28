import { Router } from 'express';
import { z } from 'zod';
import { verifyAdminPin } from '../services/configStore.js';

const adminRouter = Router();

const verifyPinRequestSchema = z.object({
  pin: z.string().regex(/^\d{4,8}$/)
});

adminRouter.post('/verify-pin', async (request, response, next) => {
  const parsed = verifyPinRequestSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({
      success: false,
      message: 'PIN must be 4 to 8 digits.',
      errors: parsed.error.issues
    });
    return;
  }

  try {
    const valid = await verifyAdminPin(parsed.data.pin);

    response.json({
      success: true,
      valid
    });
  } catch (error) {
    next(error);
  }
});

export default adminRouter;
