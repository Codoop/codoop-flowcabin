import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

const mimeTypes = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.wasm': 'application/wasm'
};

const mockScript = String.raw`<script>
(() => {
  const callbacks = { keydown: [], keyup: [], click: [], move: [], wheel: [], pause: [], resume: [], destroy: [] };
  const call = (name, value) => callbacks[name].forEach((callback) => callback(value));
  window.FlowCabinGameAPI = {
    onKeyDown: (callback) => callbacks.keydown.push(callback), onKeyUp: (callback) => callbacks.keyup.push(callback),
    onMouseClick: (callback) => callbacks.click.push(callback), onMouseMove: (callback) => callbacks.move.push(callback), onMouseWheel: (callback) => callbacks.wheel.push(callback),
    onPause: (callback) => callbacks.pause.push(callback), onResume: (callback) => callbacks.resume.push(callback), onDestroy: (callback) => callbacks.destroy.push(callback),
    ready: () => console.info('[FlowCabin] ready'), reportScore: (score) => console.info('[FlowCabin] score', score),
    reportProgress: (data) => console.info('[FlowCabin] progress', data), getCanvasSize: () => ({ width: window.innerWidth, height: window.innerHeight })
  };
  const panel = document.createElement('aside');
  panel.style.cssText = 'position:fixed;right:8px;bottom:8px;z-index:2147483647;display:flex;gap:4px;padding:6px;background:#111c;color:#fff;font:12px system-ui;border-radius:6px';
  ['pause', 'resume', 'destroy'].forEach((name) => { const button = document.createElement('button'); button.textContent = name; button.dataset.flowCabinControl = name; button.onclick = () => call(name); panel.append(button); });
  addEventListener('DOMContentLoaded', () => document.body.append(panel));
  addEventListener('keydown', (event) => call('keydown', { type: 'keydown', key: event.key, code: event.code, timestamp: performance.now(), repeat: event.repeat }));
  addEventListener('keyup', (event) => call('keyup', { type: 'keyup', key: event.key, code: event.code, timestamp: performance.now(), repeat: event.repeat }));
  addEventListener('mousedown', (event) => call('click', { type: 'click', button: ['left','middle','right'][event.button] ?? 'left', x: event.clientX, y: event.clientY, timestamp: performance.now() }));
  addEventListener('mousemove', (event) => call('move', { type: 'move', x: event.clientX, y: event.clientY, timestamp: performance.now() }));
  addEventListener('wheel', (event) => call('wheel', { type: 'wheel', x: event.clientX, y: event.clientY, deltaX: event.deltaX, deltaY: event.deltaY, timestamp: performance.now() }));
})();
</script>`;

function localPath(root, requestPath) {
  const pathname = decodeURIComponent(requestPath.split('?')[0]);
  const relative = pathname === '/' ? 'index.html' : normalize(pathname).replace(/^[/\\]+/, '');
  const path = resolve(root, relative);
  if (!path.startsWith(`${root}${sep}`) && path !== root) throw new Error('Path escapes preview root.');
  return path;
}

export async function startPreviewHarness(project, port = 0) {
  const root = resolve(project);
  const server = createServer(async (request, response) => {
    try {
      const path = localPath(root, request.url ?? '/');
      let body = await readFile(path);
      const extension = extname(path).toLowerCase();
      if (extension === '.html') {
        const html = body.toString('utf8');
        body = Buffer.from(/<head([^>]*)>/i.test(html)
          ? html.replace(/<head([^>]*)>/i, `<head$1>${mockScript}`)
          : `${mockScript}${html}`);
      }
      response.writeHead(200, { 'content-type': mimeTypes[extension] ?? 'application/octet-stream', 'cache-control': 'no-store' });
      response.end(body);
    } catch (error) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end(error instanceof Error ? error.message : 'Not found');
    }
  });
  await new Promise((resolveListening) => server.listen(port, '127.0.0.1', resolveListening));
  const address = server.address();
  return {
    url: `http://127.0.0.1:${address.port}/`,
    close: () => new Promise((resolveClosed, reject) => server.close((error) => error ? reject(error) : resolveClosed()))
  };
}

async function main() {
  const harness = await startPreviewHarness(process.argv[2] ?? process.cwd());
  console.log(`Preview ready: ${harness.url}`);
  process.on('SIGINT', () => harness.close().then(() => process.exit(0)));
}

if (process.argv[1]?.split(sep).at(-1) === 'preview-harness.mjs') main();
