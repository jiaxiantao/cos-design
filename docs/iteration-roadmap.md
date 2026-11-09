# cos-design 4.0 之后迭代路线图

> 版本规划：**4.0.0** 多框架首发 → **4.0.1** P0 硬化（CI / smoke / Vitest）→ **4.1** 质量与文档对齐（本迭代）。

## P0（4.0.1 — PR #5 已落地）

| 项 | 目标 | 状态 |
| --- | --- | --- |
| CI `verify:v4-matrix` | 构建后校验四端产物完整 | ✅ |
| CI `verify:v4-runtime` | 静态运行时回归 | ✅ |
| CI `verify:webgl-dispose` | C 类 GPU 释放审计 | ✅ |
| Playwright 多框架 smoke | Vue / WC / Core 营销路径 | ✅ |
| Vitest Core 单测（初版） | 抽奖 + 属性解析 | ✅ |
| WebGL dispose 文档 | 清单 + 脚本 | ✅ |

## 4.1（同 PR 续 — 当前）

| 项 | 状态 | 说明 |
| --- | --- | --- |
| WeatherBackground Vue composable 文档 | ✅ | `useLiveWeather` / `useSunTimes` 实现 + [weather-background-vue.md](./examples/weather-background-vue.md) |
| Element `parseOptions` 共享 | ✅ | `@cos-design/shared` `element-options.ts`，91 个 Element 经 `fix-v4-adapters` 迁移 |
| Core 单测加深 | ✅ | FlipCard 受控、ScratchCard 阈值、dispose smoke |
| `examples/vue-app` + vanilla CI | ✅ | `ci.yml` 构建步骤 |
| 视觉回归截图 | ⏭ defer | Playwright 截图基线在多环境/DPR 下易碎；见下节 |
| 内存 smoke（Chromium heap） | ⏭ 轻量替代 | `tests/unit/dispose-smoke.test.ts` 覆盖 remount/idempotent destroy |
| Context7 / llms 门禁 | 🔜 4.1.x | 仍靠 `generate:ai-docs` 手动 + push 刷新 |

**本地验证（4.1 全量）**

```bash
pnpm build
pnpm verify:v4-matrix && pnpm verify:v4-runtime && pnpm verify:webgl-dispose
pnpm test:unit
pnpm --dir examples/vue-app build && pnpm --dir examples/vanilla build
pnpm build:demo && pnpm test:smoke
```

## P1（4.1.x 后续）

| 项 | 说明 |
| --- | --- |
| 视觉回归 | Playwright `toHaveScreenshot` + 固定 DPR/视口；首批 3–5 个营销组件 |
| WeatherBackground 单测分列 | `live-weather-core` 纯函数 Vitest（无网络 mock fetch） |
| Element parseOptions 代码生成 | `fix-v4-adapters` 已接入；props 变更后跑脚本再生 |
| `examples/next-app` CI | 可选；Next 构建较慢，单独 job |

## P2（4.2+）

| 项 | 说明 |
| --- | --- |
| Chromium `performance.memory` Tab 切换阈值 | 需 headed / 专用 runner |
| 按变更选择性发布 | publish 脚本与 CHANGELOG |
| Playground 默认框架 Tab / SEO | 产品向 |

## Defer 说明（视觉 / 内存）

- **截图回归**：GitHub Actions `ubuntu-latest` 与本地字体/DPR 不一致，首版易产生大量无意义 diff；待固定 `deviceScaleFactor` + 少组件试点后再开 CI 门禁。
- **Heap 断言**：无稳定阈值且 headless 默认不暴露 `performance.memory`；用 **dispose 烟测** 保证 destroy 可重复调用、DOM 清空。

## 刻意不做（短期）

- 新视觉组件
- Admin / 表单类 UI
- 91 组件引擎大重构
