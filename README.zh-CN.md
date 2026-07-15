<div align="center">

# codoop-game

[English](./README.md) · **简体中文**

**从一句游戏想法，到可试玩、可提交的离线 H5 游戏**

![Codex Skill](https://img.shields.io/badge/Codex-skill-1D4ED8)
![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin-8A63D2)
![Node](https://img.shields.io/badge/Node-20%2B-339933)
![Runtime deps](https://img.shields.io/badge/runtime%20deps-zero-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

**codoop-game** 是一个桌面端 Codoop 游戏插件的单一创建循环。创作者用大白话描述游戏；Codex 或 Claude 负责游戏小卡、实现、主动试玩、质量门和打包，最终交付可供 Codoop 门户使用的 `game.zip` 与独立 `cover.png`。

当前兼容性基线是本地 preview harness。真实 Codoop Desktop webview 验证尚未接入，因此 harness 通过不会被表述为已经通过 Desktop 验证。

---

## 安装

### Codex（Desktop 或 CLI）

```bash
codex plugin marketplace add Codoop/codoop-game
codex plugin add codoop-game@codoop-game
```

重启或重新打开 Codex 后，直接说：

```text
使用 $codoop-game，做一款玩家可以随时停下、回来继续玩的种田小游戏。
```

### Claude Code

```text
/plugin marketplace add Codoop/codoop-game
/plugin install codoop-game@codoop-game
```

没有 SSH 配置时可使用完整 HTTPS 地址：

```text
/plugin marketplace add https://github.com/Codoop/codoop-game.git
/plugin install codoop-game@codoop-game
```

本地开发：

```bash
claude --plugin-dir /path/to/codoop-game
```

**前提**：Node.js 20+，以及系统自带的 `zip` / `unzip`。运行时不需要第三方 npm 依赖。

---

## 快速开始

```text
使用 $codoop-game，做一个像素风太空贸易策略游戏。玩家可以随时停下，回来继续玩；完成后给我提交包和封面。
```

创建循环会：

1. 用一页游戏小卡明确玩家目标、核心循环、操作和续玩方式。
2. 固定加载游戏设计师与技术美术；地图、剧情、音效需求分别触发对应专家。
3. 在创作者选择的工作目录创建隔离的静态 H5 项目。
4. 用本地 harness 模拟桌面端 FlowCabinGameAPI 的输入、尺寸和生命周期，并主动邀请创作者试玩。
5. 每轮只处理一项玩家可感知的反馈，并再次邀请针对性试玩。
6. 优先请求创作者提供封面；只有明确要求时才生成原创 `cover.png`。
7. 校验离线资源、入口、体积、文件数和封面后再交付。

```text
dist/
├── game.zip                 # 上传到 Codoop 门户的运行包
├── cover.png                # 独立商品封面，不进入 ZIP
└── validation-report.md     # 交付时由 agent 写入的验证结果
```

每个项目还会从 `visual-direction.md`（美术方向）和 `playtest-report.md`（创作者试玩任务、反馈与下一步决定）开始。

---

## 架构

项目有三类组件：

1. **Skill 编排**：[`skills/codoop-game/SKILL.md`](./skills/codoop-game/SKILL.md) 定义对话、专家门禁、预览和交付顺序。
2. **确定性脚本**：创建 starter、运行 harness、扫描离线限制、校验封面和生成 ZIP，不依赖 agent 的主观判断。
3. **专家与契约**：[`skills/_shared/`](./skills/_shared/) 存放设计角色；`references/` 固化桌面 API、提交包、封面、视觉与质量规则。

完整的职责、数据流和质量门见[中文 Skill 架构说明](./docs/skill-architecture.zh-CN.md)。
独立安装和其他 agent 的说明见[安装文档](./docs/install.zh-CN.md)。

### 项目结构

```text
codoop-game/
├── .codex-plugin/             # Codex 插件清单
├── .claude-plugin/            # Claude Code 插件和 marketplace 清单
├── skills/
│   ├── codoop-game/           # 主 Skill、脚本、契约与 starter
│   └── _shared/               # 按需加载的游戏专家定义
├── tests/                     # 单元与集成测试
└── docs/                      # 公开兼容性与架构文档
```

---

## 本地开发

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

`--generate-cover` 仅用于开发，或创作者明确要求生成封面时。正常流程应优先让创作者提供封面。

## 贡献

修改兼容性契约时，先更新 `docs/compatibility.md` 与对应 `references/`，再同步修改 starter、harness、校验脚本和测试。每项行为改变都必须有测试，且 `game.zip` 绝不能包含 `cover.png`。

## License

[MIT](./LICENSE)
