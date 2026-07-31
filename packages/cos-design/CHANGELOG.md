# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.7.1] - 2026-07-31

### Added

- 新增 `PhotoAlbum` 真实翻页相册：CSS 3D 摊开式翻页、铁丝圈装订、飞页与自适应铁圈数量
- Playground Props 表支持自定义类型说明
- `@cos-design/photo-album`: 新增 3.7.1
- cos-design: 聚合包更新至 3.7.1

## [3.7.0] - 2026-07-30

### Added

- 文字动效新增 7 个零依赖组件：ShinyText、BlurText、CircularText、TrueFocus、FuzzyText、CurvedLoop、RotatingText
- 背景动效 Playground 支持可开关的「示例文案」叠加层（中文 Demo Content）

### Changed

- BubbleField：移除底部提示文案，避免遮挡预览与示例文案开关
- 文字动效目录更新为 18 个组件；组件总数 71
- @cos-design/shiny-text: 新增 3.7.0
- @cos-design/blur-text: 新增 3.7.0
- @cos-design/circular-text: 新增 3.7.0
- @cos-design/true-focus: 新增 3.7.0
- @cos-design/fuzzy-text: 新增 3.7.0
- @cos-design/curved-loop: 新增 3.7.0
- @cos-design/rotating-text: 新增 3.7.0
- @cos-design/bubble-field: 3.6.0 → 3.7.0
- cos-design: 聚合包更新至 3.7.0

## [3.6.0] - 2026-07-27

### Changed

- BubbleField: 拆分为多模块实现，优化深海背景、扰动形变、融合检测与整体渲染性能
- 新增背景/交互类组件拆包支持：CountUp、GameOfLife、NetworkGraph、SandFall、SplitText、SpringMass、TextMorph、BubbleField
- @cos-design/bubble-field: 3.5.5 → 3.6.0
- @cos-design/count-up: 3.5.5 → 3.6.0
- @cos-design/game-of-life: 3.5.5 → 3.6.0
- @cos-design/network-graph: 3.5.5 → 3.6.0
- @cos-design/sand-fall: 3.5.5 → 3.6.0
- @cos-design/split-text: 3.5.5 → 3.6.0
- @cos-design/spring-mass: 3.5.5 → 3.6.0
- @cos-design/text-morph: 3.5.5 → 3.6.0
- cos-design: 聚合包更新至 3.6.0

## [3.5.5] - 2026-07-24

### Changed

- `WeatherBackground`：按当地日出日落自动昼夜；`time` / `windLevel` 可调，自然风场驱动云雨雪与风条
- `WeatherBackground`：雨 / 雪合并为 `rain` / `snow`，新增 `rainLevel` / `snowLevel`（1~10）连续强度
- `WeatherBackground`：雾 / 冰雹 / 霾三档强度（`fogLevel` / `hailLevel` / `smogLevel`），实况模式自动推导
- `WeatherBackground`：Demo 支持城市选择、时刻 / 风速 / 强度滑块与 Open-Meteo 实时天气
- @cos-design/weather-background: 3.5.3 → 3.5.4
- cos-design: 聚合包更新至 3.5.5

## [3.5.4] - 2026-07-24

### Changed

- `SmokeFog`：更自然的底部升烟与点击拨散；新增 `color` / `backgroundColor` / `speed` / `disperseStrength` / `disperseRadius` / `interactive`
- `RippleWater`：交互与可访问性小幅打磨（`pointerdown`、`prefers-reduced-motion` 等）
- @cos-design/ripple-water: 3.5.3 → 3.5.4
- @cos-design/smoke-fog: 3.5.3 → 3.5.4
- cos-design: 聚合包更新至 3.5.4

## [3.5.3] - 2026-07-23

### Changed

- `RippleWater` 重写为 WebGL 高度场水面：波光粼粼、物理扩散涟漪，默认湖蓝对角渐变
- `RippleWater` 新增波浪 / 波光 / 涟漪物理 / 交互等配置参数，侧边栏排序至天气背景之后

