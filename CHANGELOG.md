# Changelog

All notable changes to codoop-flowcabin are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0-alpha.5] - 2026-07-31

### Changed

- The plugin and marketplace identity now matches the repository name,
  changing the Codex Skill invocation to `$codoop-flowcabin:game`.
- Codex and Claude installation examples now use
  `codoop-flowcabin@codoop-flowcabin` consistently.
- English and Simplified Chinese installation docs now explain how alpha.4
  users can remove the old plugin identity before installing alpha.5.

## [0.1.0-alpha.4] - 2026-07-29

### Added

- Initial `$game` Skill for turning a natural-language game idea into editable,
  offline HTML, CSS, and JavaScript source for Flow Cabin.
- Bounded game-designer and technical-artist Sub-Agent reviews, with
  level-designer and narrative-designer roles loaded only when needed. The main
  agent remains the sole owner of generated file edits.
- A deterministic, zero-dependency project initializer that writes new games to
  `<workspace>/flow-cabin-games/<game-id>/`, refuses to overwrite existing
  projects, and prevents writes inside the installed Skill directory.
- A fixed generated-project contract with editable runtime source under
  `package/` and release artifacts under `dist/`.
- A Python standard-library packager that generates and verifies SHA-256
  manifest entries and produces import-ready ZIP files.
- Package safety checks for traversal, hidden paths, symbolic links, unsupported
  file types, missing local resources, remote URLs, network APIs, iframes,
  dynamic imports, Node/Electron APIs, invalid entry points, and size limits.
- A responsive vanilla game starter with keyboard and pointer input, local
  progress, browser-safe lifecycle fallback, and optional
  `window.FlowCabinGame.onPause/onResume` integration.
- Codex and Claude Code plugin manifests plus GitHub marketplace metadata.
- English and Simplified Chinese README documentation, installation guidance,
  output-contract references, and an MIT license.
- Automated tests covering project initialization, output placement, package
  layout, hashes, offline restrictions, unsafe paths, resource validation, and
  package limits.

## [0.1.0-alpha.3] - 2026-07-15

### Added

- An IP originality gate that preserves the requested genre or experience
  while excluding recognizable third-party expression from game and cover art.

### Changed

- Once a runnable preview exists, every creator-facing response now includes
  the current local playtest link, refreshed after every feedback round.

## [0.1.0-alpha.2] - 2026-07-15

### Changed

- The Skill now proactively invites creator playtests after the first playable
  build, material experience changes, and before final packaging.
- Starters and technical-art rules now set a desktop-first, authored visual
  baseline; phone and touch-first requirements are out of scope.
- New projects now include `visual-direction.md` and `playtest-report.md` to
  keep art direction and creator feedback explicit across iterations.

## [0.1.0-alpha.1] - 2026-07-15

### Added

- Initial `codoop-game` Skill for creating resumable, offline H5 games from a
  natural-language idea.
- Codex and Claude Code plugin manifests and marketplace metadata.
- Canvas and DOM starters with FlowCabinGameAPI lifecycle handling.
- Local preview harness, static game/cover validation, and runtime-only ZIP
  packaging with separate cover delivery.
- Shared game-design, technical-art, level-design, narrative, and audio expert
  definitions.
- English-first bilingual README, installation instructions, and architecture
  documentation.
