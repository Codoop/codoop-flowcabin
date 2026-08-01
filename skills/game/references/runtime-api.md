# Flow Cabin Runtime API

## Display contract

Flow Cabin uses a `420 × 600` (`7:10`) reference frame. Its host-owned top bar
is `420 × 40`; the game package receives the remaining `420 × 560` (`3:4`)
stage.

For `workspaceAvailableHeight`:

```text
scale = workspaceAvailableHeight / 600
FlowCabin.height = workspaceAvailableHeight
FlowCabin.width = workspaceAvailableHeight * 7 / 10
TopBar.height = workspaceAvailableHeight / 15
GameStage.height = workspaceAvailableHeight * 14 / 15
GameStage.width = FlowCabin.width
```

The host right-aligns Flow Cabin, top-aligns it, and fills the full available
height. It must not cap scale or width or vertically center the frame. The host
owns the top bar; do not recreate it inside a game.

Make `html`, `body`, and the game root fill the package viewport. Design game
coordinates against `420 × 560`, keep the rendered surface at `3:4`, and react
to viewport resize. Do not add a maximum size, fixed minimum width, external
page chrome, or centering that reduces the usable stage.

Games start themselves when `index.html` loads and use normal browser input:
`keydown`, `keyup`, Pointer Events, click, context menu, and wheel.

Use `event.code` for keys. Call `preventDefault()` only for controls the game
consumes. Convert pointer coordinates with the game surface's
`getBoundingClientRect()`.

The optional host lifecycle object exposes two subscriptions:

```js
const host = window.FlowCabinGame;
const offPause = host?.onPause?.(() => pause());
const offResume = host?.onResume?.(() => resume());
```

Call returned unsubscribe functions during teardown. Do not assume the object
exists in a normal browser. There is no initialization event and no host input
bridge. Pause animation frames, timers, and sound on pause.

Local progress may use browser storage. Flow Cabin isolates it under
`persist:flow-cabin-<game-id>` and clears all storage for the game when the
user clears progress.
