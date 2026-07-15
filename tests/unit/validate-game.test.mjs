import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { validateGame } from '../../skills/codoop-game/scripts/validate-game.mjs';

async function gameProject(files) {
  const root = await mkdtemp(join(tmpdir(), 'codoop-game-'));
  for (const [name, content] of Object.entries(files)) {
    const path = join(root, name);
    await mkdir(join(path, '..'), { recursive: true });
    await writeFile(path, content);
  }
  return root;
}

test('accepts an offline game with a root entry point and local resources', async () => {
  const root = await gameProject({
    'index.html': '<link rel="stylesheet" href="styles.css"><script src="app.js"></script>',
    'styles.css': 'body { margin: 0; }',
    'app.js': 'window.FlowCabinGameAPI?.ready();'
  });

  const report = await validateGame(root);
  assert.equal(report.ok, true);
  assert.deepEqual(report.errors, []);
});

test('rejects a game that requires a network resource', async () => {
  const root = await gameProject({
    'index.html': '<script src="https://cdn.example.test/game.js"></script>'
  });

  const report = await validateGame(root);
  assert.equal(report.ok, false);
  assert.match(report.errors.join('\n'), /external network URL/i);
});

test('rejects a game without a root index.html', async () => {
  const root = await gameProject({ 'app.js': 'console.log("game")' });
  const report = await validateGame(root);
  assert.equal(report.ok, false);
  assert.match(report.errors.join('\n'), /index\.html/i);
});
