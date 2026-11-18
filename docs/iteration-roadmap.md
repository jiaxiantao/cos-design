# cos-design 4.0 之后迭代路线图

> 版本规划：**4.0.0** 多框架首发已在 npm。其后合入 master 的 P0 硬化、4.1 质量项与本轮 P1 没有单独发版，随 **4.1.0**（2026-11-18）一次发布。下面各节仍按当时的切片记录。

## P0（4.0.1 — PR #5 已落地）

| 项                        | 目标                     | 状态 |
| ------------------------- | ------------------------ | ---- |
| CI `verify:v4-matrix`     | 构建后校验四端产物完整   | ✅   |
| CI `verify:v4-runtime`    | 静态运行时回归           | ✅   |
| CI `verify:webgl-dispose` | C 类 GPU 释放审计        | ✅   |
| Playwright 多框架 smoke   | Vue / WC / Core 营销路径 | ✅   |
| Vitest Core 单测（初版）  | 抽奖 + 属性解析          | ✅   |
| WebGL dispose 文档        | 清单 + 脚本              | ✅   |

## 4.1（PR #5 已合并）

| 项                                    | 状态        | 说明                                                                                                      |
| ------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------- |
| WeatherBackground Vue composable 文档 | ✅          | `useLiveWeather` / `useSunTimes` 实现 + [weather-background-vue.md](./examples/weather-background-vue.md) |
| Element `parseOptions` 共享           | ✅          | `@cos-design/shared` `element-options.ts`，91 个 Element 经 `fix-v4-adapters` 迁移                        |
| Core 单测加深                         | ✅          | FlipCard 受控、ScratchCard 阈值、dispose smoke                                                            |
| `examples/vue-app` + vanilla CI       | ✅          | `ci.yml` 构建步骤                                                                                         |
| 视觉回归截图                          | ⏭ defer    | Playwright 截图基线在多环境/DPR 下易碎；见下节                                                            |
| 内存 smoke（Chromium heap）           | ⏭ 轻量替代 | `tests/unit/dispose-smoke.test.ts` 覆盖 remount/idempotent destroy                                        |
| Context7 / llms 门禁                  | 🔜 4.1.x    | 仍靠 `generate:ai-docs` 手动 + push 刷新                                                                  |

**本地验证（4.1 全量）**

```bash
pnpm build
pnpm verify:v4-matrix && pnpm verify:v4-runtime && pnpm verify:webgl-dispose
pnpm test:unit
pnpm --dir examples/vue-app build && pnpm --dir examples/vanilla build
pnpm build:demo && pnpm test:smoke
```

## P1（4.1.x — 本轮）

| 项                    | 状态          | 说明                                                                                                                                                  |
| --------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub 叙事与发现     | ✅ 仓库内完成 | About / topics 文案见 [github-discovery.md](./github-discovery.md)。云端 token 若无 Administration 权限，描述、topics、Discussions 需维护者按该文点击 |
| Issue 模板            | ✅            | Bug / 新特效提案 / 框架适配                                                                                                                           |
| Playground 复制 HTML  | ✅            | Element Tab：`script type=module` + 标签 + 关键属性，按钮「复制 HTML」                                                                                |
| 减少动效审计          | ✅            | [a11y-reduced-motion.md](./a11y-reduced-motion.md)。补了 LavaBubble、SoapBubbles 首帧冻结，以及 MatrixRain 标题 / 天气加载圈                          |
| Next client-only 配方 | ✅            | QUICKSTART、`examples/next-app`、Playground 快速开始同一写法                                                                                          |
| 按需安装与 gzip 预算  | ✅            | [bundle-budget.md](./bundle-budget.md)，CI `verify:bundle-budget`。`three` 仅 PhotoLantern                                                            |

本轮验证在 4.1 命令之外加上 `pnpm verify:bundle-budget`。Playground 有改动时跑 `pnpm build:demo && pnpm test:smoke`。

### 仍遗留（不要在本轮扩写）

| 项                            | 说明                                                                                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 视觉回归                      | Playwright `toHaveScreenshot` + 固定 DPR/视口；首批 3–5 个营销组件。多环境易碎，继续 defer                                                                           |
| 内存 / heap 门禁              | 继续用 dispose 烟测，不上 Chromium heap 阈值                                                                                                                         |
| WeatherBackground 单测分列    | `live-weather-core` 纯函数 Vitest（无网络 mock fetch）                                                                                                               |
| Element parseOptions 代码生成 | `fix-v4-adapters` 已接入；props 变更后跑脚本再生，不是新手入口                                                                                                       |
| `examples/next-app` 独立 CI   | Next 构建较慢，未单列 job                                                                                                                                            |
| Context7 / llms 门禁          | 仍靠 `generate:ai-docs` 手动 + push 刷新                                                                                                                             |
| 减少动效扫尾                  | 背景挂载后把系统偏好从 reduce 切回普通，Weather / Ripple 等不会自动恢复循环；庆祝类 Fireworks / Confetti / RedPacketRain 不是「首帧冻结」；文字 CSS 关键帧大多未处理 |
| GitHub Discussions            | 需所有者在 Settings → General → Features 勾选。API 无权限时仓库设置不会变                                                                                            |
| 按变更选择性发布              | 仍是 P2                                                                                                                                                              |

## P2（4.2+）

| 项                                         | 说明                     |
| ------------------------------------------ | ------------------------ |
| Chromium `performance.memory` Tab 切换阈值 | 需 headed / 专用 runner  |
| 按变更选择性发布                           | publish 脚本与 CHANGELOG |
| Playground 默认框架 Tab / SEO              | 产品向                   |

## Defer 说明（视觉 / 内存）

- **截图回归**：GitHub Actions `ubuntu-latest` 与本地字体/DPR 不一致，首版易产生大量无意义 diff；待固定 `deviceScaleFactor` + 少组件试点后再开 CI 门禁。
- **Heap 断言**：无稳定阈值且 headless 默认不暴露 `performance.memory`；用 **dispose 烟测** 保证 destroy 可重复调用、DOM 清空。

## 刻意不做（短期）

- 新视觉组件
- Admin / 表单类 UI
- 91 组件引擎大重构
