# Expert Orchestration

Keep one main agent responsible for files, packaging, and user communication.
Use sub-agents as bounded reviewers; do not let multiple agents edit the same
game.

## Before implementation

When sub-agents are available, run these two reviews in parallel:

- `../../_shared/game-designer.md`
- `../../_shared/technical-artist.md`

Add `../../_shared/level-designer.md` for maps, waves, stages, routes, puzzles,
or difficulty progression. Add `../../_shared/narrative-designer.md` for
characters, dialogue, missions, story, or choices.

Give each reviewer the same user brief, Flow Cabin constraints, and current
game files if they exist. Ask each to return only:

1. Up to five decisions.
2. Up to three player-facing risks.
3. Up to three acceptance checks.

The main agent resolves conflicts, chooses the smallest coherent game, and
implements it. If sub-agents are unavailable, apply the same role files
sequentially.

## Before packaging

Ask only the roles used during design to review the finished package. Fix
contract violations and clear gameplay or visual failures before packaging.
Treat optional feature suggestions as future work, not release blockers.
