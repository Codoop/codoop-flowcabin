# Install

## Codex

```bash
codex plugin marketplace add Codoop/codoop-flowcabin
codex plugin add codoop-flow-cabin@codoop-flow-cabin
```

Restart Codex, invoke `$game`, and describe the game you want.

## Claude Code

```text
/plugin marketplace add Codoop/codoop-flowcabin
/plugin install codoop-flow-cabin@codoop-flow-cabin
```

For local development, validate and load the checkout for one session:

```bash
claude plugin validate .
claude --plugin-dir .
```

Then invoke `/game`.

## Generated projects

By default, every game is created under the active coding workspace:

```text
flow-cabin-games/<game-id>/
├── package/
└── dist/
```

The installed plugin remains read-only. Ask for a different output root
explicitly when needed; existing games are updated in place without changing
their ID.

The generated ZIP still needs one manual acceptance step: import it into Codoop
Flow Cabin and verify the cover, controls, pause, and resume.
