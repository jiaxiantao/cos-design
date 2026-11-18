# `prefers-reduced-motion` 审计

约定（与 [campaign-patterns.md](./campaign-patterns.md) 一致）：

- **背景组件**：`prefers-reduced-motion: reduce` 时画出一帧静态画面，不启动持续的 `requestAnimationFrame` 循环。
- **营销抽奖控件**（`Turntable` / `SlotMachine` / `NineGrid`）：跳过旋转动画，直接展示结果；按钮在动画期间仍是 `aria-busy`（减少动效时忙态一闪而过，因为没有动画）。

审计日期：2026-11，对照 `master` 上 4.0.0 之后的引擎。

## 背景（16）

| 组件                | 减少动效 | 说明                                                                                   |
| ------------------- | -------- | -------------------------------------------------------------------------------------- |
| `WeatherBackground` | 通过     | 挂载时只 `paintFrame(false)`，不启动循环                                               |
| `RippleWater`       | 通过     | `drawFrame(0)` 后返回，不启动循环                                                      |
| `SmokeFog`          | 通过     | 画背景与烟团一帧后返回                                                                 |
| `BubbleField`       | 通过     | `paintStaticFrame()`，偏好变化时会重开循环                                             |
| `SoapBubbles`       | 已修     | 原先每帧重绘但不推进时间，rAF 不停；现为画一帧后停止，关闭减少动效后再恢复             |
| `DandelionField`    | 通过     | `paint(true)` 后不启动循环                                                             |
| `LavaBubble`        | 已修     | 原先 rAF 中反复 `paint(0)`；现为画一帧后停止，关闭减少动效后再恢复                     |
| `InkBloom`          | 通过     | `paintWater(0)` 后不启动循环                                                           |
| `AuroraVeil`        | 通过     | `paint(true)` 后不启动循环                                                             |
| `MatrixRain`        | 已修     | Canvas 首帧冻结原本已有；标题 CSS `flicker` 仍在动，现已在减少动效时 `animation: none` |
| `MeteorRain`        | 通过     | `drawMeteors(false)`                                                                   |
| `ParticleNetwork`   | 通过     | `paintFrame(false)`                                                                    |
| `Aurora`            | 通过     | 纯 CSS，`@media (prefers-reduced-motion: reduce)` 去掉 `aurora-flow`                   |
| `CyberGrid`         | 通过     | `paintGrid(false)`                                                                     |
| `Snowfall`          | 通过     | `paintFrame(false)`                                                                    |
| `Starfield`         | 通过     | `paintStatic()`                                                                        |

挂载之后系统偏好从「减少动效」切回普通动效时，`WeatherBackground` / `RippleWater` 以及若干「只在挂载时决定是否 `tick()`」的背景不会自动恢复循环，需要重新挂载。`BubbleField`、`SmokeFog`、`LavaBubble`、`SoapBubbles` 会恢复。这不是首帧冻结的缺口，记在文末遗留。

## 抽奖控件

| 组件          | 跳过旋转                                           | `aria-busy`                             |
| ------------- | -------------------------------------------------- | --------------------------------------- |
| `Turntable`   | 通过：`prefersReducedMotion()` 时直接 `finishSpin` | 通过：旋转中 `aria-busy=true`           |
| `SlotMachine` | 通过：直接 `finishSpin`                            | 通过                                    |
| `NineGrid`    | 通过：直接落到中奖格并 `onDrawEnd`                 | 通过；CSS `transition` 在减少动效时关闭 |

## 庆祝类（不是背景冻结契约）

| 组件            | 行为                                                                                       | 是否本轮修改                     |
| --------------- | ------------------------------------------------------------------------------------------ | -------------------------------- |
| `Fireworks`     | 减少动效时不画进行中的火箭，自动模式只 `launch()` 一次；rAF 仍在，画面逐渐被半透明清屏盖住 | 否（保持现有降级，不改庆祝时序） |
| `Confetti`      | 粒子仍会运动，但 alpha 衰减更快、数量更少                                                  | 否                               |
| `RedPacketRain` | 不生成、不移动红包；rAF 清屏循环仍在                                                       | 否                               |

## 明确不在本轮

文字 / 按钮类 CSS 关键帧（`NeonText`、`GlitchText`、`ShinyText`、`Typewriter` 光标等）多数没有 `prefers-reduced-motion`。它们不是背景，也不是抽奖旋转。后续若做 a11y 扫尾，按组件加 `animation: none` 即可，不要顺手改引擎。
