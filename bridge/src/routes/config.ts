import { Router } from 'express';
import { appConfigPatchSchema } from '../types/config.js';
import { getConfig, updateConfig } from '../services/configStore.js';

const configRouter = Router();

configRouter.get('/', async (_request, response, next) => {
  try {
    const config = await getConfig();
    response.json(config);
  } catch (error) {
    next(error);
  }
});

configRouter.post('/', async (request, response, next) => {
  const parsed = appConfigPatchSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({
      success: false,
      message: 'Invalid config update request.',
      errors: parsed.error.issues
    });
    return;
  }

  try {
    const config = await updateConfig(parsed.data);
    response.json(config);
  } catch (error) {
    next(error);
  }
});

export default configRouter;
