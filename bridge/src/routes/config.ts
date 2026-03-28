import { Router } from 'express';
import { appConfigPatchSchema } from '../types/config.js';
import { getConfig, resetConfig, updateConfig } from '../services/configStore.js';
import { isAdminSessionValid } from '../services/adminSessionStore.js';
import type { AppConfigPatch } from '../types/config.js';

const configRouter = Router();
const adminTokenHeader = 'x-admin-token';

const isProtectedConfigPatch = (patch: AppConfigPatch): boolean => {
  const keys = Object.keys(patch);
  return keys.some((key) => key !== 'reminders');
};

const isAdminAuthorized = (tokenHeaderValue: string | undefined): boolean => {
  if (!tokenHeaderValue) {
    return false;
  }

  return isAdminSessionValid(tokenHeaderValue);
};

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
    const currentConfig = await getConfig();
    const adminAuthRequired =
      currentConfig.requireAdminPin &&
      currentConfig.adminPinConfigured &&
      isProtectedConfigPatch(parsed.data);

    if (adminAuthRequired) {
      const adminToken = request.header(adminTokenHeader);

      if (!isAdminAuthorized(adminToken ?? undefined)) {
        response.status(401).json({
          success: false,
          message: 'Admin PIN verification is required before changing protected settings.'
        });
        return;
      }
    }

    const config = await updateConfig(parsed.data);
    response.json(config);
  } catch (error) {
    next(error);
  }
});

configRouter.post('/reset', async (request, response, next) => {
  try {
    const currentConfig = await getConfig();
    const adminAuthRequired =
      currentConfig.requireAdminPin &&
      currentConfig.adminPinConfigured;

    if (adminAuthRequired) {
      const adminToken = request.header(adminTokenHeader);

      if (!isAdminAuthorized(adminToken ?? undefined)) {
        response.status(401).json({
          success: false,
          message: 'Admin PIN verification is required before resetting settings.'
        });
        return;
      }
    }

    const config = await resetConfig();
    response.json(config);
  } catch (error) {
    next(error);
  }
});

export default configRouter;
