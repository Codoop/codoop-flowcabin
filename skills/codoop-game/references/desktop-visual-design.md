# Desktop Visual Design and Playtests

Design for a PC application game panel. Assume mouse and keyboard; do not add
phone navigation, touch targets, portrait-only layouts, or mobile breakpoints.

Before the first playable build, the technical artist records:

- a one-sentence visual premise and 3–5 palette roles;
- display, HUD, body, and metadata type hierarchy;
- surface treatment (depth, borders, texture, light, or atmosphere);
- a readable primary action, state feedback, and a theme-specific motif.

Avoid a “demo” look: generic centered cards, default controls, placeholder text,
unrelated gradients, flat full-screen color, and unstyled debug information are
not final visuals. Start with a coherent art direction, then make every panel,
control, and feedback state belong to it.

## Required creator playtests

Invite the creator without waiting to be asked:

After the first runnable build, include the current preview URL in every
creator-facing reply, even when the reply only reports progress or asks for a
decision. Restart the preview harness when necessary and replace any stale URL.

1. **First playable** — give the preview URL and ask them to complete three
   concrete tasks: understand the goal, perform the primary action, and pause
   then resume. Ask: “What felt unclear, slow, or surprisingly satisfying?”
2. **Material experience change** — repeat a focused playtest after changing
   controls, pacing, difficulty, core feedback, or visual hierarchy. Ask one
   question about the changed experience.
3. **Acceptance** — before packaging, ask the creator to play the first minute,
   pause/resume, and reopen the game to confirm saved progress.

Log date, build, tasks, outcome, and the creator's words in `playtest-report.md`.
Keep the current visual premise, palette roles, typography, surfaces, motifs,
and acceptance check in `visual-direction.md`.

## Originality record

When the creator mentions a third-party franchise, character, or artist, add a
short originality record to `visual-direction.md`: the desired high-level
experience, the protected identifiers excluded, and at least three independent
original choices (for example world premise, silhouette, palette/materials,
motifs, UI language, or narrative role). Follow `ip-originality.md`; do this
before producing any image prompt or visual asset.
