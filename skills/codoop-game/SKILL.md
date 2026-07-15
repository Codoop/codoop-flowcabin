---
name: codoop-game
description: Create, iterate on, playtest, validate, and package a polished desktop-only H5 game plugin for Codoop from a natural-language game idea. Use when a creator wants to make or improve a Codoop/Flow Cabin desktop game, try a playable build, or deliver game.zip and a separate cover.png.
---

# Codoop Game

Turn a game idea into a playable offline H5 game. Speak in plain language;
make implementation decisions unless the creator faces a genuine gameplay choice.

## Create loop

1. Read `references/game-quality.md` and write a one-page game card in the
   game's `design-notes.md`. Create and complete `visual-direction.md` before
   implementation. If the idea references a third-party IP, first apply the
   originality gate in `references/ip-originality.md`; preserve only the
   requested high-level experience, not recognizable expression. Ask at most
   one consequential question; otherwise state the chosen default and proceed.
2. Read `references/expert-orchestration.md`, then always load
   `../_shared/game-designer.md` and `../_shared/technical-artist.md`. Load
   each conditional expert named by that reference before implementation.
3. Create an isolated **desktop-only** project with
   `scripts/create-game.mjs <workspace> <name>`. Use the Canvas starter by
   default. Build only local static resources; use the Flow Cabin API in
   `references/flow-cabin-api.md` and visual rules in
   `references/desktop-visual-design.md`.
4. Start `scripts/preview-harness.mjs <project>`, run lifecycle, resize, input,
   and offline checks, then **proactively invite a playtest**. Give the local
   URL, three short player tasks, and one focused feedback question. Log the
   result in `playtest-report.md`. Do not begin another feature until the
   creator responds or explicitly asks to keep going without a playtest.
5. For each feedback round, write the changed hypothesis to `design-notes.md`,
   reload only the affected experts, implement one player-visible change, and
   preview again. Invite another playtest after a change to controls, pacing,
   difficulty, visual hierarchy, feedback, or the core loop; do not wait for
   the creator to request it.
6. Before final packaging, invite a short acceptance playtest that checks the
   first-minute experience, pause/resume, and return-from-save behavior. Record
   the result in `playtest-report.md`.
7. On approval, get `cover.png` from the creator first. If they ask you to
   generate it or cannot provide it, use image generation with the technical
   artist's art direction and the originality gate; save it separately as
   `dist/cover.png`.
8. Re-read all triggered expert files for final approval. Run `validate-game`,
   `validate-cover`, then `package-game`; write results to
   `dist/validation-report.md`. Do not package if any gate fails.

## Non-negotiable boundaries

- `game.zip` contains only game runtime files; never include `cover.png`.
- Do not use network resources, service workers, Node/Electron APIs, inline
  script/style, `eval`, or dynamic imports. See `references/package-contract.md`.
- Register host callbacks once. Pause, resume, destroy, resize, and local-save
  behavior must follow `references/flow-cabin-api.md`.
- Design for desktop mouse, keyboard, and a PC application panel. Do not spend
  time on phone layouts, touch controls, portrait breakpoints, or mobile UI.
- Do not ship generic demo styling. The first playable build needs a deliberate
  visual theme, hierarchy, typography, surfaces, state feedback, and authored
  game-world treatment as defined in `references/desktop-visual-design.md`.
- AI or user-generated assets are not automatically safe to use. Do not copy,
  trace, recreate, or prompt for a recognizable third-party character, logo,
  title treatment, signature prop/costume combination, scene, or composition.
  If a creator asks for a named IP or a near-copy, explain the constraint
  briefly and produce a distinct, genre-level alternative using
  `references/ip-originality.md`.
- Harness validation is the current compatibility claim. Do not claim real
  Codoop Desktop validation until that E2E environment is available.

## Resources

- `references/flow-cabin-api.md` — frozen host API and lifecycle.
- `references/package-contract.md` — submission and offline restrictions.
- `references/cover-contract.md` — creator-provided and generated cover rules.
- `references/ip-originality.md` — third-party IP screening and original-art direction.
- `references/desktop-visual-design.md` — desktop visual baseline and playtest prompts.
- `references/expert-orchestration.md` — expert triggers and release gates.
- `scripts/` — deterministic project creation, preview, validation, and zip packaging.
