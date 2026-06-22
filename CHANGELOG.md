# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[3.0.0]: https://github.com/jiaxiantao/cos-design/compare/v2.4.1...v3.0.0
[2.4.1]: https://github.com/jiaxiantao/cos-design/compare/v2.4.0...v2.4.1
[2.4.0]: https://github.com/jiaxiantao/cos-design/compare/v2.3.0...v2.4.0
[2.3.0]: https://github.com/jiaxiantao/cos-design/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/jiaxiantao/cos-design/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/jiaxiantao/cos-design/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/jiaxiantao/cos-design/compare/v1.7.5...v2.0.0
