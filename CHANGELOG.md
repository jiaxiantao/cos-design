# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[2.0.0]: https://github.com/jiaxiantao/cos-design/compare/v1.7.5...v2.0.0