## [3.5.2] - 2026-07-23

### Changed

- `WeatherBackground` 性能优化：天空 / 日夜 / 云 / 雾预烘焙贴图，雪花与冰雹复用贴图池，支持 `prefers-reduced-motion` 静态降级
- `SmokeFog` 支持点击 / 触摸驱散雾气

### Fixed

- `WeatherBackground` 补充 canvas 语义标签与 loading 状态可读性

## [3.5.1] - 2026-07-22

### Fixed

- 子包名改为 kebab-case（如 `@cos-design/weather-background`），符合 npm 新包命名规则（禁止大写字母）

## [3.5.0] - 2026-07-22

### Added

- 支持按组件拆包安装：`pnpm add @cos-design/<component>`（如 `@cos-design/weather-background`）
- 新增 `@cos-design/shared` 公共工具包；聚合包 `cos-design` 仍可一次安装全部组件
- pnpm monorepo 与多包构建 / 发布流水线（`pnpm sync:packages`、`pnpm build`）

## [3.4.0] - 2026-07-21

### Added

- `WeatherBackground` 接入 Open-Meteo 实况：支持 `live`、可选 `latitude` / `longitude`（未配置则用浏览器定位）
- 日夜效果：手动 `night`，实况模式按当地 `is_day` 自动切换月亮、星空与夜间色调
- 实况请求中在当前画面上叠加 loading 遮罩，切换城市时不再闪回默认天气
- 导出 `useLiveWeather`、`mapWmoCodeToWeatherType` 及坐标相关类型

### Fixed

- WMO 码 1（mainly clear）映射为 `sunny`，与官方晴 / 多云 / 阴三档对齐
- Playground 示例去掉并列多根 JSX，修复「编辑代码」语法错误

## [3.3.0] - 2026-07-21

### Added

- 新增 `WeatherBackground` 天气背景组件，支持 15 种天气：大晴天 / 多云 / 阴天 / 小中大雨 / 雷阵雨 / 雾 / 小中大雪 / 雨夹雪 / 冰雹 / 霾 / 大风
- 雪天使用程序化六重对称冰晶贴图，每片雪花形态各不相同
- Props 提取脚本自动展开字符串联合类型别名（如 `WeatherType` → `'sunny' | ...`）

### Changed

- 配置参数表将长字符串联合类型拆分为可换行标签，默认值列不再强制断词换行
- `WeatherBackground` 置于背景动效分类首位

## [3.2.0] - 2026-06-23

### Added

- 物理创意分类新增 6 个组件：`DoublePendulum`、`PlasmaBall`、`MetaballPool`、`SolarSystem`、`LorenzAttractor`、`RopeChain`

### Fixed

- `NewtonCradle` 改为 Canvas 单摆物理模拟，碰撞后动量正确传递至对端小球

### Changed

- Playground 顶栏搜索图标放大，统计徽章文字居中

## [3.1.0] - 2026-06-23

### Added

- Playground **快速开始** 页面（`#/quickstart`）与仓库根目录 `QUICKSTART.md`
- 组件页 **实时编辑代码**（`react-live`），修改后预览立即更新
- 各组件 **配置参数** 表格，由 `pnpm extract-props` 从源码自动生成
- 顶栏 **GitHub** 图标外链仓库

### Changed

- 组件页「编辑代码」打开时自动滚动至编辑器
- 配置参数展示在页面底部（预览 / 编辑区下方）
- README 增加快速开始入口与使用注意摘要

## [3.0.4] - 2026-06-23

### Fixed

- `Charge` 恢复 gooey 充电动效，移除错误的 `clip-path` 裁剪
- 气泡上升至圆环融合点后淡出消失，不再继续上飘或被硬切边截断

### Changed

- `Charge` 演示页移除浮层控件，仅保留纯充电动画

## [3.0.3] - 2026-06-23

### Fixed

