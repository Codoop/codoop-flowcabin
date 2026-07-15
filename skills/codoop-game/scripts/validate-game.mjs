import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const MAX_FILES = 500;
const MAX_UNPACKED_BYTES = 40 * 1024 * 1024;
const forbiddenPatterns = [
  { pattern: /\b(?:https?|wss?):\/\//i, message: 'external network URL' },
  { pattern: /\b(?:fetch|XMLHttpRequest|WebSocket|importScripts)\b/, message: 'network API' },
  { pattern: /\b(?:eval|new\s+Function)\s*\(/, message: 'dynamic code execution' },
  { pattern: /\bnavigator\.serviceWorker\b/, message: 'service worker' },
  { pattern: /\b(?:require|process|ipcRenderer)\b/, message: 'Node or Electron API' }
];

async function listFiles(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(root, path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

function sourceFile(path) {
  return /\.(?:html?|css|m?js|json|svg)$/i.test(path);
}

export async function validateGame(root) {
  const errors = [];
  const files = await listFiles(root);
  const names = new Set(files.map((path) => relative(root, path)));
  let totalBytes = 0;

  if (!names.has('index.html')) errors.push('Missing required root index.html.');
  if (files.length > MAX_FILES) errors.push(`Game has ${files.length} files; limit is ${MAX_FILES}.`);

  for (const path of files) {
    const info = await stat(path);
    totalBytes += info.size;
    if (!sourceFile(path)) continue;
    const content = await readFile(path, 'utf8');
    for (const { pattern, message } of forbiddenPatterns) {
      if (pattern.test(content)) {
        errors.push(`${relative(root, path)} uses forbidden ${message}.`);
      }
    }
  }
  if (totalBytes > MAX_UNPACKED_BYTES) {
    errors.push(`Game expands to ${totalBytes} bytes; limit is ${MAX_UNPACKED_BYTES}.`);
  }

  return { ok: errors.length === 0, errors, files: files.length, unpackedBytes: totalBytes };
}

async function main() {
  const root = process.argv[2] ?? process.cwd();
  const report = await validateGame(root);
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
}

if (process.argv[1] && process.argv[1].split(sep).at(-1) === 'validate-game.mjs') main();
