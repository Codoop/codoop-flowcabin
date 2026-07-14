# 计划：Codoop Game（独立开源 Skill）

> **状态**：设计中，未开始实现  
> **目标仓库**：`Codoop/codoop-game`  
> **核心 Skill**：`codoop-game`  
> **辅助 Skill**：`codoop-listing`  
> **首版定位**：`codoop-game` 让 coding agent 生成、验证并打包可提交到 Codoop 的离线 H5 游戏；`codoop-listing` 为准备上架的游戏生成商品资料。创作者在 Codoop 门户中掌控发布，游戏可自由选择类型、策略和游玩节奏。

---

## 1. 已锁定的产品决策

| 决策 | 首版选择 |
|---|---|
| 分发方式 | 独立开源仓库，可直接安装到创作者的工作环境 |
| Agent 支持 | 首版为 Codex 与 Claude 提供完整插件安装和验证体验 |
| 最终产物 | 校验通过的离线 H5 `game.zip` 与最终 `cover.png` |
| Skill 分工 | `codoop-game` 负责游戏本体、封面、预览、兼容性与提交包；`codoop-listing` 负责生成门户上架所需的商品资料 |
| 发布权限 | 创作者携带游戏包、封面和商品资料进入 Codoop 门户，在那里确认最终上架设置与发布 |
| 玩法范围 | 支持街机、益智、策略、模拟等多种类型，玩家自由决定单局时长与游戏节奏 |
| 体验底线 | 游戏由玩家决定策略与节奏，但必须可暂停、恢复、销毁和续玩 |
| 创作者门槛 | 面向不懂开发的创作者；agent 用大白话共同设计和交付游戏，自动承担技术选择与工程工作 |

首版以“随时停下，回来继续”为质量体验。Flow Cabin 面对的是不确定时长的 AI 任务，skill 会让游戏安全中断与恢复，并把策略和结束时机交给玩家。

## 2. 用户与使用场景

**主要创作者**：有游戏想法、没有编程经验的用户。他们可以从“我想做一个种田小游戏”直接开始创作。

**次要创作者**：有现成 H5 游戏或代码的开发者，使用 `adapt`、`validate` 和 `package` 模式。

### 2.1 面向小白的对话原则

- 从游戏体验开始：问“玩家在做什么、怎么赢、画面什么感觉”，由 agent 负责框架、事件模型和构建工具。
- 每轮最多询问一个会实质改变游戏的选择；有合理默认值时直接说明采用的默认值并继续。
- 用玩家能理解的话解释进度，例如“我正在让游戏记住你的进度”。
- 报错先说影响和下一步，例如“这个图片来自外网，离线发布后会看不到；我会换成本地文件”，技术细节放在可展开的诊断报告。
- 交付时给可点击的预览和一句话操作说明，用户可以直接试玩和提交。
- agent 在后台完成工程决策、测试与打包，并主动说明已经完成和验证的内容。

**触发示例**：

- “做一款可在 Flow Cabin 里玩的回合制地牢策略游戏。”
- “把这个现有的 HTML5 棋牌游戏迁移到 Flow Cabin。”
- “检查我的游戏能否打包提交到 Codoop。”
- “为这个游戏产出提交 zip 和封面。”
- “为已经做好的游戏写一套上架页信息。”

## 3. 平台事实与兼容性契约

Skill 以当前 Codoop 实现为唯一契约来源，并把这些规则转化为创作者无需理解的自动化流程。

### 3.1 运行时

- 游戏运行在独立、安全的 `<webview>` 环境中，并使用受控的固定面板区域。
- 唯一宿主桥是 `window.FlowCabinGameAPI`：键盘/鼠标订阅、暂停/恢复/销毁生命周期、`ready()`、`reportScore()`、`reportProgress()` 与 `getCanvasSize()`。
- 核心操作优先使用 A–Z、0–9、方向键和空格，确保在 Flow Cabin 中稳定响应。
- 游戏必须根据 `getCanvasSize()` 和 `resize` 自适应布局，并在 `onPause`、`onResume`、`onDestroy` 时保存/停止/清理状态。

权威代码来源：`desktop/src/core/flow-cabin-input.ts`、`desktop/main/features/flow-cabin/game-preload.ts`。

### 3.2 提交包