- `Charge` 电量数值与绿色充电动效同步，通过 `clip-path` 绑定 `--charge-pct`
- `Turntable` 旋转动画结束后增加 `cancelled` 守卫，避免卸载后 `setState`
- `Countdown` 目标时间已过期时立即触发 `onEnd`
- `MazeGenerator` 迷宫绘制完成后停止 rAF 循环
- `ProgressChest` / `ScratchCard` / `RedPacketRain` 回调改用 ref，避免闭包陈旧
- Playground 复制代码按钮卸载时清理 `setTimeout`

### Changed

- `Charge` 演示页支持滑块调节电量与自动充电开关
- `CanvasClock` 补充宽高 props 说明（始终渲染为正方形）
- 移除未引用的 `home/`、`demo-layout/` 页面与 `public/models/bantha` 资源
- README 分类名称与 Playground 统一为「背景动效」

## [3.0.2] - 2026-06-23

### Changed

- Playground 重构为顶栏 + 左侧分类导航 + 主内容区布局
- 组件演示页支持分类内上下切换、代码面板折叠与目录首页
- 背景氛围分类更名为「背景动效」

## [3.0.1] - 2026-06-22

### Fixed

- `ScratchCard` 修复 HiDPI 屏幕下刮开进度检测不准确
- `SlotMachine` 修复开奖符号与中间行不对齐；合并为单 rAF 循环；卸载时取消动画
- `AudioVisualizer` 修复组件卸载时麦克风流未释放
- `OrbitalChart` 中心标签改为显示占比最大的数据项
- `DiceRoll` 修复卸载时 `setTimeout` 未清理
- `BurnAway` / `Turntable` 修复卸载后仍触发回调的问题
- `RedPacketRain` 修复结束时动画循环被意外重启
- `TimelinePulse` 修复轴线与圆点垂直不对齐
- `NewtonCradle` 修复摆动不符合动量守恒的视觉问题

### Changed

- `CanvasClock`、`LiquidProgress` 页面隐藏时暂停动画循环
- 优化 `README.md` 排版与组件分类展示

## [3.0.0] - 2026-06-18

### Added

**背景氛围（6）** — `Aurora`、`RippleWater`、`SmokeFog`、`CyberGrid`、`Snowfall`、`Starfield`

**文字动效（6）** — `ScrambleText`、`SplitReveal`、`WaveText`、`GradientFlow`、`BurnAway`、`BarcodeScan`

**交互玩具（6）** — `Spotlight`、`MagneticButton`、`HolographicCard`、`ClickSpark`、`CursorTrail`、`LiquidGlass`

**游戏营销（6）** — `ScratchCard`、`SlotMachine`、`DiceRoll`、`RedPacketRain`、`ProgressChest`、`RadarScan`

**数据装饰（5）** — `LiquidProgress`、`AudioVisualizer`、`Speedometer`、`TimelinePulse`、`OrbitalChart`

**物理创意（5）** — `NewtonCradle`、`GravityBalls`、`DnaHelix`、`ElectricArc`、`MazeGenerator`

### Changed

- Playground 首页按 6 大分类展示组件，支持分类筛选与搜索
- 组件总数从 15 增至 49

## [2.4.1] - 2026-06-18

### Fixed

- `Charge` 恢复原版 gooey 充电动效，修正气泡 nth-child 错位与容器高度动画，Demo 全屏展示
- `Fireworks` 移除重复自动燃放逻辑，页面隐藏时暂停动画
- `Countdown` 校验无效日期，倒计时结束后停止定时器
- `Typewriter` 空文案保护，`texts` 变更时重置状态
- `Confetti` 分离自动喷射与画布循环，避免重复触发
- `ReturnCity` 基于容器尺寸定位星星，默认 `glassCount` 改为 8
- `FlipCounter` 修复翻牌数字裁切与动画层逻辑

### Changed

