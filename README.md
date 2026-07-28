<div align="center">

# cos-design

**64 个 React 视觉特效组件 · 活动页 / 品牌页 / 创意展示开箱即用**

[![CI](https://github.com/jiaxiantao/cos-design/actions/workflows/ci.yml/badge.svg)](https://github.com/jiaxiantao/cos-design/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/cos-design.svg)](https://www.npmjs.com/package/cos-design)
[![license](https://img.shields.io/npm/l/cos-design.svg)](https://github.com/jiaxiantao/cos-design/blob/main/LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://www.typescriptlang.org/)

[在线预览](https://jiaxiantao.github.io/cos-design/) · [快速开始](./QUICKSTART.md) · [v3.0 发布博客](./website-content/cos-design-v3-release.md) · [完整指南](./website-content/cos-design-intro.md) · [更新日志](./CHANGELOG.md)

</div>

---

## 这是什么？

**cos-design** 是一个面向**视觉表达**的 React 组件库——不是 Ant Design 的替代品，而是给页面加氛围、加趣味、加记忆点的「特效层」。

适合用在：

| 场景         | 你可以用它做什么                        |
| ------------ | --------------------------------------- |
| 营销活动页   | 转盘抽奖、刮刮乐、红包雨、烟花庆祝      |
| 品牌 Landing | 极光 / 深海气泡背景、霓虹标题、全息卡片 |
| 数据大屏     | 翻牌器、数字递增、仪表盘、关系网络图    |
| 创意作品集   | 牛顿摆、DNA 螺旋、迷宫生成、生命游戏    |

> 从背景到物理、从文字到营销，64 个组件刚好组成一套完整的「视觉工具箱」。

---

## 快速开始

> 完整说明见 **[QUICKSTART.md](./QUICKSTART.md)** · Playground 内访问 **#/quickstart**

### 安装

```bash
# 安装全部组件
pnpm add cos-design

# 或按需安装单个组件（npm 包名为 kebab-case）
pnpm add @cos-design/weather-background
pnpm add @cos-design/fireworks
```

> 目录 `weatherBackground` → `@cos-design/weather-background`；依赖 `@cos-design/shared` 的组件会自动安装工具包。

### 最简示例

```tsx
// 全量包
import { Fireworks, ScrambleText, ScratchCard } from 'cos-design';

// 按需子包
// import { WeatherBackground } from '@cos-design/weather-background';

export default function Page() {
  return (
    <>
      <ScrambleText text="GRAND OPENING" />
      <ScratchCard prize="🎉 恭喜中奖！" />
      <Fireworks width={800} height={500} />
    </>
  );
}
```

无需手动引入 CSS，样式自动注入。完整 TypeScript 类型开箱即用。

### 使用注意（摘要）

| 注意点   | 说明                                                            |
| -------- | --------------------------------------------------------------- |
| **SSR**  | Canvas 组件需在 Next.js 等框架中 `dynamic(..., { ssr: false })` |
| **尺寸** | Canvas 组件需明确 `width` / `height`，父容器也应有可见高度      |
| **密度** | 建议每页「一个强背景 + 若干局部交互」，避免多 Canvas 抢性能     |
| **权限** | `AudioVisualizer` 开启麦克风时需 HTTPS 与用户授权               |
| **省电** | 标签页隐藏时，多数 Canvas 动画自动暂停                          |

---

## 组件一览（64 个 · 8 大分类）

<details open>
<summary><strong>背景动效</strong> — 11 个 · 动态场景与粒子背景</summary>

<br>

| 组件                | 说明                                           |
| ------------------- | ---------------------------------------------- |
| `WeatherBackground` | 天气背景（15 种场景 · Open-Meteo 实况 · 日夜） |
| `RippleWater`       | WebGL 水面涟漪                                 |
| `SmokeFog`          | 烟雾雾气飘动（支持点击驱散）                   |
| `BubbleField`       | 深海气泡上升 · 自动融合 · 鼠标扰动水流         |
| `MatrixRain`        | 黑客帝国数字雨                                 |
| `MeteorRain`        | 流星雨穿越                                     |
| `ParticleNetwork`   | 粒子连线网络（支持触摸）                       |
| `Aurora`            | 极光渐变光带                                   |
| `CyberGrid`         | 赛博透视地面                                   |
| `Snowfall`          | 雪花 / 樱花飘落                                |
| `Starfield`         | 3D 纵深星空                                    |

</details>

<details>
<summary><strong>文字动效</strong> — 11 个 · 标题与 Banner 动画</summary>

<br>

| 组件           | 说明                      |
| -------------- | ------------------------- |
| `Typewriter`   | 终端打字机                |
| `NeonText`     | 霓虹发光字                |
| `GlitchText`   | 故障风闪烁                |
| `ScrambleText` | 乱码解密文字              |
| `SplitReveal`  | 字母分裂入场              |
| `WaveText`     | 正弦波浪文字              |
| `GradientFlow` | 流光渐变字                |
| `BurnAway`     | 燃烧消失                  |
| `BarcodeScan`  | 扫描线覆盖                |
| `TextMorph`    | 文案柔和形变过渡          |
| `SplitText`    | 拆字入场（fadeUp 等模式） |

</details>

<details>
<summary><strong>交互玩具</strong> — 7 个 · 鼠标驱动的趣味反馈</summary>

<br>

| 组件              | 说明         |
| ----------------- | ------------ |
| `WaveButton`      | 水波扩散按钮 |
| `Spotlight`       | 手电筒照亮   |
| `MagneticButton`  | 磁吸按钮     |
| `HolographicCard` | 全息反光卡片 |
| `ClickSpark`      | 点击火花     |
| `CursorTrail`     | 光标拖尾     |
| `LiquidGlass`     | 液态毛玻璃   |

</details>

<details>
<summary><strong>游戏营销</strong> — 9 个 · 抽奖与活动玩法</summary>

<br>

| 组件            | 说明         |
| --------------- | ------------ |
| `Turntable`     | 抽奖转盘     |
| `Confetti`      | 彩纸喷射庆祝 |
| `Charge`        | 充电动效     |
| `ScratchCard`   | 刮刮乐       |
| `SlotMachine`   | 老虎机       |
| `DiceRoll`      | 3D 掷骰子    |
| `RedPacketRain` | 红包雨       |
| `ProgressChest` | 宝箱进度     |
| `RadarScan`     | 雷达扫描 HUD |

</details>

<details>
<summary><strong>数据装饰</strong> — 10 个 · 大屏与时间展示</summary>

<br>

| 组件              | 说明             |
| ----------------- | ---------------- |
| `CanvasClock`     | Canvas 模拟时钟  |
| `FlipCounter`     | 机械翻牌数字     |
| `Countdown`       | 活动倒计时       |
| `CountUp`         | 数字递增动画     |
| `LiquidProgress`  | 液体进度环       |
| `AudioVisualizer` | 音频可视化       |
| `Speedometer`     | 速度仪表盘       |
| `TimelinePulse`   | 时间轴脉冲       |
| `OrbitalChart`    | 轨道占比图       |
| `NetworkGraph`    | 力导向关系网络图 |

</details>

<details>
<summary><strong>物理模拟</strong> — 7 个 · 重力、弹簧与碰撞互动</summary>

<br>

| 组件             | 说明         |
| ---------------- | ------------ |
| `NewtonCradle`   | 牛顿摆       |
| `GravityBalls`   | 重力球池     |
| `SandFall`       | 像素沙粒下落 |
| `SpringMass`     | 弹簧质点网格 |
| `DoublePendulum` | 双摆混沌轨迹 |
| `MetaballPool`   | 液态融合球   |
| `RopeChain`      | 绳索链条摆动 |

</details>

<details>
<summary><strong>科学算法</strong> — 5 个 · 天文、混沌与算法可视化</summary>

<br>

| 组件              | 说明            |
| ----------------- | --------------- |
| `DnaHelix`        | DNA 双螺旋      |
| `SolarSystem`     | 太阳系公转      |
| `LorenzAttractor` | 洛伦兹吸引子    |
| `MazeGenerator`   | 迷宫生成器      |
| `GameOfLife`      | Conway 生命游戏 |

</details>

<details>
<summary><strong>视觉特效</strong> — 4 个 · 烟花、电弧与传送门</summary>

<br>

| 组件          | 说明         |
| ------------- | ------------ |
| `Fireworks`   | 烟花燃放     |
| `ReturnCity`  | 回城传送特效 |
| `ElectricArc` | 电弧闪电     |
| `PlasmaBall`  | 等离子静电球 |

</details>

---

## 特性

- **64 个组件**，覆盖背景、文字、交互、营销、数据、物理、科学、特效八大场景
- **React 19** + **Vite 8** + **TypeScript 5** 现代技术栈
- **ESM / CJS** 双格式，完整 `.d.ts` 类型
- **样式自动注入**，无需 `import 'cos-design/dist/index.css'`
- Canvas 组件**页面隐藏时自动暂停**动画，省电友好
- **GitHub Actions** 自动 lint、构建、npm 发布

---

## 本地开发

> 要求 **Node.js >= 20**（推荐 Node 22，项目含 `.nvmrc`）

```bash
git clone git@github.com:jiaxiantao/cos-design.git
cd cos-design
nvm use
npm run setup          # 安装依赖（绕过 corepack 问题）
npx --yes pnpm@9 dev   # 启动 Playground
```

访问 **http://localhost:4000** — 按分类浏览全部 64 个组件，右侧可查看与复制示例代码。

---

## 常用命令

| 命令                     | 说明           |
| ------------------------ | -------------- |
| `npm run setup`          | 安装依赖       |
| `npx --yes pnpm@9 dev`   | 启动本地演示   |
| `npx --yes pnpm@9 build` | 构建组件库     |
| `npx --yes pnpm@9 lint`  | 代码检查       |
| `npx --yes pnpm@9 pub`   | 构建并发布 npm |

---

## 使用注意

详见 [QUICKSTART.md](./QUICKSTART.md)。以下为高频场景摘要：

**Canvas 组件请客户端渲染**（依赖 `window` / `canvas` / `requestAnimationFrame`）：

```tsx
import dynamic from 'next/dynamic';

const Fireworks = dynamic(() => import('cos-design').then((m) => m.Fireworks), { ssr: false });
```

**控制使用密度** — 一个页面建议「一个强视觉背景 + 若干局部交互」，避免全场动画互相抢戏。

---

## 文档

| 文档                                                        | 内容                             |
| ----------------------------------------------------------- | -------------------------------- |
| [快速开始](./QUICKSTART.md)                                 | 安装、用法、注意事项与常见问题   |
| [v3.0 发布博客](./website-content/cos-design-v3-release.md) | 重大升级解读、分类体系、技术实现 |
| [完整介绍与实践指南](./website-content/cos-design-intro.md) | 架构、使用规则、组件详解         |
| [CHANGELOG](./CHANGELOG.md)                                 | 版本更新记录                     |
| [CONTRIBUTING](./CONTRIBUTING.md)                           | 参与贡献指南                     |

---

## 自动发布

推送到 `master` 后，GitHub Actions 自动 lint、构建，并将新版本发布到 [npm](https://www.npmjs.com/package/cos-design)。

首次配置需在 GitHub Secrets 中设置 `NPM_TOKEN`（需勾选 **Bypass 2FA for publish**）。详见 [npm Access Tokens](https://www.npmjs.com/settings/jiaxiantao/tokens)。

---

## 参与贡献

欢迎提交 Issue 与 Pull Request！

---

<div align="center">

**如果觉得有用，欢迎 Star ⭐**

[MIT](./LICENSE) © [jiaxiantao](https://github.com/jiaxiantao)

</div>