- 提交的是纯静态 H5 zip，必须含 `index.html`。
- 上传限制：zip ≤20MB、最多 500 文件、解压后 ≤40MB。
- 提交包使用 `.html`、`.css`、`.js`、`.wasm`、图片、`.json`、`.mp3`、`.ogg` 等离线静态资源。
- 所有资源随包提供，确保游戏在没有网络连接时也能完整运行。
- Codoop 后端会基于上传文件生成 hash 和 Ed25519 签名的运行时 `manifest.json`；skill 为创作者自动准备符合该流程的游戏包。

#### 完整游戏交付物

一个可提交的 Codoop 游戏由“运行包”“商品资料”和“平台完整性资料”三层组成：

| 层 | 文件 | 当前要求 | 说明 |
|---|---|---|---|
| 运行包 | `game.zip` | 必需 | 创作者上传到开发者门户的离线 H5 压缩包 |
| 运行包 | `index.html` | 必需 | 游戏入口；`codoop-game` 统一在 zip 根目录生成它，便于桌面端直接加载 |
| 运行包 | `app.js` 或其他 `.js` | 按实现需要 | 游戏逻辑；所有引用的脚本都随包提供 |
| 运行包 | `styles.css` | 按实现需要 | 游戏界面样式；也可使用其他本地 CSS 文件 |
| 运行包 | `assets/` | 按实现需要 | 本地图片、SVG、WebP、JSON、WASM、MP3、OGG 等游戏资源 |
| 商品资料 | `cover.png` | 必备交付物 | 游戏列表和上架资料使用的横版封面；可由用户提供，也可由 coding agent 创作；skill 统一校验并整理为推荐的 PNG、16:9、至少 640×360 |
| 平台完整性资料 | `manifest.json` | Codoop 后端生成 | 包含版本、文件 SHA-256 和 CSP；创作者无需生成或签名 |

`codoop-game` 的推荐输出形态：

```text
dist/
├── game.zip                 # 上传到 Codoop 的文件
├── cover.png                # 用户提供或 coding agent 创作的商品封面
└── validation-report.md     # 本地验证结果，供 agent 自检
```

其中 `game.zip` 的内容保持简单：

```text
game.zip
├── index.html               # 必需
├── app.js                   # 推荐：游戏主逻辑
├── styles.css               # 推荐：界面样式
└── assets/                  # 可选：游戏图片、音效、数据和 WASM
    ├── sprites.png
    ├── click.ogg
    └── data.json
```

#### 封面在当前 Codoop 中的两种使用方式

| 场景 | 封面位置 | 当前行为 |
|---|---|---|
| 官方随包游戏 | `bundle/assets/cover.png` | 必需。`BUNDLED_GAMES` 静态索引会读取它，且 `manifest.json` 必须包含它的 SHA-256；缺少时官方首页不会展示该游戏卡片。 |
| 市场游戏 | 商品的 `cover_image_url` | 市场卡片优先展示该 URL；当前字段可为空，空值时展示游戏标题前两个字符。当前上传接口尚未把 zip 内封面自动写入该字段。 |

因此，`codoop-game` 始终交付最终的 `cover.png`：创作者可以直接提供喜欢的图片，也可以让 coding agent 根据游戏主题创作封面。Skill 会校验尺寸、比例和离线文件格式；这张封面既满足官方随包游戏的资源规范，也可在门户接入时写入商品 `cover_image_url`，让市场卡片展示同一张图。

权威代码来源：`backend/src/services/zip-validator.ts`、`backend/src/services/upload-pipeline.ts`、`backend/src/services/manifest-signer.ts`。

### 3.3 Flow Cabin 体验状态

Flow Cabin 是 Codoop 在 AI CLI 任务运行期间提供的互动区域。游戏应把宿主状态视为游戏体验的一部分：

| Codoop 聚合状态 | Flow Cabin 表现 | 游戏预期 |
|---|---|---|
| `UNLOCKED` | 面板打开、键盘可用、游戏运行 | 接收输入并正常运行 |
| `FROZEN` | 面板保持可见、画面去饱和、键盘暂停 | 保存当前状态，安静等待用户处理 AI 审批 |
| `PAUSED` | 面板收起、游戏暂停 | 安全停止循环并保留进度 |
| `LOCKED` | 面板收起 | 保持可恢复状态，等待新的 AI 会话 |

状态只由 AI Watcher 的**聚合状态**驱动；多会话场景中，只要任一会话仍在运行，Flow Cabin 保持 `UNLOCKED`。这一规则确保游戏不会因另一会话完成而提前暂停。

### 3.4 FlowCabinGameAPI（冻结契约）