- Canvas 组件（Fireworks、Confetti、MeteorRain、MatrixRain、ParticleNetwork）页面隐藏时暂停 RAF
- `MeteorRain` 优化流星绘制，避免每帧创建渐变对象
- `MatrixRain` 叠层标题支持 `showOverlay` / `title` / `subtitle` 配置
- `ParticleNetwork` 新增 `repelRadius`，支持触摸互动
- `WaveButton` 支持原生 `button` 属性（如 `disabled`）

## [2.4.0] - 2026-06-18

### Added

- `FlipCounter` 数字翻牌器，机械翻牌风格数字展示
- `Countdown` 活动倒计时，支持目标时间与结束回调
- `Confetti` 彩纸庆祝喷射（Canvas），支持 `ref.burst()` 手动触发
- `GlitchText` 赛博朋克故障风文字
- `MeteorRain` 流星雨背景动画

### Fixed

- `Fireworks` 修复部分烟花升空后不爆炸的问题（加入重力与多重爆炸判定）

## [2.3.0] - 2026-06-18

### Added

- Playground 首页支持组件搜索过滤
- 演示页新增「查看代码」侧栏，支持一键复制使用示例
- `Charge` 支持受控模式（`value` / `onChange`）及 `autoCharge`、`interval`、`step` 配置
- `Fireworks` 支持 `ref.launch()` 手动触发燃放，导出 `FireworksHandle` 类型
- `ReturnCity` 支持 `starCount`、`glassCount`、`glassRadius` 配置
- 新增项目介绍文档 `docs/cos-design-intro.md`

### Changed

- `Charge` 修复 `setInterval` 未清理导致的内存泄漏
- `ReturnCity` 改用 ref 替代 `getElementById`，并清理定时器

### Removed

- `ReturnCity` 移除未生效的 `shining` prop

## [2.2.0] - 2026-06-18

### Changed

- React 升级至 19，Vite 升级至 8
- TypeScript、ESLint 9（flat config）、Stylelint 17 等依赖升级至最新稳定版
- react-router 升级至 v7
- 最低 Node.js 版本要求提升至 20

## [2.1.0] - 2026-06-18

### Added

- `Fireworks` 烟花特效组件（Canvas，支持自动燃放与点击触发）
- `MatrixRain` 黑客帝国数字雨背景组件
- `ParticleNetwork` 粒子连线网络组件（鼠标互动）
- `Typewriter` 终端风格打字机文字组件
- `NeonText` 霓虹灯发光文字组件
- `WaveButton` 波纹扩散按钮组件
- 开发环境首页组件导航，路由由配置自动生成

### Changed

- 重设计 `Turntable` 为可交互抽奖转盘
- 修复 `CanvasClock` 画布时钟渲染错位问题

## [2.0.0] - 2026-06-18

### Changed

- 构建工具从 Webpack 5 迁移至 Vite 6
- React 升级至 18，TypeScript 升级至 5
- 产物目录从 `lib/` 改为 `dist/`，同时输出 ESM 与 CJS
- 包管理器统一为 pnpm
- 样式文件改为 `*.module.less`（CSS Modules 规范）

### Added

- 自动注入组件样式（`vite-plugin-lib-inject-css`）
- GitHub Actions CI 流水线
- 开源贡献文档（CONTRIBUTING、Issue / PR 模板）

### Removed

- Webpack 及相关 loader 依赖
- UMD 格式产物

[3.0.2]: https://github.com/jiaxiantao/cos-design/compare/v3.0.1...v3.0.2
[3.0.1]: https://github.com/jiaxiantao/cos-design/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/jiaxiantao/cos-design/compare/v2.4.1...v3.0.0
[2.4.1]: https://github.com/jiaxiantao/cos-design/compare/v2.4.0...v2.4.1
[2.4.0]: https://github.com/jiaxiantao/cos-design/compare/v2.3.0...v2.4.0
[2.3.0]: https://github.com/jiaxiantao/cos-design/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/jiaxiantao/cos-design/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/jiaxiantao/cos-design/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/jiaxiantao/cos-design/compare/v1.7.5...v2.0.0
