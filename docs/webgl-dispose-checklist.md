# WebGL / Three.js 资源释放清单（C 类组件）

v4 将渲染逻辑下沉到 `core/engine.ts`。离开页面或卸载 Web Component 时必须通过 `destroy()` 释放 GPU 与动画资源，避免 Playground Tab 切换与 SPA 路由复用导致的内存泄漏。

## 必查项（每个 C 类 / WebGL 组件）

| #   | 检查项                                           | 期望                                                                |
| --- | ------------------------------------------------ | ------------------------------------------------------------------- |
| 1   | `destroy()` 存在且幂等                           | 使用 `destroyed` 标志，重复调用安全                                 |
| 2   | `requestAnimationFrame`                          | `destroy` 内 `cancelAnimationFrame`                                 |
| 3   | `bindVisibilityPause` / 事件监听                 | 保存 unbind 并在 `destroy` 调用                                     |
| 4   | 原生 WebGL                                       | 通过 `glCleanup?.()` 删除 program / texture / buffer / lose context |
| 5   | Three.js                                         | `scene?.dispose()` 或 `disposeObject` / `renderer.dispose()`        |
| 6   | `ResizeObserver` / `ResizeObserver` 类 size 订阅 | `disconnect()` 在 `destroy`                                         |
| 7   | DOM                                              | `root.remove()` 或等价卸载                                          |

## 代表组件（Batch C）

`lavaBubble`, `liquidProgress`, `metaballPool`, `photoLantern`, `photoPrism`, `photoTunnel`, `plasmaBall`, `rippleWater`, `soapBubbles`, `solarSystem`, `dnaHelix`, `orbitalChart`, `photoClothesline`, `photoViewMaster`, `weatherBackground`

参考实现：

- **WebGL 2D 流体**：`lavaBubble` / `rippleWater` — `glCleanup` 工厂在 resize 时重建，在 `destroy` 调用。
- **Three 场景**：`photoLantern` — `scene.ts` 内 `dispose()` + `engine.destroy()` 调用 `scene?.dispose()`。

## 自动化

```bash
pnpm verify:webgl-dispose
```

脚本扫描 BATCH_C 与组件目录内 `three` 引用，校验 `destroy()` 是否调用 `dispose` / `glCleanup`。CI 在 `pnpm build` 之后运行（见 `.github/workflows/ci.yml`）。

## 手动 smoke 提示

Playground 中在同一组件上快速切换 **React → Vue → Web Components → Core** 各 5 次，观察 Chromium 任务管理器 GPU 内存是否单调上涨。异常时优先对照本清单与 `scripts/audit-webgl-dispose.mjs` 报错。

## 4.1 跟进

- [ ] 对仍使用 Canvas 2D 但被标为 C 类的组件（如 `orbitalChart`）修正分级或补文档
- [ ] 可选：Playwright 采样 `performance.memory`（仅 Chromium）做回归阈值
- [ ] `weatherBackground` 子系统分拆后的 dispose 路径单测