游戏在 webview 中可使用下面的全局对象。`codoop-game` 应把这份 API 作为源码模板、preview harness 和静态检查的共同依据。

```ts
type KeyboardEventPayload = {
  type: 'keydown' | 'keyup';
  key: string;
  code: string;
  timestamp: number;
  repeat: boolean;
};

type MouseEventPayload = {
  type: 'click' | 'move' | 'wheel';
  button?: 'left' | 'right' | 'middle';
  x: number;
  y: number;
  deltaX?: number;
  deltaY?: number;
  timestamp: number;
};

interface FlowCabinGameAPI {
  onKeyDown(cb: (event: KeyboardEventPayload) => void): void;
  onKeyUp(cb: (event: KeyboardEventPayload) => void): void;
  onMouseClick(cb: (event: MouseEventPayload) => void): void;
  onMouseMove(cb: (event: MouseEventPayload) => void): void;
  onMouseWheel(cb: (event: MouseEventPayload) => void): void;
  onPause(cb: () => void): void;
  onResume(cb: () => void): void;
  onDestroy(cb: () => void): void;
  ready(): void;
  reportScore(score: number): void;
  reportProgress(data: unknown): void;
  getCanvasSize(): { width: number; height: number };
}
```

键盘以 A–Z、0–9（包含数字小键盘）、方向键与空格为核心；鼠标坐标相对于游戏区域。`getCanvasSize()` 返回当前 webview 尺寸，游戏监听 `resize` 后再次读取即可完成自适应。

### 3.5 Codoop 分发流程

`codoop-game` 的提交包对应当前开发者门户和市场服务：

```text
创作者在门户创建游戏草稿
  → codoop-game 生成并校验 game.zip
  → 创作者上传 game.zip
  → Codoop 校验、病毒扫描、计算 SHA-256、签名 manifest
  → 市场目录展示游戏
  → 桌面端下载、验签、解压
  → Flow Cabin 启动游戏
```

当前门户接口与字段：

| 步骤 | 接口 / 规则 |
|---|---|
| 创建草稿 | `POST /v1/developer/games`；`title` ≤60 字符、`description` ≤500 字符、`price_cents` 为 `0`、`99`、`299` 或 `499` |
| 上传提交包 | `POST /v1/developer/games/{game_id}/upload`，`multipart/form-data` 的 `file` 字段 |
| 上传后处理 | 后端完成安全校验、生成 `manifest.json`、Ed25519 签名并发布版本 |
| 玩家安装 | 认证市场目录 `GET /v1/marketplace/games`；符合安装资格的用户获取签名 bundle |

标题、简介、定价、封面关联和其他商品资料属于门户的上架步骤。`codoop-game` 聚焦游戏本体与最终封面；创作者准备上架时，可使用 `codoop-listing` 根据已完成的游戏生成这些资料，再在门户中自行确认和填写。

桌面端已经具备市场目录、下载、Ed25519 验签、hash 校验和解压能力。当前 Flow Cabin 首页的官方游戏目录仍由 `BUNDLED_GAMES` 静态索引驱动，因此“市场已安装游戏出现在 Flow Cabin 并启动”应作为 Codoop 集成验收项完成。

### 3.6 Codoop 安全与启动准备

- 游戏 webview 使用 `nodeintegration=false`、`contextIsolation=yes`、`sandbox=yes` 和每游戏独立的 `persist:game-<id>` 分区。
- 后端生成的 manifest 包含 `{ game_id, version, file_hashes, csp_policy }`；桌面端在安装时验证 Ed25519 签名和每个文件的 SHA-256。
- Codoop 为每次加载创建 CSP nonce，并通过分区 session 注入 CSP 响应头；平台集成应以端到端测试确认本地脚本、样式和资源在市场包中稳定加载。
- `codoop-game` 的 `validate-game.mjs` 复刻可静态验证的上传规则；Codoop 后端持续作为最终安全验证层。

### 3.7 源码依据索引

新仓库维护者可从以下 Codoop 路径同步契约变更：

| 主题 | Codoop 源码 |
|---|---|
| 输入类型与 `FlowCabinGameAPI` | `desktop/src/core/flow-cabin-input.ts` |
| webview 沙箱桥 | `desktop/main/features/flow-cabin/game-preload.ts` |
| Flow Cabin 聚合状态映射 | `desktop/src/core/flow-cabin-state.ts` |
| webview 安全属性 | `desktop/src/features/flow-cabin/components/WebViewPanel.tsx` |
| CSP 注入 | `desktop/main/features/flow-cabin/csp-injector.ts` |
| 官方游戏加载与完整性校验 | `desktop/main/features/flow-cabin/{controller,game-loader,manifest}.ts` |
| 市场安装、签名和 hash 验证 | `desktop/main/features/marketplace/marketplace-installer.ts` |
| 服务端 zip 校验与签名 | `backend/src/services/{zip-validator,upload-pipeline,manifest-signer}.ts` |
| 开发者上传与市场接口 | `backend/src/routes/{developer,marketplace}.ts` |

