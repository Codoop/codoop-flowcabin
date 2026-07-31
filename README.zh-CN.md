<div align="center">

# codoop-flowcabin

[English](./README.md) · **简体中文**

**把一句游戏创意变成可编辑源码和可直接导入 Flow Cabin 的 ZIP**

![Codex Plugin](https://img.shields.io/badge/Codex-plugin-111827)
![Claude Code Plugin](https://img.shields.io/badge/Claude%20Code-plugin-8A63D2)
![Python](https://img.shields.io/badge/python-3.9%2B-blue)
![Zero dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

**codoop-flowcabin** 是一个开源 Coding Agent 插件，用自然语言创建小型、
离线、可编辑的 Flow Cabin 游戏。

Agent 负责游戏设计、视觉方向、实现、浏览器试玩和迭代；确定性 Python
脚本负责不能出错的机械工作：项目落盘、包校验、SHA-256 清单和 ZIP 生成。

```text
你描述一个游戏
      │
      ▼
游戏设计 + 技术美术 Sub-Agent
      │
      ▼
可编辑 HTML / CSS / JavaScript
      │
      ▼
浏览器预览 → 校验 → 打包
      │
      ▼
flow-cabin-games/<game-id>/dist/<game-id>-<version>.zip
```

插件安装目录始终只读；生成的游戏只写入用户的编码工作区。

---

## 安装

### Codex Desktop 或 CLI

```bash
codex plugin marketplace add Codoop/codoop-flowcabin
codex plugin add codoop-flowcabin@codoop-flowcabin
```

重启或重新打开 Codex，然后说：

```text
使用 $codoop-flowcabin:game，帮我做一个单键操作的 Flow Cabin 提灯小游戏。
```

#### 使用 Codex 从 alpha.4 升级

alpha.5 将插件标识从 `codoop-flow-cabin` 改为与仓库名一致。
安装新版前先移除旧标识：

```bash
codex plugin remove codoop-flow-cabin@codoop-flow-cabin
codex plugin marketplace remove codoop-flow-cabin
codex plugin marketplace add Codoop/codoop-flowcabin
codex plugin add codoop-flowcabin@codoop-flowcabin
```

### Claude Code

```text
/plugin marketplace add Codoop/codoop-flowcabin
/plugin install codoop-flowcabin@codoop-flowcabin
```

然后调用：

```text
/codoop-flowcabin:game 帮我做一个键盘操作的小型太空游戏。
```

#### 使用 Claude Code 从 alpha.4 升级

```text
/plugin uninstall codoop-flow-cabin@codoop-flow-cabin
/plugin marketplace remove codoop-flow-cabin
/plugin marketplace add Codoop/codoop-flowcabin
/plugin install codoop-flowcabin@codoop-flowcabin
```

> 没有 SSH Key 时，使用完整 HTTPS 地址添加 marketplace：
> `https://github.com/Codoop/codoop-flowcabin.git`
>
> 本地开发：`claude --plugin-dir /path/to/codoop-flowcabin`

**环境要求：** Python 3.9 或更高版本。游戏运行与打包工具均无第三方依赖。

---

## 快速开始

用一句话描述玩法、操作和氛围：

```text
使用 $codoop-flowcabin:game，做一个桌面小游戏：左右驾驶月球车，收集蓝色水晶，躲避橙色岩石。
```

Skill 会：

1. 只有在缺少关键玩法选择时才补问一个问题。
2. 支持 Sub-Agent 时，并行调用游戏设计和技术美术；关卡与叙事角色按需加入。
3. 在当前编码工作区创建标准游戏项目。
4. 实现可编辑的原生 HTML、CSS 和 JavaScript。
5. 预览键盘、指针、暂停、恢复、重开和窗口缩放行为。
6. 校验离线限制、路径、哈希、文件数和体积。
7. 生成可直接导入的 ZIP。

最后保留一个人工步骤：把 ZIP 导入 Flow Cabin，确认封面、操作、暂停和恢复。

---

## 生成项目

每个新游戏都使用同一目录：

```text
<workspace>/
└── flow-cabin-games/
    └── <game-id>/
        ├── package/
        │   ├── manifest.json
        │   ├── index.html
        │   ├── game.js
        │   ├── styles.css
        │   ├── cover.svg
        │   └── assets/
        └── dist/
            └── <game-id>-<version>.zip
```

- `package/` 是可编辑运行时源码，也是唯一进入 ZIP 的内容。
- `dist/` 只存生成的发布文件。
- 更新既有游戏时保留 `manifest.json.id`，并显式提升版本。
- 只有用户明确要求时才改用其他输出根目录。
- 初始化器拒绝覆盖已有游戏，也拒绝向 Skill 安装目录写入。

完整契约见
[`project-layout.md`](./skills/game/references/project-layout.md)。

---

## 工作原理

### 1. Skill 编排

[`skills/game/SKILL.md`](./skills/game/SKILL.md) 定义创建、试玩、评审、校验与交付流程。

### 2. 专家 Sub-Agent

只读评审角色放在 [`skills/_shared/`](./skills/_shared/)：

- `game-designer`：目标、核心循环、操作、反馈和重开行为。
- `technical-artist`：原创视觉方向、层级、HUD 和封面。
- `level-designer`：地图、波次、关卡、谜题和难度曲线。
- `narrative-designer`：设定、对白、任务和选择。

主 Agent 独占所有文件修改。专家只返回有限数量的决策、风险和验收点，
因此并行评审不会互相覆盖游戏文件。

### 3. 确定性脚本

- [`create_game.py`](./skills/game/scripts/create_game.py) 在用户工作区创建标准项目。
- [`flow_cabin_package.py`](./skills/game/scripts/flow_cabin_package.py)
  仅用 Python 标准库校验并打包运行时。

### 4. 契约与模板

Skill 自带可玩的原生模板，以及项目目录、包安全、运行时生命周期和专家编排契约。

---

## 包安全保证

| 保证 | 行为 |
|---|---|
| 完全离线 | 拒绝远程 URL、网络 API、iframe、动态 import 和 Node/Electron API |
| 安全路径 | 拒绝路径穿越、隐藏包路径、符号链接和缺失的本地资源 |
| 精确清单 | 为 `manifest.json` 以外的每个运行文件生成并核对 SHA-256 |
| 体积限制 | 最多 1,000 个文件、解压后 100 MiB、ZIP 25 MiB |
| 原生运行时 | 仅使用本地 HTML、CSS、JavaScript、SVG、PNG、WebP 和 JSON |
| 浏览器降级 | 没有 `window.FlowCabinGame` 也可运行；存在时订阅暂停/恢复 |

只有 `package/` 会进入压缩包；ZIP 根目录直接包含 `manifest.json` 和
`index.html`。

---

## 手动 CLI

Coding Agent 会自动调用这些脚本。本地开发时可以手动运行：

```bash
python3 skills/game/scripts/create_game.py /path/to/workspace my-game \
  --title "My Game"

python3 skills/game/scripts/flow_cabin_package.py pack \
  /path/to/workspace/flow-cabin-games/my-game/package \
  --output /path/to/workspace/flow-cabin-games/my-game/dist/my-game-1.0.0.zip

python3 skills/game/scripts/flow_cabin_package.py validate \
  /path/to/workspace/flow-cabin-games/my-game/package
```

---

## 仓库结构

```text
codoop-flowcabin/
├── .agents/plugins/marketplace.json
├── .claude-plugin/
│   ├── marketplace.json
│   └── plugin.json
├── .codex-plugin/plugin.json
├── skills/
│   ├── _shared/                 # 专家评审角色
│   └── game/
│       ├── SKILL.md             # Agent 编排流程
│       ├── agents/openai.yaml
│       ├── references/          # 输出、运行时、包和评审契约
│       ├── scripts/             # 确定性初始化器和打包器
│       └── templates/           # 可编辑原生模板
├── tests/
├── docs/install.md
├── CHANGELOG.md
├── README.md
└── README.zh-CN.md
```

无后缀文档为英文；中文文档使用 `.zh-CN` 后缀。

---

## 运行测试

```bash
python3 -m unittest discover -s tests -v
```

测试不依赖 AI 或网络，覆盖项目初始化、标准输出目录、ZIP 结构、哈希、
离线限制、路径穿越、符号链接、错误入口、缺失资源和包体积限制。

---

## 兼容的 Coding Agent

| Agent | 状态 | 安装方式 |
|---|---|---|
| Codex Desktop | 一等支持 | Codex 插件市场 |
| Codex CLI | 一等支持 | Codex 插件市场 |
| Claude Code | 一等支持 | Claude 插件市场 |
| Cursor / Gemini | 通用支持 | 复制 Skill，让 Agent 读取 `SKILL.md` |

宿主没有 Sub-Agent 工具时，主 Agent 会在同一会话中串行应用相同专家角色。

---

## 常见问题

**生成的游戏放在哪里？**
默认位于 `<workspace>/flow-cabin-games/<game-id>/`，绝不写入已安装插件。

**能指定其他输出目录吗？**
可以，明确告诉 Agent 即可；否则使用标准工作区目录。

**可以更新已有游戏吗？**
可以。Skill 在原项目中修改，保留游戏 ID、提升版本，并替换该项目 `dist/`
中的 ZIP。

**是否使用 React、Phaser、Vite 或 npm？**
不使用。游戏采用可编辑的原生 HTML、CSS 和 JavaScript。

**自动校验通过就代表已经在 Flow Cabin 中测试了吗？**
不是。浏览器与包校验会自动完成；真实 Flow Cabin 导入仍是用户的最终验收。

**为什么源码和 ZIP 分开？**
源码持续可编辑；`dist/` 可以安全删除并随时重新生成。

---

## 深入了解

- [`docs/install.md`](./docs/install.md) —— 本地安装和生成项目行为。
- [`CHANGELOG.md`](./CHANGELOG.md) —— 版本变更记录。
- [`skills/game/references/project-layout.md`](./skills/game/references/project-layout.md) —— 产物目录契约。
- [`skills/game/references/package-v1.md`](./skills/game/references/package-v1.md) —— 包与清单契约。
- [`skills/game/references/runtime-api.md`](./skills/game/references/runtime-api.md) —— Flow Cabin 生命周期接入。

---

<div align="center">
MIT License
</div>
