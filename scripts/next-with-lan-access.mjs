#!/usr/bin/env node

import { spawn } from 'node:child_process';

const mode = process.argv[2];
const forwardedArgs = process.argv.slice(3);
const validModes = new Set(['dev', 'start']);

if (!validModes.has(mode)) {
  console.error('Usage: node scripts/next-with-lan-access.mjs <dev|start> [next args...]');
  process.exit(1);
}

function isTruthyEnv(value) {
  if (!value) {
    return false;
  }

  return ['1', 'true', 'yes', 'y', 'on', 'enabled', 'enable'].includes(
    value.trim().toLowerCase()
  );
}

const lanAccessEnabled = isTruthyEnv(
  process.env.ALLOW_LAN_ACCESS ?? process.env.NEXT_PUBLIC_ALLOW_LAN_ACCESS
);
const hostname = process.env.HOSTNAME || process.env.NEXT_HOSTNAME || (lanAccessEnabled ? '0.0.0.0' : 'localhost');
const args = [mode, '--port', process.env.PORT || '3000'];

if (hostname) {
  args.push('--hostname', hostname);
}

args.push(...forwardedArgs);

const child = spawn('next', args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
