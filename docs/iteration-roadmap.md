# cos-design 4.0 之后迭代路线图

> 面向 4.0.0 多框架首发后的 P0–P2 优先级，与 [RFC v4](./rfc-v4-multi-framework.md) 风险表对齐。

## P0（4.0.1 前 — 本 PR 范围）

| 项                        | 目标                         | 状态                                     |
| ------------------------- | ---------------------------- | ---------------------------------------- |
| CI `verify:v4-matrix`     | 构建后校验四端产物完整       | ✅ 已接入 CI                             |
| CI `verify:v4-runtime`    | 静态拦截已知 v4 运行时回归   | ✅ 已接入 CI                             |
| CI `verify:webgl-dispose` | C 类 GPU 释放审计            | ✅ 脚本 + CI                             |
| Playwright 多框架 smoke   | Vue / WC / Core 营销关键路径 | ✅ `tests/smoke/multi-framework.spec.ts` |
| Vitest Core 单测          | 抽奖状态机 + 属性解析        | ✅ `tests/unit/*`                        |
| WebGL dispose 文档        | 清单 + 自动化入口            | ✅ `docs/webgl-dispose-checklist.md`     |

**本地验证**

```bash
pnpm build
pnpm verify:v4-matrix
pnpm verify:v4-runtime
pnpm verify:webgl-dispose
pnpm test:unit
pnpm build:demo && pnpm test:smoke
```

## P1（4.0.x）

| 项                       | 说明                                                          |
| ------------------------ | ------------------------------------------------------------- |
| Core 单测覆盖面          | SlotMachine 动画路径、ScratchCard 刮开阈值、FlipCard 受控模式 |
| Element 属性解析共享工具 | 从 91 份 `parseOptions` 抽出 typed helper，减重复             |
| 视觉回归                 | 10 个关键组件截图 diff（Playground）                          |
| `examples/*` CI          | vue-app / vanilla 构建进 PR 检查                              |
| Context7 / llms 增量     | 组件 props 变更时 `pnpm generate:ai-docs` 门禁                |

## P2（4.1+）

| 项                         | 说明                                        |
| -------------------------- | ------------------------------------------- |
| WeatherBackground 分层测试 | Core 纯函数 + Hook/Composable 分列          |
| 内存 smoke                 | Chromium `performance.memory` 采样 Tab 切换 |
| 按变更选择性发布优化       | publish 脚本与 CHANGELOG 自动化             |
| 非 React 框架文档站        | Playground 默认 Tab 策略、SEO               |

## 刻意不做（短期）

- 91 组件大规模重构
- 新视觉组件（优先硬化与测试）
- Admin / 表单类组件
