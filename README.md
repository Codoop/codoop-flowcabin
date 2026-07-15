<div align="center">

# codoop-game

**English** · [简体中文](./README.zh-CN.md)

**From a game idea to a playable, submit-ready offline H5 game**

![Codex Skill](https://img.shields.io/badge/Codex-skill-1D4ED8)
![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin-8A63D2)
![Node](https://img.shields.io/badge/Node-20%2B-339933)
![Runtime deps](https://img.shields.io/badge/runtime%20deps-zero-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

**codoop-game** is a single creation loop for making Codoop games. Describe a game in plain language; Codex or Claude handles the game card, implementation, preview, quality gates, and packaging. The result is a portal-ready `game.zip` and a separate `cover.png`.

The current compatibility baseline is the local preview harness. Real Codoop Desktop webview validation has not been connected yet, so passing the harness is never presented as Desktop validation.

```
you describe a game idea                              you decide when to deliver and publish
        │                                                                  ▲
        ▼                                                                  │
┌────────────────── Codex / Claude reads SKILL.md and orchestrates ──────────────────┐
│ game card → expert review → build → harness preview → feedback loop → validate → package │
│              [rules]        [agent]    [script]          [agent]        [scripts] │
│                                                                                     │
│ fixed experts: game design and technical art; level, narrative, and audio join as needed │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Install

### Codex (Desktop or CLI)

Install from the GitHub marketplace repository:

```bash
codex plugin marketplace add Codoop/codoop-game
codex plugin add codoop-game@codoop-game
```

Restart or reopen Codex, then simply say:

```text
Use $codoop-game to make a farming game that players can pause and continue later.
```

### Claude Code

```text
/plugin marketplace add Codoop/codoop-game
/plugin install codoop-game@codoop-game
```

If SSH is not configured, use the full HTTPS URL:

```text
/plugin marketplace add https://github.com/Codoop/codoop-game.git
/plugin install codoop-game@codoop-game
```

For local development:

```bash
claude --plugin-dir /path/to/codoop-game
```

**Prerequisites**: Node.js 20+ and system `zip` / `unzip`. There are no third-party runtime npm dependencies.

---

## Quick start

Tell the installed agent what you want to make:

```text
Use $codoop-game to make a pixel-art space-trading strategy game. Players should be able to stop and return later; give me a submission package and cover when it is ready.
```

The creation loop:

1. Writes a one-page game card with the player goal, loop, controls, and continuation model.
2. Loads game design and technical-art experts; level, narrative, and audio experts join when the idea requires them.
3. Creates an isolated static H5 project in the creator-selected workspace.
4. Starts a local harness that mocks FlowCabinGameAPI input, size, and lifecycle events.
5. Applies one player-visible feedback change per iteration and previews it again.
6. Asks the creator for a cover first; generates an original `cover.png` only when requested.
7. Validates offline resources, entry point, size, file count, and cover before delivering the package.

```text
dist/
├── game.zip                 # runtime package for the Codoop portal
├── cover.png                # separate product cover, never in the ZIP
└── validation-report.md     # validation outcome written by the agent at delivery
```

---

## Architecture

The project has three kinds of components:

1. **Skill orchestration** — [`skills/codoop-game/SKILL.md`](./skills/codoop-game/SKILL.md) defines the conversation, expert gates, preview, and delivery sequence.
2. **Deterministic scripts** — create starters, run the preview harness, scan offline restrictions, validate covers, and package the ZIP without relying on agent judgment.
3. **Experts and contracts** — [`skills/_shared/`](./skills/_shared/) contains design roles; `references/` freezes API, package, cover, and quality rules.

See the full [Skill architecture](./docs/skill-architecture.md) for responsibilities, data flow, and quality gates.
See [installation details](./docs/install.md) for standalone Skill installation and other agents.

### Project structure

```text
codoop-game/
├── .codex-plugin/             # Codex plugin manifest
├── .claude-plugin/            # Claude Code plugin and marketplace manifest
├── skills/
│   ├── codoop-game/           # main Skill, scripts, contracts, and starters
│   └── _shared/               # on-demand game expert definitions
├── tests/                     # unit and integration tests
└── docs/                      # public compatibility and architecture docs
```

---

## Local development

Run all tests:

```bash
npm test
```

Run the complete flow manually:

```bash
node skills/codoop-game/scripts/create-game.mjs /tmp my-game --generate-cover
node skills/codoop-game/scripts/preview-harness.mjs /tmp/my-game
node skills/codoop-game/scripts/validate-game.mjs /tmp/my-game
node skills/codoop-game/scripts/validate-cover.mjs /tmp/my-game/cover.png
node skills/codoop-game/scripts/package-game.mjs /tmp/my-game
```

Use `--generate-cover` only for development or when a creator has explicitly asked for a generated cover. The normal workflow asks the creator to provide it first.

## Contributing

When changing a compatibility contract, update `docs/compatibility.md` and the corresponding `references/` first, then update starters, the harness, validation scripts, and tests. Every behavioral change needs a test, and `game.zip` must never contain `cover.png`.

## License

[MIT](./LICENSE)
