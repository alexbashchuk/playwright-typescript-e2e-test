/// <reference types="node" />

import { execFileSync } from 'node:child_process';

/** Starts Docker Compose services before Playwright begins the test suite. */
export default async function globalSetup() {
  /** Runs a Docker CLI command and forwards its output to the test process. */
  const runDocker = (args: string[]) => {
    execFileSync('docker', args, {
      stdio: 'inherit',
      timeout: 180_000,
    });
  };

  // Start Docker Desktop if the Docker engine is unavailable.
  try {
    execFileSync('docker', ['info'], {
      stdio: 'ignore',
      timeout: 15_000,
    });
  } catch {
    runDocker(['desktop', 'start']);
  }

  // Replace this with the actual location of your Compose file.
  runDocker([
    'compose',
    '-f',
    'D:/PROGRAMMING/icf_task/compose.yaml',
    'up',
    '-d',
    '--wait',
    '--wait-timeout',
    '120',
  ]);
}