## 4. 首版功能设计

### 4.1 四种工作模式

| 模式 | 输入 | 输出 |
|---|---|---|
| `create` | 玩法想法、输入偏好、视觉方向 | 新游戏源码、可运行本地预览 |
| `adapt` | 既有 H5 游戏 | 迁移后的 Flow Cabin 兼容源码 |
| `validate` | 游戏目录 | 机器可读报告与可操作的修复项 |
| `package` | 已通过校验的游戏 | `dist/game.zip`、`dist/cover.png` 与验证报告 |

### 4.2 上架资料 Skill

`codoop-listing` 只服务于已完成的游戏，不修改游戏源码、不重打包，也不替创作者发布。它以游戏玩法、`cover.png` 和创作者的表达偏好为输入，用大白话协助产出可带入 Codoop 门户的资料：

- 游戏标题、短简介与完整介绍；
- 玩家能获得什么乐趣、适合谁、如何操作；
- 分类、标签与卖点建议；
- 供创作者确认的定价建议和上架检查清单。

输出同时提供便于阅读的 `listing.md` 与结构化 `listing.json`。创作者可以随时调整内容，并在门户中决定最终标题、价格、封面关联和发布动作。

### 4.3 内部专家视角

用户始终与一个友好的 `codoop-game` 助手对话。Skill 在内部按游戏需要采用以下专家视角，让创作质量提升而不增加小白用户的学习成本：

| 视角 | 贡献 | 使用条件 |
|---|---|---|
| 游戏设计师 | 游戏小卡、玩家目标、核心循环、反馈、胜负、进度与新手引导 | 每个游戏默认采用 |
| 技术美术 | 小面板可读性、视觉层级、动画与资源预算 | 有明确视觉风格、特效或复杂动画时 |
| 关卡设计师 | 地图、房间、路线、难度推进与空间引导 | 探索、战斗、迷宫或经营地图类游戏 |
| 叙事设计师 | 角色语气、选择后果与故事节奏 | 有剧情、对话或分支选择时 |
| 音频设计师 | 操作反馈、胜负提示与氛围音效 | 创作者希望加入本地音效时 |

