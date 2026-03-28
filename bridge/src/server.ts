import cors from 'cors';
import express from 'express';
import assistantRouter from './routes/assistant.js';
import configRouter from './routes/config.js';
import supportRouter from './routes/support.js';

const app = express();
const port = Number(process.env.BRIDGE_PORT ?? 8787);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? true,
    credentials: false
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_request, response) => {
  response.json({
    ok: true,
    service: 'seniorease-bridge'
  });
});

app.use('/assistant', assistantRouter);
app.use('/config', configRouter);
app.use('/support', supportRouter);

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'Unexpected bridge error.';

  response.status(500).json({
    success: false,
    message
  });
});

app.listen(port, () => {
  console.log(`SeniorEase bridge listening on http://localhost:${port}`);
});
