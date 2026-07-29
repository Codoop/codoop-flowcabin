# Flow Cabin Runtime API

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
