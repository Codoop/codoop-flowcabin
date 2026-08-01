<div align="center">

# codoop-flowcabin

**English** · [简体中文](./README.zh-CN.md)

**Turn one game idea into editable source and an import-ready Flow Cabin ZIP**

![Codex Plugin](https://img.shields.io/badge/Codex-plugin-111827)
![Claude Code Plugin](https://img.shields.io/badge/Claude%20Code-plugin-8A63D2)
![Python](https://img.shields.io/badge/python-3.9%2B-blue)
![Zero dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

**codoop-flowcabin** is an open-source Coding Agent plugin for creating small,
offline Flow Cabin games from plain-language ideas.

The agent handles game design, visual direction, implementation, browser
playtesting, and iteration. Deterministic Python scripts handle the work that
must be exact: project placement, package validation, SHA-256 manifests, and
ZIP creation.

```text
you describe a game
        │
        ▼
game design + technical art Sub-Agents
        │
        ▼
editable HTML / CSS / JavaScript
        │
        ▼
browser preview → validate → package
        │
        ▼
flow-cabin-games/<game-id>/dist/<game-id>-<version>.zip
```

The plugin directory is treated as read-only. Generated games always live in
the creator's coding workspace.

---

## Install

### Codex Desktop or CLI

```bash
codex plugin marketplace add Codoop/codoop-flowcabin
codex plugin add codoop-flowcabin@codoop-flowcabin
```

Restart or reopen Codex, choose `/Codoop Flowcabin: Game`, then say:

```text
Make a one-button lantern game for Flow Cabin.
```

#### Upgrading from alpha.4 with Codex

Alpha.5 changes the plugin identity from `codoop-flow-cabin` to match the
repository name. Remove the old identity before installing the new one:

```bash
codex plugin remove codoop-flow-cabin@codoop-flow-cabin
codex plugin marketplace remove codoop-flow-cabin
codex plugin marketplace add Codoop/codoop-flowcabin
codex plugin add codoop-flowcabin@codoop-flowcabin
```

### Claude Code

```text
/plugin marketplace add Codoop/codoop-flowcabin
/plugin install codoop-flowcabin@codoop-flowcabin
```

Then invoke:

```text
/codoop-flowcabin:game Make a small keyboard-controlled space game.
```

#### Upgrading from alpha.4 with Claude Code

```text
/plugin uninstall codoop-flow-cabin@codoop-flow-cabin
/plugin marketplace remove codoop-flow-cabin
/plugin marketplace add Codoop/codoop-flowcabin
/plugin install codoop-flowcabin@codoop-flowcabin
```

> No SSH key? Add the marketplace with the full HTTPS URL:
> `https://github.com/Codoop/codoop-flowcabin.git`
>
> Local development: `claude --plugin-dir /path/to/codoop-flowcabin`

**Prerequisite:** Python 3.9 or newer. The generated games and packaging tools
have no third-party runtime dependencies.

---

## Quick start

Describe the game, controls, and mood in one request:

```text
/Codoop Flowcabin: Game Make a desktop game where I steer a moon rover left and right,
collect blue crystals, and avoid orange rocks.
```

The Skill will:

1. Ask at most one question when a real gameplay choice is missing.
2. Run game-design and technical-art reviews in parallel when Sub-Agents are
   available; level and narrative reviewers join only when needed.
3. Create the game under the active coding workspace.
4. Implement editable vanilla HTML, CSS, and JavaScript.
5. Preview keyboard, pointer, pause, resume, restart, and resize behavior.
6. Validate offline restrictions, paths, hashes, file count, and size limits.
7. Produce an import-ready ZIP.

The remaining human step is to import the ZIP into Flow Cabin and confirm its
cover, controls, pause, and resume behavior.

---

## Generated project

Every new game uses one predictable layout:

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

- `package/` is the editable runtime source and the only content placed in the
  ZIP.
- `dist/` contains generated release files.
- Existing games keep the same `manifest.json.id` and receive an explicit
  version update.
- Another output root is used only when the creator explicitly requests it.
- The initializer refuses to overwrite an existing game or write into the
  installed Skill directory.

See [`project-layout.md`](./skills/game/references/project-layout.md) for the
complete output contract.

---

## How it works

### 1. Skill orchestration

[`skills/game/SKILL.md`](./skills/game/SKILL.md) defines the creation,
playtest, review, validation, and delivery sequence.

### 2. Expert Sub-Agents

Review-only roles live in [`skills/_shared/`](./skills/_shared/):

- `game-designer` — goal, core loop, controls, feedback, and retry behavior.
- `technical-artist` — original visual direction, hierarchy, HUD, and cover.
- `level-designer` — maps, waves, stages, puzzles, and difficulty progression.
- `narrative-designer` — premise, dialogue, missions, and choices.

The main agent owns all file edits. Experts return bounded decisions, risks,
and acceptance checks, so parallel reviews cannot overwrite the game.

### 3. Deterministic scripts

- [`create_game.py`](./skills/game/scripts/create_game.py) creates the standard
  project in the user's workspace.
- [`flow_cabin_package.py`](./skills/game/scripts/flow_cabin_package.py)
  validates and packages the runtime using only the Python standard library.

### 4. Contracts and starter

The Skill ships a playable vanilla starter plus frozen references for project
layout, package security, runtime lifecycle, and expert orchestration.

---

## Package guarantees

| Guarantee | Behavior |
|---|---|
| Offline-first | Rejects remote URLs, network APIs, iframes, dynamic imports, and Node/Electron APIs |
| Safe paths | Rejects traversal, hidden package paths, symbolic links, and missing local resources |
| Exact manifest | Rewrites and verifies SHA-256 for every runtime file except `manifest.json` |
| Size limits | Maximum 1,000 files, 100 MiB unpacked, and 25 MiB ZIP |
| Native runtime | Uses local HTML, CSS, JavaScript, SVG, PNG, WebP, and JSON only |
| Browser fallback | Runs without `window.FlowCabinGame`; subscribes to pause/resume when available |

Only `package/` enters the archive, and the ZIP root contains
`manifest.json` and `index.html` directly.

---

## Manual CLI

Coding Agents call these scripts automatically. For local development:

```bash
python3 skills/game/scripts/create_game.py /path/to/workspace my-game \
  --title "My Game"

python3 skills/game/scripts/flow_cabin_package.py pack \
  /path/to/workspace/flow-cabin-games/my-game/package \
  --output /path/to/workspace/flow-cabin-games/my-game/dist/my-game-1.0.0.zip

python3 skills/game/scripts/flow_cabin_package.py validate \
  /path/to/workspace/flow-cabin-games/my-game/package
```

---

## Repository layout

```text
codoop-flowcabin/
├── .agents/plugins/marketplace.json
├── .claude-plugin/
│   ├── marketplace.json
│   └── plugin.json
├── .codex-plugin/plugin.json
├── skills/
│   ├── _shared/                 # expert review roles
│   └── game/
│       ├── SKILL.md             # agent orchestration
│       ├── references/          # output, runtime, package, and review contracts
│       ├── scripts/             # deterministic initializer and packager
│       └── templates/           # editable vanilla starter
├── tests/
├── docs/install.md
├── CHANGELOG.md
├── README.md
└── README.zh-CN.md
```

English documents use suffix-less filenames. Chinese documents use the
`.zh-CN` suffix.

---

## Running tests

```bash
python3 -m unittest discover -s tests -v
```

The tests run without AI or network access. They cover project initialization,
standard output placement, ZIP layout, hashes, offline restrictions, traversal,
symbolic links, bad entry points, missing resources, and package limits.

---

## Compatible Coding Agents

| Agent | Status | Installation |
|---|---|---|
| Codex Desktop | First-class | Codex plugin marketplace |
| Codex CLI | First-class | Codex plugin marketplace |
| Claude Code | First-class | Claude plugin marketplace |
| Cursor / Gemini | Generic | Copy the Skill and let the agent read `SKILL.md` |

If the host does not support Sub-Agents, the main agent applies the same expert
roles sequentially.

---

## FAQ

**Where are generated games stored?**
Under `<workspace>/flow-cabin-games/<game-id>/` by default, never inside the
installed plugin.

**Can I choose another output directory?**
Yes. Ask for it explicitly. Otherwise the standard workspace path is used.

**Can the Skill update an existing game?**
Yes. It edits the existing project in place, preserves the game ID, increments
the version, and replaces the ZIP in that project's `dist/`.

**Does this use React, Phaser, Vite, or npm?**
No. Games use editable vanilla HTML, CSS, and JavaScript.

**Does a passing validation mean it was tested inside Flow Cabin?**
No. Browser and package validation are automated; real Flow Cabin import is the
creator's final acceptance step.

**Why are source and ZIP separated?**
The source remains easy to edit, while `dist/` is safe to delete and regenerate.

---

## Learn more

- [`docs/install.md`](./docs/install.md) — local installation and generated project behavior.
- [`CHANGELOG.md`](./CHANGELOG.md) — release history.
- [`skills/game/references/project-layout.md`](./skills/game/references/project-layout.md) — generated output contract.
- [`skills/game/references/package-v1.md`](./skills/game/references/package-v1.md) — package and manifest contract.
- [`skills/game/references/runtime-api.md`](./skills/game/references/runtime-api.md) — Flow Cabin lifecycle integration.

---

<div align="center">
MIT License
</div>
