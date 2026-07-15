import { readFile } from 'node:fs/promises';
import { sep } from 'node:path';

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export async function validateCover(path) {
  const errors = [];
  const data = await readFile(path);
  if (!data.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return { ok: false, errors: ['Cover must be a PNG file.'] };
  }
  if (data.length < 24 || data.subarray(12, 16).toString('ascii') !== 'IHDR') {
    return { ok: false, errors: ['Cover PNG has no valid IHDR header.'] };
  }
  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  if (width < 640 || height < 360) errors.push('Cover must be at least 640×360.');
  if (width * 9 !== height * 16) errors.push('Cover must use an exact 16:9 ratio.');
  return { ok: errors.length === 0, errors, width, height };
}

async function main() {
  const path = process.argv[2];
  if (!path) throw new Error('Usage: validate-cover.mjs <cover.png>');
  const report = await validateCover(path);
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
}

if (process.argv[1] && process.argv[1].split(sep).at(-1) === 'validate-cover.mjs') main();
