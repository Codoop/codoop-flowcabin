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

  const zip = await packageGame(project);
  await access(join(project, 'dist', 'cover.png'));
  const { stdout } = await run('unzip', ['-Z1', zip]);
  assert.match(stdout, /^index\.html$/m);
  assert.match(stdout, /^app\.js$/m);
  assert.doesNotMatch(stdout, /^cover\.png$/m);
});
