<div align="center">

# codoop-game

**从一句游戏想法，到可试玩、可提交的离线 H5 游戏**

![Codex Skill](https://img.shields.io/badge/Codex-skill-1D4ED8)
![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin-8A63D2)
![Node](https://img.shields.io/badge/Node-20%2B-339933)
![Runtime deps](https://img.shields.io/badge/runtime%20deps-zero-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

**codoop-game** 是面向创作者的单一游戏创建循环。你用大白话描述想做的游戏；Codex 或 Claude 负责游戏小卡、实现、试玩、质量检查和打包，最后交付 Codoop 门户所需的 `game.zip` 与独立 `cover.png`。

目前的兼容性基线是本地 preview harness；真实 Codoop Desktop webview 验证尚未接入，因此项目不会把 harness 通过表述为 Desktop 验证通过。

```
你说一句游戏想法                                      你决定何时交付/发布
       │                                                        ▲
       ▼                                                        │
┌──────────────── Codex / Claude 读取 SKILL.md 并编排创建循环 ────────────────┐
│ 游戏小卡 → 专家审查 → 实现 → harness 试玩 → 反馈迭代 → 校验 → 打包       │
│             [规则]       [agent]    [script]       [agent]    [scripts]  │
│                                                                            │
│ 固定专家：游戏设计师、技术美术；地图/叙事/音频专家按需加入。              │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 安装

### Codex（Desktop 或 CLI）

从 GitHub marketplace 安装：

```bash
codex plugin marketplace add Codoop/codoop-game
codex plugin add codoop-game@codoop-game
```

然后重启或重新打开 Codex，直接开始：

```text
用 $codoop-game 做一款玩家可以随时停下、回来继续玩的种田小游戏。
```

### Claude Code

```text
/plugin marketplace add Codoop/codoop-game
/plugin install codoop-game@codoop-game
```

若没有 SSH 配置，可使用完整 HTTPS 地址：

```text
/plugin marketplace add https://github.com/Codoop/codoop-game.git
/plugin install codoop-game@codoop-game
```

本地开发可使用：

```bash
claude --plugin-dir /path/to/codoop-game
```

**前提**：Node.js 20+，以及系统自带的 `zip` / `unzip` 命令。运行时不依赖第三方 npm 包。

---

## 快速开始

告诉已安装插件的 agent 你的游戏想法即可：

```text
用 $codoop-game 做一个像素风太空贸易策略游戏。玩家可以随时停下，回来继续玩；最后给我可提交的游戏包和封面。
```

创建循环会：

1. 用一页游戏小卡确认玩家目标、核心循环、操作与续玩方式。
2. 自动加载游戏设计师与技术美术；地图、剧情、音效需求会触发对应专家。
3. 在创作者选择的目录创建隔离的静态 H5 项目。
4. 启动本地 harness，模拟 `FlowCabinGameAPI` 的输入、尺寸和生命周期。
5. 根据每轮一项体验反馈修改并再次试玩。
6. 优先请求创作者提供封面；创作者要求时才生成原创 `cover.png`。
7. 校验离线资源、入口、体积、文件数和封面，交付提交产物。

最终目录：

```text
dist/
├── game.zip                 # 上传到 Codoop 门户的运行包
├── cover.png                # 独立商品封面，不进入 ZIP
└── validation-report.md     # agent 在交付时写入的验证结果
```

---

## 架构

项目由三类内容组成：

1. **Skill 编排**：[`skills/codoop-game/SKILL.md`](./skills/codoop-game/SKILL.md) 定义对话方式、专家门禁、预览和交付顺序。
2. **确定性脚本**：创建 starter、运行 preview harness、扫描离线限制、校验封面和生成 ZIP；这些可精确复现的步骤不依赖 agent 判断。
3. **专家与契约**：[`skills/_shared/`](./skills/_shared/) 提供设计角色；`references/` 固化 API、提交包、封面与质量规则。

更完整的目录职责、数据流与质量门见 [Skill 架构说明](./docs/skill-architecture.md)。

### 项目结构

```text
codoop-game/
├── .codex-plugin/             # Codex 插件入口
├── .claude-plugin/            # Claude Code 插件入口与 marketplace
├── skills/
│   ├── codoop-game/           # 主 Skill、脚本、参考契约和 starter
│   └── _shared/               # 可按需加载的游戏专家定义
├── tests/                     # 单元与集成测试
└── docs/                      # 公开兼容性与架构说明
```

---

## 本地开发

运行全部测试：

```bash
npm test
```

手动验证完整闭环：

```bash
node skills/codoop-game/scripts/create-game.mjs /tmp my-game --generate-cover
node skills/codoop-game/scripts/preview-harness.mjs /tmp/my-game
node skills/codoop-game/scripts/validate-game.mjs /tmp/my-game
node skills/codoop-game/scripts/validate-cover.mjs /tmp/my-game/cover.png
node skills/codoop-game/scripts/package-game.mjs /tmp/my-game
```

`--generate-cover` 仅用于开发或创作者明确要求生成封面时。正常创建流程应优先由创作者提供封面。

## 贡献

修改兼容性契约时，先更新 `docs/compatibility.md` 与对应 `references/`，再同步修改 starter、harness、校验脚本和测试。每个行为改变都应有测试，并保持 `game.zip` 不含 `cover.png`。

## License

[MIT](./LICENSE)
