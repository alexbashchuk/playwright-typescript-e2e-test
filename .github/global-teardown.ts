/// <reference types="node" />

import { execFileSync } from 'node:child_process';

export default async function globalTeardown() {
  if (process.env.PW_CHROME_DOCKER_CLEANUP !== 'on') {
    return;
  }

  const errors: unknown[] = [];

  try {
    const runningContainers = execFileSync('docker', ['ps', '-q'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
      timeout: 180_000,
    })
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (runningContainers.length > 0) {
      execFileSync('docker', ['stop', ...runningContainers], {
        stdio: 'inherit',
        timeout: 180_000,
      });
    }
  } catch (error) {
    errors.push(error);
  }

  try {
    execFileSync('docker', ['desktop', 'stop'], {
      stdio: 'inherit',
      timeout: 180_000,
    });
  } catch (error) {
    errors.push(error);
  }

  if (errors.length === 1) {
    throw errors[0];
  }
  if (errors.length > 1) {
    throw new AggregateError(errors, 'Docker cleanup failed.');
  }
}
