import { copyFile, mkdir, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join, resolve, sep } from 'node:path';

import { validateGame } from './validate-game.mjs';
import { validateCover } from './validate-cover.mjs';

const run = promisify(execFile);
const MAX_ZIP_BYTES = 20 * 1024 * 1024;

export async function packageGame(project) {
  const root = resolve(project);
  const report = await validateGame(root);
  if (!report.ok) throw new Error(`Cannot package an invalid game:\n${report.errors.join('\n')}`);
  const output = join(root, 'dist');
  const zip = join(output, 'game.zip');
  const cover = join(root, 'cover.png');
  const coverReport = await validateCover(cover);
  if (!coverReport.ok) throw new Error(`Cannot deliver an invalid cover:\n${coverReport.errors.join('\n')}`);
  await mkdir(output, { recursive: true });
  await run('zip', ['-rq', zip, '.', '-x', 'dist/*', 'cover.png', 'design-notes.md', 'validation-report.md'], { cwd: root });
  const info = await stat(zip);
  if (info.size > MAX_ZIP_BYTES) throw new Error(`game.zip is ${info.size} bytes; limit is ${MAX_ZIP_BYTES}.`);
  await copyFile(cover, join(output, 'cover.png'));
  return zip;
}

async function main() {
  const project = process.argv[2] ?? process.cwd();
  console.log(await packageGame(project));
}

if (process.argv[1] && process.argv[1].split(sep).at(-1) === 'package-game.mjs') main();
