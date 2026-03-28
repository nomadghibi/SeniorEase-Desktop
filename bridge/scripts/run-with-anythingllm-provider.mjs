import { spawn } from 'node:child_process';

const [, , command, ...args] = process.argv;

if (!command) {
  console.error('Missing command to run.');
  process.exit(1);
}

const child = spawn(command, args, {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    ASSISTANT_PROVIDER: 'anythingllm'
  }
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

