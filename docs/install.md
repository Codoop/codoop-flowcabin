# Installing codoop-game

**English** · [简体中文](./install.zh-CN.md)

`codoop-game` contains one public Skill, `codoop-game`, plus a colocated
`_shared` directory of game-development expert definitions. Keep both together
when installing manually.

## Codex

Install from the GitHub marketplace:

```bash
codex plugin marketplace add Codoop/codoop-game
codex plugin add codoop-game@codoop-game
```

Restart or reopen Codex. Then invoke the Skill in plain language:

```text
Use $codoop-game to make a resumable offline puzzle game.
```

For local development, clone the repository and run:

```bash
bash scripts/install-skills.sh --agent codex
```

## Claude Code

```text
/plugin marketplace add Codoop/codoop-game
/plugin install codoop-game@codoop-game
```

If SSH is unavailable, use:

```text
/plugin marketplace add https://github.com/Codoop/codoop-game.git
/plugin install codoop-game@codoop-game
```

For local development, run `claude --plugin-dir /path/to/codoop-game`, or copy
the standalone Skill with:

```bash
bash scripts/install-skills.sh --agent claude
```

## Other agents

Copy both directories to the agent's skill/rules location:

```bash
cp -R skills/codoop-game <agent-skills-dir>/
cp -R skills/_shared <agent-skills-dir>/
```

Do not separate `codoop-game` from `_shared`: expert paths in the main Skill
are relative to their shared parent directory.

## Verify

```bash
codex plugin list
npm test
```

The machine needs Node.js 20+ and system `zip` / `unzip`. No runtime npm
dependencies are required.
