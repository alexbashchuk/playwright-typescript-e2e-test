const { spawn } = require('node:child_process');
const { createWriteStream, mkdirSync } = require('node:fs');
const { join } = require('node:path');

const projectRoot = join(__dirname, '..');
const logDirectory = join(projectRoot, 'test-debug-logs');
mkdirSync(logDirectory, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logPath = join(logDirectory, `DebugLog-${timestamp}.txt`);
const logFile = createWriteStream(logPath, { flags: 'wx' });
const playwrightCli = require.resolve('@playwright/test/cli');
const playwrightArgs = ['test', ...process.argv.slice(2)];
const child = spawn(process.execPath, [playwrightCli, ...playwrightArgs], {
  cwd: projectRoot,
  env: { ...process.env, DEBUG: 'pw:api' },
  stdio: ['inherit', 'pipe', 'pipe'],
});

console.log(`Saving Playwright debug output to ${logPath}`);
logFile.write(`Started: ${new Date().toISOString()}\r\n`);
logFile.write(`Command: playwright ${playwrightArgs.join(' ')}\r\n\r\n`);
child.stdout.pipe(process.stdout);
child.stdout.pipe(logFile);
child.stderr.pipe(process.stderr);
child.stderr.pipe(logFile);

let logWriteFailed = false;
let childStartFailed = false;
logFile.on('error', (error) => {
  logWriteFailed = true;
  console.error(`Failed to write Playwright debug log: ${error.message}`);
  child.kill();
});

child.on('error', (error) => {
  childStartFailed = true;
  console.error(`Failed to start Playwright: ${error.message}`);
});

child.on('close', (code, signal) => {
  logFile.end(() => {
    process.exitCode =
      logWriteFailed || childStartFailed || signal || code === null ? 1 : code;
    if (signal) {
      console.error(`Playwright terminated by signal ${signal}`);
    }
  });
});
