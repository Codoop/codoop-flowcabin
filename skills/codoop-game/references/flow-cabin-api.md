# FlowCabinGameAPI v1

Use only `window.FlowCabinGameAPI`. It exposes `onKeyDown`, `onKeyUp`,
`onMouseClick`, `onMouseMove`, `onMouseWheel`, `onPause`, `onResume`,
`onDestroy`, `ready`, `reportScore`, `reportProgress`, and `getCanvasSize`.

Register callbacks once during initialization. `on*` does not unsubscribe.
Use an internal destroyed flag and never register handlers again on resume.

- On load and every `resize`, use `getCanvasSize()` and relayout.
- On pause, save an internally consistent snapshot and stop frames, timers, and
  audio. It must be idempotent.
- On resume, restore state and start no more than one animation loop.
- On destroy, perform pause-equivalent cleanup and release listeners/resources.
- Also save conservatively on `visibilitychange` and `pagehide`.

Keyboard controls must be limited to A–Z, digits, arrow keys, and space. Never
depend on Tab, Enter, Escape, function keys, modifiers, native keyboard events,
or `preventDefault()`. Treat `repeat: true` as a repeated press.
