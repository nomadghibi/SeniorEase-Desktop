import cors from 'cors';
import express from 'express';
import adminRouter from './routes/admin.js';
import assistantRouter from './routes/assistant.js';
import configRouter from './routes/config.js';
import supportRouter from './routes/support.js';
import weatherRouter from './routes/weather.js';
import {
  getAssistantProvider,
  getAssistantRuntimeStatus
} from './services/assistantAdapter.js';

const app = express();
const port = Number(process.env.BRIDGE_PORT ?? 8787);
const host = process.env.BRIDGE_HOST ?? '127.0.0.1';
const allowedOrigins = (
  process.env.CORS_ORIGIN ??
  'http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173'
)
  .split(',')
  .map((value) => value.trim())
  .filter((value) => value.length > 0);

const isOriginAllowed = (origin: string | undefined): boolean => {
  // Allow non-browser and desktop file-based clients.
  if (!origin || origin === 'null') {
    return true;
  }

  return allowedOrigins.includes(origin);
};

app.use(
  cors({
    origin(origin, callback) {
      callback(null, isOriginAllowed(origin));
    },
    credentials: false
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_request, response) => {
  response.json({
    ok: true,
    service: 'seniorease-bridge',
    assistantProvider: getAssistantProvider(),
    assistantRuntime: getAssistantRuntimeStatus()
  });
});

app.use('/assistant', assistantRouter);
app.use('/config', configRouter);
app.use('/admin', adminRouter);
app.use('/support', supportRouter);
app.use('/weather', weatherRouter);

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'Unexpected bridge error.';

  response.status(500).json({
    success: false,
    message
  });
});

app.listen(port, host, () => {
  console.log(`SeniorEase bridge listening on http://${host}:${port}`);
});
