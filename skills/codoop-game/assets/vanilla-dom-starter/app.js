(() => {
  const fallback = { onKeyDown: () => {}, onKeyUp: () => {}, onMouseClick: () => {}, onMouseMove: () => {}, onMouseWheel: () => {}, onPause: () => {}, onResume: () => {}, onDestroy: () => {}, ready: () => {}, reportScore: () => {}, reportProgress: () => {}, getCanvasSize: () => ({ width: innerWidth, height: innerHeight }) };
  const host = window.FlowCabinGameAPI ?? fallback;
  const score = document.querySelector('#score');
  const button = document.querySelector('[data-game-action="collect"]');
  let state = JSON.parse(localStorage.getItem('codoop-game-state') ?? '{"score":0}');
  let destroyed = false;
  const save = () => localStorage.setItem('codoop-game-state', JSON.stringify(state));
  const render = () => { score.textContent = state.score; };
  const collect = () => { if (!destroyed) { state.score += 1; save(); render(); host.reportScore(state.score); host.reportProgress({ score: state.score }); } };
  button.addEventListener('click', collect);
  addEventListener('pagehide', save);
  addEventListener('resize', () => host.getCanvasSize());
  host.onKeyDown((event) => { if (!event.repeat && event.key === ' ') collect(); });
  host.onPause(save); host.onResume(render); host.onDestroy(() => { destroyed = true; button.removeEventListener('click', collect); save(); });
  render(); host.getCanvasSize(); host.ready();
})();
