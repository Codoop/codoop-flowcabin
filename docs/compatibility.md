# FlowCabinGameAPI v1

This contract is the public development baseline for games made by
`codoop-game`. v1 is verified through the repository preview harness. Real
Codoop Desktop webview validation is deliberately deferred.

## Runtime boundary

Games run as static H5 content with no Node, Electron, IPC, filesystem, or
network dependency. The only host bridge is `window.FlowCabinGameAPI`.

Games target a PC application panel. Mouse and keyboard are the supported player
inputs; mobile browser, touch-first, portrait, and phone-specific requirements
are out of scope.

## Submission boundary

`game.zip` contains an `index.html` at its root and only runtime assets.
`cover.png` is a separate, 16:9 PNG of at least 640×360. Limits: 20 MB zip,
500 files, and 40 MB uncompressed.

## Change record

| Version | Date | Change |
| --- | --- | --- |
| v1 | 2026-07-15 | Initial harness-only compatibility baseline. |
