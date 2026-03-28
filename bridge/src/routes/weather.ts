import { Router } from 'express';
import { z } from 'zod';
import { getCurrentWeatherByZip } from '../services/weatherService.js';

const weatherRouter = Router();

const zipSchema = z.string().regex(/^\d{5}$/);

weatherRouter.get('/current', async (request, response, next) => {
  const parsed = zipSchema.safeParse(request.query.zip);

  if (!parsed.success) {
    response.status(400).json({
      success: false,
      message: 'ZIP code must be 5 digits.'
    });
    return;
  }

  try {
    const weather = await getCurrentWeatherByZip(parsed.data);
    response.json({
      success: true,
      weather
    });
  } catch (error) {
    next(error);
  }
});

export default weatherRouter;
