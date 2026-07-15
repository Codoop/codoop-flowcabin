import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { validateCover } from '../../skills/codoop-game/scripts/validate-cover.mjs';

function pngHeader(width, height) {
  const header = Buffer.alloc(24);
  header.set([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82]);
  header.writeUInt32BE(width, 16);
  header.writeUInt32BE(height, 20);
  return header;
}

test('accepts a 16:9 PNG cover that meets the minimum dimensions', async () => {
  const file = join(await mkdtemp(join(tmpdir(), 'codoop-cover-')), 'cover.png');
  await writeFile(file, pngHeader(1280, 720));
  const report = await validateCover(file);
  assert.equal(report.ok, true);
});

test('rejects a PNG cover with the wrong aspect ratio', async () => {
  const file = join(await mkdtemp(join(tmpdir(), 'codoop-cover-')), 'cover.png');
  await writeFile(file, pngHeader(640, 640));
  const report = await validateCover(file);
  assert.equal(report.ok, false);
  assert.match(report.errors.join('\n'), /16:9/);
});
