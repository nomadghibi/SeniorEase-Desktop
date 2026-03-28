import { mkdirSync, writeFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

const anythingContainerName = 'anythingllm';
const anythingUrl = 'http://localhost:3001';
const anythingStorageDir = path.join(os.homedir(), 'anythingllm', 'storage');
const anythingProfilesDir = path.join(os.homedir(), 'anythingllm', 'root');
const anythingEnvFile = path.join(anythingStorageDir, '.env');

const run = (command, args) => {
  return spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf-8'
  });
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForAnything = async () => {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const response = await fetch(anythingUrl, { method: 'HEAD' });
      if (response.ok) {
        return true;
      }
    } catch {
      // Keep retrying while container warms up.
    }

    await sleep(2000);
  }

  return false;
};

const ensureAnythingLlmContainer = async () => {
  const dockerReady = run('docker', ['info']);
  if (dockerReady.status !== 0) {
    throw new Error('Docker is not available. Start Docker Desktop and run `npm run dev` again.');
  }

  mkdirSync(anythingStorageDir, { recursive: true });
  mkdirSync(anythingProfilesDir, { recursive: true });

  if (!existsSync(anythingEnvFile)) {
    writeFileSync(anythingEnvFile, '', 'utf-8');
  }

  const inspect = run('docker', [
    'ps',
    '-a',
    '--filter',
    `name=^/${anythingContainerName}$`,
    '--format',
    '{{.Status}}'
  ]);

  if (inspect.status !== 0) {
    throw new Error('Unable to inspect Docker containers for AnythingLLM.');
  }

  const status = inspect.stdout.trim();

  if (!status) {
    console.log('[dev-all] Creating AnythingLLM container...');
    const create = run('docker', [
      'run',
      '-d',
      '--name',
      anythingContainerName,
      '-p',
      '3001:3001',
      '--cap-add',
      'SYS_ADMIN',
      '-v',
      `${anythingStorageDir}:/app/server/storage`,
      '-v',
      `${anythingEnvFile}:/app/server/.env`,
      '-v',
      `${anythingProfilesDir}:/app/profiles`,
      '-e',
      'STORAGE_DIR=/app/server/storage',
      'mintplexlabs/anythingllm:latest'
    ]);

    if (create.status !== 0) {
      throw new Error(`Failed to create AnythingLLM container:\n${create.stderr}`);
    }
  } else if (!status.startsWith('Up')) {
    console.log('[dev-all] Starting existing AnythingLLM container...');
    const start = run('docker', ['start', anythingContainerName]);
    if (start.status !== 0) {
      throw new Error(`Failed to start AnythingLLM container:\n${start.stderr}`);
    }
  }

  console.log('[dev-all] Waiting for AnythingLLM on http://localhost:3001 ...');
  const reachable = await waitForAnything();
  if (!reachable) {
    throw new Error('AnythingLLM did not become reachable on port 3001.');
  }
};

const startDesktop = () => {
  console.log('[dev-all] Starting SeniorEase desktop + bridge...');
  const child = spawn('npm', ['run', 'dev:desktop'], {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env
  });

  const forwardSignal = (signal) => {
    if (!child.killed) {
      child.kill(signal);
    }
  };

  process.on('SIGINT', () => forwardSignal('SIGINT'));
  process.on('SIGTERM', () => forwardSignal('SIGTERM'));

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
};

try {
  await ensureAnythingLlmContainer();
  startDesktop();
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown startup error.';
  console.error(`[dev-all] ${message}`);
  process.exit(1);
}

