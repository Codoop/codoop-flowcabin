import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { startPreviewHarness } from '../../skills/codoop-game/scripts/preview-harness.mjs';

test('serves a game with a FlowCabinGameAPI mock and lifecycle controls', async () => {
  const root = await mkdtemp(join(tmpdir(), 'codoop-preview-'));
  await writeFile(join(root, 'index.html'), '<!doctype html><script src="app.js"></script>');
  await writeFile(join(root, 'app.js'), 'window.FlowCabinGameAPI.ready()');
  const harness = await startPreviewHarness(root);
  try {
    const html = await (await fetch(harness.url)).text();
    assert.match(html, /FlowCabinGameAPI/);
    assert.match(html, /flowCabinControl/);
  } finally {
    await harness.close();
  }
});
