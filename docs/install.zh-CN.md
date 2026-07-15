# 安装 codoop-game

[English](./install.md) · **简体中文**

`codoop-game` 包含一个公开 Skill：`codoop-game`，以及与它同级的共享游戏专家目录 `_shared`。手动安装时必须保持二者同级。

## Codex

通过 GitHub marketplace 安装：

```bash
codex plugin marketplace add Codoop/codoop-game
codex plugin add codoop-game@codoop-game
```

重启或重新打开 Codex，然后直接用自然语言调用：

```text
使用 $codoop-game，做一款可暂停、可续玩的离线益智游戏。
```

本地开发时，克隆仓库后运行：

```bash
bash scripts/install-skills.sh --agent codex
```

## Claude Code

```text
/plugin marketplace add Codoop/codoop-game
/plugin install codoop-game@codoop-game
```

没有 SSH 时使用：

```text
/plugin marketplace add https://github.com/Codoop/codoop-game.git
/plugin install codoop-game@codoop-game
```

本地开发可运行 `claude --plugin-dir /path/to/codoop-game`，或执行：

```bash
bash scripts/install-skills.sh --agent claude
```

## 其他 agent

将两个目录都复制到 agent 的 skill/rules 目录：

```bash
cp -R skills/codoop-game <agent-skills-dir>/
cp -R skills/_shared <agent-skills-dir>/
```

不要拆开 `codoop-game` 和 `_shared`：主 Skill 的专家路径依赖二者位于同一父目录下。

## 验证

```bash
codex plugin list
npm test
```

机器需要 Node.js 20+ 和系统的 `zip` / `unzip`；不需要运行时 npm 依赖。
