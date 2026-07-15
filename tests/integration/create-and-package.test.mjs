import assert from 'node:assert/strict';
import { access, mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';

import { createGame } from '../../skills/codoop-game/scripts/create-game.mjs';
import { packageGame } from '../../skills/codoop-game/scripts/package-game.mjs';

const run = promisify(execFile);

test('creates a resumable canvas game and packages runtime files without its cover', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'codoop-create-'));
  const project = await createGame(workspace, 'star-farm', { generateCover: true });
  await access(join(project, 'index.html'));
  await access(join(project, 'app.js'));
  await access(join(project, 'styles.css'));
  await readFile(join(project, 'cover.png'));
  const visualDirection = await readFile(join(project, 'visual-direction.md'), 'utf8');
  const playtestReport = await readFile(join(project, 'playtest-report.md'), 'utf8');
  assert.match(visualDirection, /Visual premise/);
  assert.match(playtestReport, /Build/);

  const zip = await packageGame(project);
  await access(join(project, 'dist', 'cover.png'));
  const { stdout } = await run('unzip', ['-Z1', zip]);
  assert.match(stdout, /^index\.html$/m);
  assert.match(stdout, /^app\.js$/m);
  assert.doesNotMatch(stdout, /^cover\.png$/m);
});

test('can create the DOM starter when a game benefits from semantic UI', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'codoop-dom-'));
  const project = await createGame(workspace, 'market-ledger', { starter: 'dom' });
  const html = await readFile(join(project, 'index.html'), 'utf8');
  assert.match(html, /data-game-action/);
});

test('ships desktop-first starters with an authored visual baseline', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'codoop-visual-'));
  const canvasProject = await createGame(workspace, 'canvas-game');
  const domProject = await createGame(workspace, 'dom-game', { starter: 'dom' });

  const canvas = await readFile(join(canvasProject, 'app.js'), 'utf8');
  const domStyles = await readFile(join(domProject, 'styles.css'), 'utf8');
  assert.match(canvas, /devicePixelRatio/);
  assert.match(canvas, /createLinearGradient/);
  assert.match(domStyles, /letter-spacing/);
  assert.match(domStyles, /box-shadow/);
  assert.doesNotMatch(domStyles, /touch-action/);
});
