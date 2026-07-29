# Flow Cabin Package v1

Only the contents of a game's `package/` directory enter the ZIP. The archive
root contains `manifest.json`, `index.html`, and local runtime files. It must
contain no absolute paths, `..` segments, hidden development files, or symbolic
links. Limits are 1,000 files, 100 MiB uncompressed, and 25 MiB compressed.

Allowed types are `.html`, `.css`, `.js`, `.json`, `.svg`, `.png`, and `.webp`.
Do not use remote, protocol-relative, data, or blob URLs; iframes; inline
scripts or styles; network requests; dynamic imports; service workers;
fullscreen; or Node/Electron APIs.

## Manifest

```json
{
  "id": "star-catcher",
  "title": "Star Catcher",
  "version": "1.0.0",
  "entry": "index.html",
  "cover": "cover.svg",
  "files": {
    "cover.svg": "<lowercase SHA-256>",
    "game.js": "<lowercase SHA-256>",
    "index.html": "<lowercase SHA-256>",
    "styles.css": "<lowercase SHA-256>"
  }
}
```

Use a lowercase kebab-case ID and semantic version. `entry` is always
`index.html`. `cover` is an existing local `.svg`, `.png`, or `.webp`.
`files` lists every regular package file except `manifest.json`, sorted by
relative POSIX path. Each value is the SHA-256 of the exact file bytes.

`pack` validates structure and offline rules, replaces `files`, then creates
the ZIP. `validate` requires the stored mapping to be complete and current.
