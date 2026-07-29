# Generated Project Layout

Treat the installed plugin and this Skill's directory as read-only. Never place
a generated game, preview artifact, ZIP, notes, or temporary file inside them.

## Default destination

Use the creator's active coding workspace:

```text
<workspace>/
└── flow-cabin-games/
    └── <game-id>/
        ├── package/
        │   ├── manifest.json
        │   ├── index.html
        │   ├── game.js
        │   ├── styles.css
        │   ├── cover.svg
        │   └── assets/
        └── dist/
            └── <game-id>-<version>.zip
```

`package/` is the editable runtime source and the only directory whose contents
enter the ZIP. `dist/` contains generated release files only. Keep tests,
design notes, screenshots, and other development files outside `package/`.

Create new projects with `scripts/create_game.py`. The initializer always uses
`<workspace>/flow-cabin-games/` unless the creator explicitly requests another
output root. It refuses to overwrite an existing game or write into the Skill
directory.

For an existing game, edit its current directory in place. Preserve its
`manifest.json.id`, increment `version`, and replace the ZIP in its own `dist/`.
