---
name: game
description: Create, modify, validate, and package editable offline HTML/CSS/JavaScript games for Codoop Flow Cabin. Use when a user describes a small Flow Cabin game, asks to update an existing game while preserving its ID, needs an import-ready ZIP, or needs a Flow Cabin package checked for manifest hashes, safe paths, size limits, and forbidden network or host APIs.
---

# Game

Build the smallest polished version of the requested game with only local,
editable HTML, CSS, JavaScript, SVG, PNG, WebP, and JSON files.

## Workflow

1. Ask at most one question, and only when the answer changes the core game.
   Otherwise choose a sensible control scheme and visual theme.
2. Read [project-layout.md](references/project-layout.md),
   [package-v1.md](references/package-v1.md), and
   [runtime-api.md](references/runtime-api.md), then follow
   [expert-orchestration.md](references/expert-orchestration.md). Use
   sub-agents for the bounded expert reviews when supported; keep all file
   edits with the main agent.
3. Treat the Skill directory as read-only. For a new game, resolve this Skill's
   absolute directory and initialize the project in the creator's active coding
   workspace:

   ```bash
   python3 <skill-dir>/scripts/create_game.py <workspace> <game-id> \
     --title "<Game Title>"
   ```

   This creates `<workspace>/flow-cabin-games/<game-id>/package/` and `dist/`.
   Use another output root only when the creator explicitly requests it.
   Replace the template visuals and rules while keeping external CSS and
   JavaScript files.
4. Use native browser input. Prevent default behavior only for keys the game
   consumes. Keep pointer coordinates relative to the game surface.
5. Register pause and resume through `window.FlowCabinGame` only when it exists.
   Stop animation, timers, and sound while paused; keep normal-browser preview
   working without the host object.
6. Preserve `manifest.json.id` when modifying an existing game and explicitly
   increment `version`.
7. Preview `package/index.html` in a browser and exercise keyboard, pointer,
   pause/resume fallback, restart, and resize behavior.
8. Before packaging, ask only the triggered expert roles to review the finished
   package, then resolve release-blocking findings.
9. Package from any working directory using absolute or resolved paths:

   ```bash
   python3 <skill-dir>/scripts/flow_cabin_package.py \
     pack <workspace>/flow-cabin-games/<game-id>/package \
     --output <workspace>/flow-cabin-games/<game-id>/dist/<game-id>-<version>.zip
   python3 <skill-dir>/scripts/flow_cabin_package.py \
     validate <workspace>/flow-cabin-games/<game-id>/package
   ```

10. Report the source directory, ZIP path, controls, and the remaining manual
   step: import the ZIP into Codoop Flow Cabin and verify its cover, gameplay,
   pause, and resume.

Do not invent `FlowCabinGameAPI`, initialization events, or an input bridge.
Do not add frameworks, package managers, build steps, remote assets, network
requests, iframes, fullscreen, Node/Electron APIs, dynamic loading, audio,
fonts, or WASM.
