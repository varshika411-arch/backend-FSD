import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync, spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCommand = 'npm';
const children = [];
const workspaceRoot = process.cwd();
const normalizedWorkspaceRoot = workspaceRoot.toLowerCase();
const frontendPort = Number(process.env.FRONTEND_PORT || process.env.VITE_PORT) || 5173;
const backendPort = Number(process.env.PORT) || readBackendPort();

function readBackendPort() {
  const envPath = path.join(workspaceRoot, 'backend', '.env');

  if (!fs.existsSync(envPath)) {
    return 5000;
  }

  const envFile = fs.readFileSync(envPath, 'utf8');
  const match = envFile.match(/^\s*PORT\s*=\s*(\d+)\s*$/m);

  return match ? Number(match[1]) : 5000;
}

function runCommand(command, args) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

function getListeningPids(port) {
  if (isWindows) {
    const output = runCommand('netstat', ['-ano']);
    const regex = new RegExp(`^\\s*TCP\\s+\\S+:${port}\\s+\\S+\\s+LISTENING\\s+(\\d+)\\s*$`, 'gmi');
    const pids = new Set();
    let match;

    while ((match = regex.exec(output)) !== null) {
      pids.add(Number(match[1]));
    }

    return [...pids];
  }

  try {
    const output = runCommand('lsof', ['-ti', `tcp:${port}`, '-sTCP:LISTEN']);
    return output
      .split(/\r?\n/)
      .map(line => Number(line.trim()))
      .filter(Number.isInteger);
  } catch {
    return [];
  }
}

function getProcessMap() {
  if (isWindows) {
    const output = runCommand('powershell.exe', [
      '-NoProfile',
      '-Command',
      'Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,CommandLine | ConvertTo-Json -Compress'
    ]);

    if (!output.trim()) {
      return new Map();
    }

    const records = JSON.parse(output);
    const list = Array.isArray(records) ? records : [records];

    return new Map(list.map(record => [
      Number(record.ProcessId),
      {
        pid: Number(record.ProcessId),
        parentPid: Number(record.ParentProcessId),
        commandLine: record.CommandLine || ''
      }
    ]));
  }

  const output = runCommand('ps', ['-eo', 'pid=,ppid=,command=']);
  const lines = output.split(/\r?\n/).filter(Boolean);

  return new Map(lines.map(line => {
    const match = line.match(/^\s*(\d+)\s+(\d+)\s+(.*)$/);
    return [
      Number(match[1]),
      {
        pid: Number(match[1]),
        parentPid: Number(match[2]),
        commandLine: match[3] || ''
      }
    ];
  }));
}

function isWorkspaceCommand(commandLine = '') {
  return commandLine.toLowerCase().includes(normalizedWorkspaceRoot);
}

function isBackendCommand(commandLine = '') {
  const normalized = commandLine.toLowerCase();

  return (
    normalized.includes('src/server.js') ||
    normalized.includes('src/server.jsx') ||
    normalized.includes('nodemon') ||
    normalized.includes('register-jsx-loader') ||
    normalized.includes('--prefix backend run dev')
  );
}

function isFrontendCommand(commandLine = '') {
  const normalized = commandLine.toLowerCase();
  return normalized.includes('vite') || normalized.includes('run dev:frontend');
}

function collectProjectPids(startPid, processMap, matcher) {
  const pids = new Set();
  let currentPid = startPid;
  let foundWorkspaceProcess = false;

  while (currentPid && currentPid !== process.pid) {
    const processInfo = processMap.get(currentPid);

    if (!processInfo || !matcher(processInfo.commandLine)) {
      break;
    }

    if (isWorkspaceCommand(processInfo.commandLine)) {
      foundWorkspaceProcess = true;
    }

    pids.add(currentPid);
    currentPid = processInfo.parentPid;
  }

  return foundWorkspaceProcess ? pids : null;
}

function terminatePid(pid) {
  if (isWindows) {
    spawn('taskkill', ['/pid', String(pid), '/t', '/f'], {
      stdio: 'ignore'
    });
    return;
  }

  process.kill(pid, 'SIGTERM');
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ensurePortAvailable(port, name, matcher) {
  const listeningPids = getListeningPids(port);

  if (listeningPids.length === 0) {
    return;
  }

  const processMap = getProcessMap();
  const pidsToTerminate = new Set();

  for (const pid of listeningPids) {
    const processInfo = processMap.get(pid);

    const projectPids = processInfo ? collectProjectPids(pid, processMap, matcher) : null;

    if (!projectPids) {
      throw new Error(`Port ${port} is already in use by another process. Stop it or change the port before running npm run dev.`);
    }

    for (const projectPid of projectPids) {
      pidsToTerminate.add(projectPid);
    }
  }

  for (const pid of pidsToTerminate) {
    terminatePid(pid);
  }

  for (let attempt = 0; attempt < 20; attempt += 1) {
    await wait(250);
    if (getListeningPids(port).length === 0) {
      console.log(`Cleared stale ${name} process on port ${port}.`);
      return;
    }
  }

  throw new Error(`Failed to clear stale ${name} process from port ${port}.`);
}

function run(name, args, cwd) {
  let child;

  try {
    child = spawn(npmCommand, args, {
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

try {
  await ensurePortAvailable(backendPort, 'backend', isBackendCommand);
  await ensurePortAvailable(frontendPort, 'frontend', isFrontendCommand);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

run('backend', ['--prefix', 'backend', 'run', 'dev'], workspaceRoot);
run('frontend', ['run', 'dev:frontend'], workspaceRoot);
