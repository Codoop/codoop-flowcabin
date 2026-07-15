(() => {
  const canvas = document.querySelector('#game');
  const context = canvas.getContext('2d');
  const fallback = {
    onKeyDown: () => {}, onKeyUp: () => {}, onMouseClick: () => {}, onMouseMove: () => {}, onMouseWheel: () => {},
    onPause: () => {}, onResume: () => {}, onDestroy: () => {}, ready: () => {}, reportScore: () => {}, reportProgress: () => {},
    getCanvasSize: () => ({ width: window.innerWidth, height: window.innerHeight })
  };
  const host = window.FlowCabinGameAPI ?? fallback;
  let state = JSON.parse(localStorage.getItem('codoop-game-state') ?? '{"score":0,"x":0.5,"y":0.52}');
  let frame = 0;
  let paused = false;
  let destroyed = false;
  let width = 1;
  let height = 1;
  let pixelRatio = 1;

  function save() { localStorage.setItem('codoop-game-state', JSON.stringify(state)); }
  function resize() {
    const size = host.getCanvasSize();
    width = Math.max(1, Math.floor(size.width));
    height = Math.max(1, Math.floor(size.height));
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }
  function roundRect(x, y, w, h, radius) {
    context.beginPath();
    context.roundRect(x, y, w, h, radius);
  }
  function draw() {
    if (destroyed || paused) return;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, '#050916');
    background.addColorStop(.48, '#10265a');
    background.addColorStop(1, '#30185a');
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    const horizon = context.createRadialGradient(width * .52, height * .56, 0, width * .52, height * .56, Math.max(width, height) * .6);
    horizon.addColorStop(0, 'rgba(81, 214, 255, .18)');
    horizon.addColorStop(1, 'rgba(81, 214, 255, 0)');
    context.fillStyle = horizon;
    context.fillRect(0, 0, width, height);
    context.fillStyle = 'rgba(255, 255, 255, .52)';
    for (let index = 0; index < 34; index += 1) {
      const x = (index * 89) % width;
      const y = (index * 53) % Math.max(140, height - 80);
      context.fillRect(x, y, index % 6 === 0 ? 2 : 1, index % 6 === 0 ? 2 : 1);
    }

    const panelWidth = Math.min(330, width - 32);
    roundRect(16, 16, panelWidth, 92, 16);
    context.fillStyle = 'rgba(5, 10, 28, .68)'; context.fill();
    context.strokeStyle = 'rgba(152, 222, 255, .22)'; context.lineWidth = 1; context.stroke();
    context.fillStyle = '#91e9ff'; context.font = '600 11px system-ui'; context.letterSpacing = '1.5px';
    context.fillText('STARLIGHT EXPEDITION', 34, 42);
    context.letterSpacing = '0px'; context.fillStyle = '#f7fbff'; context.font = '700 27px system-ui';
    context.fillText(`Stars collected  ${state.score}`, 34, 75);
    context.fillStyle = '#b6c8e9'; context.font = '14px system-ui';
    context.fillText('Click the beacon or use arrow keys to chart your route.', 34, 96);

    const x = state.x * width;
    const y = state.y * height;
    const glow = context.createRadialGradient(x, y, 4, x, y, 64);
    glow.addColorStop(0, 'rgba(255, 245, 153, .95)'); glow.addColorStop(.22, 'rgba(255, 195, 75, .46)'); glow.addColorStop(1, 'rgba(255, 195, 75, 0)');
    context.fillStyle = glow; context.beginPath(); context.arc(x, y, 64, 0, Math.PI * 2); context.fill();
    context.fillStyle = '#fff3b0'; context.beginPath(); context.arc(x, y, 20, 0, Math.PI * 2); context.fill();
    context.fillStyle = '#ffb447'; context.beginPath(); context.arc(x - 6, y - 7, 7, 0, Math.PI * 2); context.fill();

    context.fillStyle = 'rgba(235, 245, 255, .76)'; context.font = '13px system-ui';
    context.fillText('Autosaves · Desktop controls: mouse + arrows', 18, height - 20);
    frame = requestAnimationFrame(draw);
  }
  function collect(x, y) {
    state.score += 1; state.x = Math.max(.1, Math.min(.9, x)); state.y = Math.max(.22, Math.min(.86, y));
    save(); host.reportScore(state.score); host.reportProgress({ score: state.score });
  }
  function pause() { if (!paused) { paused = true; save(); cancelAnimationFrame(frame); } }
  function resume() { if (paused && !destroyed) { paused = false; draw(); } }
  function destroy() { if (!destroyed) { pause(); destroyed = true; window.removeEventListener('resize', resize); } }

  window.addEventListener('resize', resize);
  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  host.onMouseClick((event) => collect(event.x / width, event.y / height));
  host.onKeyDown((event) => {
    const step = .06;
    if (event.repeat) return;
    if (event.key === 'ArrowLeft') collect(state.x - step, state.y);
    if (event.key === 'ArrowRight') collect(state.x + step, state.y);
    if (event.key === 'ArrowUp') collect(state.x, state.y - step);
    if (event.key === 'ArrowDown') collect(state.x, state.y + step);
  });
  host.onPause(pause); host.onResume(resume); host.onDestroy(destroy);
  resize(); draw(); host.ready();
})();
