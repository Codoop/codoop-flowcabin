# Package Contract

`game.zip` must have `index.html` at its root and contain only offline runtime
files. Its maximum size is 20 MB, it may have at most 500 files, and expanded
content may be at most 40 MB.

All HTML, CSS, JS, images, fonts, data, WASM, and audio use relative local
paths. Reject `http:`, `https:`, `fetch`, XHR, WebSocket, remote fonts, remote
dynamic imports, service workers, frames, objects, forms, `eval`, and
`new Function`. Prefer external local `styles.css` and `app.js`.

`cover.png` is not a runtime asset and never enters `game.zip`.
