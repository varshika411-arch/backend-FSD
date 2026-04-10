import { spawn } from 'node:child_process';
import path from 'node:path';

const isWindows = process.platform === 'win32';
const children = [];

function run(name, command, args, cwd) {
  let child;

  try {
    child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      env: process.env,
      shell: isWindows,
    });
  } catch (error) {
    console.error(`Failed to start ${name}:`, error);
    shutdown(1);
    return null;
  }

  child.on('error', error => {
    if (shuttingDown) {
      return;
    }

    console.error(`Failed to start ${name}:`, error);
    shutdown(1);
  });

  child.on('exit', code => {
    if (shuttingDown) {
      return;
    }

    console.error(`${name} exited with code ${code ?? 0}`);
    shutdown(code ?? 1);
  });

  children.push(child);
  return child;
}

let shuttingDown = false;

function terminateChild(child) {
  if (!child || child.killed) {
    return;
  }

  if (isWindows) {
    spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
      stdio: 'ignore',
    });
    return;
  }

  child.kill('SIGINT');
}

function shutdown(code = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  for (const child of children) {
    terminateChild(child);
  }

  setTimeout(() => process.exit(code), 250);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

run('backend', 'mvn', ['spring-boot:run'], path.join(process.cwd(), 'backend'));
run('frontend', 'npm', ['run', 'dev:frontend'], process.cwd());