这些视角借鉴 [agency-agents 的游戏开发角色](https://github.com/msitarzewski/agency-agents/tree/main/game-development) 的工作方法，并针对 Codoop 的离线 H5 与 Flow Cabin 面板环境重新整理为简洁检查清单。

### 4.4 创建工作流

1. 用大白话把想法收敛成一页“游戏小卡”：玩家做什么、如何获得反馈、怎样继续或重新开始、控制方式和画面感觉。用户只需确认这张卡。
2. agent 提出一个可玩的默认版本并直接开始实现；只有玩法方向存在真正分歧时才请求选择。
3. 生成可维护的本地静态游戏；默认使用零依赖 Canvas/DOM，也支持将其他技术栈构建为离线产物。
4. 接入 `FlowCabinGameAPI`；浏览器预览环境提供开发用 mock，发布包保留纯游戏资源。
5. 实现暂停、恢复、销毁、resize 与必要的本地存档；对用户表述为“随时停下，回来还能继续”。
6. agent 自行运行玩法冒烟测试、静态安全校验与打包校验；遇到需要创作者决定的事项时，用大白话提供清晰选择。
7. 输出预览地址、`game.zip` 与 `cover.png`，提示用户“下一步带着这两个文件到门户上架”。

### 4.5 质量门槛

- 有可理解的目标、反馈和重试或持续进度机制。
- 支持玩家自由选择策略深度、游戏类型和单局长度。
- 暂停时保存一致的游戏状态；恢复后自然继续；销毁时完整清理 listener 与 animation frame。
- 在狭窄 Flow Cabin 面板与 resize 后仍可看清并操作。
- 使用完整离线资源与精简构建产物，保障稳定加载。
- 生成文件、文件数和体积均在服务端限制内。
- 小白用户通过自然语言即可得到可预览、可提交的产物。

## 5. 开源仓库结构

```text
codoop-game/
├── .agents/plugins/marketplace.json
├── .claude-plugin/
├── .codex-plugin/plugin.json
├── skills/
│   ├── codoop-game/
│   │   ├── SKILL.md
│   │   ├── agents/openai.yaml
│   │   ├── references/
│   │   ├── assets/vanilla-canvas-starter/
│   │   └── scripts/
│   │       ├── validate-game.mjs
│   │       ├── preview-harness.mjs
│   │       └── package-game.mjs
│   └── codoop-listing/
│       ├── SKILL.md
│       ├── agents/openai.yaml
│       └── references/portal-listing-fields.md
├── examples/resumable-game/
└── tests/
```

- 仓库采用 `codoop-flow` 的插件布局：Codex 使用 `.codex-plugin/plugin.json`，Claude 使用 `.claude-plugin/`；两个入口都暴露同一套 `codoop-game` 与 `codoop-listing` skill 内容，避免规则分叉。
- `SKILL.md` 保持简短，只描述何时触发、四种模式、必经校验和何时加载参考文件。
- `SKILL.md` 规定面向小白的语言、提问和交付方式；`references/` 承载运行时与打包契约，让创作对话保持轻松清晰。
- `scripts/validate-game.mjs` 复刻服务端可静态复刻的规则；服务端仍是最终裁决。
- `scripts/preview-harness.mjs` 提供本地 API mock、输入事件、暂停/恢复和尺寸改变控制。
- `scripts/package-game.mjs` 只收集最终静态产物，生成精简、可提交的 zip。

建议以 MIT 许可发布，脚本不引入运行时 npm 依赖；仓库的公开 README 负责安装和贡献说明，skill 本体不额外携带冗余说明文档。

## 6. 首版交付路径

### 平台准备

1. 将 `FlowCabinGameAPI` 与上传校验规则提炼为公开、版本化的契约。
2. 建立市场包 CSP 与本地脚本加载的一致策略，并通过自动测试保障市场游戏的可靠启动。
3. 打通“市场已安装游戏 → Flow Cabin 启动”的桌面体验，让创作者提交的游戏获得完整分发闭环。

### 核心 Skill

1. 初始化 `codoop-game` skill、Codex 插件清单与 Claude 插件清单；两个入口共享同一份 skill 内容和确定性脚本。
2. 编写“游戏小卡”对话流程与小白语言准则；用从一句自然语言想法开始的真实 prompt 前测。
3. 提供 Canvas/DOM starter 和一个可暂停、可恢复、可 resize 的示例游戏。
4. 实现 `create`、`validate`、`package`，并为已有静态 H5 游戏提供 `adapt` 迁移支持。
5. 对 zip 规则、外链、尺寸、生命周期和 API 使用编写自动测试。
6. 实现 `codoop-listing`，根据完成的游戏与封面生成可审阅的 `listing.md`、`listing.json` 和上架检查清单。

## 7. 验收标准

首版发布前，以下必须全部满足：

- 一个从自然语言创建的游戏能在 preview harness 中接收键鼠、暂停、恢复、resize。
- `validate` 为资源、体积、入口文件和生命周期提供清晰的通过结果与修复建议。
- `package` 输出通过本地检查的精简 zip，包含发布所需的最终静态资源。
- Codoop 后端为提交包生成可信的 `manifest.json` 和签名，skill 专注于准备游戏内容与验证报告。
- 零编程经验用户仅以自然语言描述游戏想法，即可获得游戏小卡、可运行预览和提交 zip。
- 所有面向用户的提示都说明“发生了什么、会有什么影响、接下来怎么做”；诊断文件提供完整技术依据。
- 同一条创建游戏 prompt 在 Codex 与 Claude 的插件安装路径中都能触发 `codoop-game`，并生成通过相同校验的提交包。
- 同一份已完成游戏资料在 Codex 与 Claude 中都能触发 `codoop-listing`，生成可由创作者确认并带入门户的商品资料。
- 至少一个端到端示例完成 Codoop 实际上传及 Flow Cabin 启动验证。

## 8. 首版聚焦

- `codoop-game` 提供游戏创作、预览、验证、打包与 Codoop 兼容性；`codoop-listing` 提供清晰、可确认的上架资料。
- 离线、稳定、可中断恢复的单人游戏体验。
- 创作者自主定义题材、策略深度、单局时间与盈利模式。
- 基于稳定 `FlowCabinGameAPI` 的可靠游戏兼容性。
