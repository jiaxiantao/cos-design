# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[2.2.0]: https://github.com/jiaxiantao/cos-design/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/jiaxiantao/cos-design/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/jiaxiantao/cos-design/compare/v1.7.5...v2.0.0
