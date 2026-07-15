(() => {
  const canvas = document.querySelector('#game');
  const context = canvas.getContext('2d');
  const fallback = {
    onKeyDown: () => {}, onKeyUp: () => {}, onMouseClick: () => {}, onMouseMove: () => {}, onMouseWheel: () => {},
    onPause: () => {}, onResume: () => {}, onDestroy: () => {}, ready: () => {}, reportScore: () => {}, reportProgress: () => {},
    getCanvasSize: () => ({ width: window.innerWidth, height: window.innerHeight })
  };
  const host = window.FlowCabinGameAPI ?? fallback;
  let state = JSON.parse(localStorage.getItem('codoop-game-state') ?? '{"score":0,"x":0.5,"y":0.5}');
  let frame = 0;
  let paused = false;
  let destroyed = false;

  function save() { localStorage.setItem('codoop-game-state', JSON.stringify(state)); }
  function resize() {
    const size = host.getCanvasSize();
    canvas.width = Math.max(1, Math.floor(size.width));
    canvas.height = Math.max(1, Math.floor(size.height));
  }
  function draw() {
    if (destroyed || paused) return;
    context.fillStyle = '#07142f'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#facc15'; context.beginPath();
    context.arc(state.x * canvas.width, state.y * canvas.height, 22, 0, Math.PI * 2); context.fill();
    context.fillStyle = '#fff'; context.font = '20px system-ui';
    context.fillText(`Stars: ${state.score}`, 18, 32);
    context.font = '14px system-ui'; context.fillText('Click or use arrows to collect stars. Your progress is saved.', 18, 58);
    frame = requestAnimationFrame(draw);
  }
  function collect(x, y) {
    state.score += 1; state.x = Math.max(.08, Math.min(.92, x)); state.y = Math.max(.18, Math.min(.88, y));
    save(); host.reportScore(state.score); host.reportProgress({ score: state.score });
  }
  function pause() { if (!paused) { paused = true; save(); cancelAnimationFrame(frame); } }
  function resume() { if (paused && !destroyed) { paused = false; draw(); } }
  function destroy() { if (!destroyed) { pause(); destroyed = true; window.removeEventListener('resize', resize); } }

  window.addEventListener('resize', resize);
  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  host.onMouseClick((event) => collect(event.x / canvas.width, event.y / canvas.height));
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
