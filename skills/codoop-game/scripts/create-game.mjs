import { cp, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, sep } from 'node:path';
import { deflateSync } from 'node:zlib';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const assetsDirectory = join(scriptDirectory, '..', 'assets');

function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}

function defaultCover() {
  const width = 640;
  const height = 360;
  const pixels = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 4 + 1);
    pixels[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const pixel = row + 1 + x * 4;
      pixels[pixel] = 20 + Math.floor((x / width) * 24);
      pixels[pixel + 1] = 50 + Math.floor((y / height) * 48);
      pixels[pixel + 2] = 120 + Math.floor((x / width) * 56);
      pixels[pixel + 3] = 255;
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(pixels)),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

export async function createGame(workspace, name = 'my-codoop-game', { generateCover = false, starter = 'canvas' } = {}) {
  if (!['canvas', 'dom'].includes(starter)) throw new Error(`Unknown starter: ${starter}`);
  const target = join(workspace, name);
  await mkdir(target, { recursive: true });
  await cp(join(assetsDirectory, `vanilla-${starter}-starter`), target, { recursive: true });
  if (generateCover) await writeFile(join(target, 'cover.png'), defaultCover());
  return target;
}

async function main() {
  const workspace = process.argv[2] ?? process.cwd();
  const name = process.argv[3] ?? 'my-codoop-game';
  const starter = process.argv.includes('--starter') ? process.argv[process.argv.indexOf('--starter') + 1] : 'canvas';
  console.log(await createGame(workspace, name, { generateCover: process.argv.includes('--generate-cover'), starter }));
}

if (process.argv[1] && process.argv[1].split(sep).at(-1) === 'create-game.mjs') main();
