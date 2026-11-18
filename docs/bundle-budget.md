# 包体积与 `three`

活动页应安装 **`@cos-design/<组件>`**，不要把聚合包 `cos-design` 当作生产入口。聚合包的 React 入口会打进全部 91 个组件。Playground 每个组件页的安装命令已经是子包，并提示不要用聚合包。

## 谁会拉进 `three`

源码里 `import ... from 'three'` **只有** `src/components/photoLantern/**`。

| 包                          | `three`                                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| `@cos-design/photo-lantern` | **peerDependency** `three >= 0.160.0`（使用该组件时必须安装）                                       |
| `cos-design`（聚合包）      | **optional peer**。构建把 `three` external 掉；只有渲染 `PhotoLantern` 时才需要安装 `three`         |
| 其余 `@cos-design/*`        | 不依赖 `three`。`RippleWater`、`LavaBubble`、`SoapBubbles` 等是自带的 WebGL / Canvas，不是 Three.js |

`pnpm verify:bundle-budget` 会扫描 `src/components`：除 `photoLantern` 外再出现 `three` 导入即失败，并检查 `photo-lantern` 与聚合包产物仍保留 `from "three"`（没有把 Three 打进包里）。

## gzip 预算

CI 在 `pnpm build` 之后运行 `pnpm verify:bundle-budget`，量的是各包 **React ESM** `dist/react/index.js`（聚合包为 `packages/cos-design/dist/index.js`）的 gzip 字节。预算留有余量，用来挡住误把 `three` 或整库打进子包，不是像素级体积优化。

代表性包：

| 包                               | 为什么选它                               |
| -------------------------------- | ---------------------------------------- |
| `@cos-design/neon-text`          | 小 CSS 文字                              |
| `@cos-design/scratch-card`       | 活动页 Canvas 交互                       |
| `@cos-design/fireworks`          | 庆祝 Canvas                              |
| `@cos-design/turntable`          | 抽奖控件                                 |
| `@cos-design/weather-background` | 最大的背景之一                           |
| `@cos-design/photo-lantern`      | 唯一的 Three 组件，预算远小于 Three 本体 |
| `cos-design`                     | 聚合入口，应当明显大于任一子包           |

数字以 `scripts/check-bundle-budget.mjs` 里的 `BUDGETS` 为准。脚本会把入口文件加上它 `import` 的相对 chunk（聚合包的 `engine-*.js`）一起算 gzip。本轮实测大约：neon-text 0.8 KB、scratch-card 1.7 KB、fireworks 2.3 KB、turntable 2.3 KB、weather-background 16 KB、photo-lantern 7.5 KB、聚合包 React 入口加 engine chunk 约 149 KB。上限留了余量，用来挡住把 `three` 打进包内（Three 本体远大于 photo-lantern 的 14 KB 上限）。超预算时先确认是不是打进了不该进包的依赖，再决定抬预算。
