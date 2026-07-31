# Install

## Codex

```bash
codex plugin marketplace add Codoop/codoop-flowcabin
codex plugin add codoop-flowcabin@codoop-flowcabin
```

Restart Codex, invoke `$codoop-flowcabin:game`, and describe the game you want.

### Upgrade from alpha.4 with Codex

Alpha.5 renamed the plugin identity. Remove the old identity before installing
the new one:

```bash
codex plugin remove codoop-flow-cabin@codoop-flow-cabin
codex plugin marketplace remove codoop-flow-cabin
codex plugin marketplace add Codoop/codoop-flowcabin
codex plugin add codoop-flowcabin@codoop-flowcabin
```

## Claude Code

```text
/plugin marketplace add Codoop/codoop-flowcabin
/plugin install codoop-flowcabin@codoop-flowcabin
```

For local development, validate and load the checkout for one session:

```bash
claude plugin validate .
claude --plugin-dir .
```

Then invoke `/codoop-flowcabin:game`.

### Upgrade from alpha.4 with Claude Code

```text
/plugin uninstall codoop-flow-cabin@codoop-flow-cabin
/plugin marketplace remove codoop-flow-cabin
/plugin marketplace add Codoop/codoop-flowcabin
/plugin install codoop-flowcabin@codoop-flowcabin
```

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
