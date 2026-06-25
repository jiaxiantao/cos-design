# 快速开始

cos-design 是一套面向**视觉表达**的 React 组件库（49 个特效组件），适合活动页、品牌 Landing、数据大屏等场景。本文档帮助你在几分钟内完成安装、使用，并避开常见坑。

---

## 环境要求

| 项目     | 版本            |
| -------- | --------------- |
| Node.js  | >= 20           |
| React    | >= 18           |
| 包管理器 | pnpm 9+（推荐） |

---

## 安装

```bash
pnpm add cos-design
# 或
npm install cos-design
# 或
yarn add cos-design
```

---

## 最简示例

```tsx
import { Fireworks, ScrambleText, ScratchCard } from 'cos-design';

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

**无需手动引入 CSS** — 组件样式会随 JS 自动注入（`sideEffects` 已配置）。

---

## 在本地 Playground 里体验

```bash
git clone https://github.com/jiaxiantao/cos-design.git
cd cos-design
npm run setup
pnpm dev
```

打开 **http://localhost:4000**，左侧选择分类与组件，主区域可预览效果并复制示例代码。

在线演示：[https://jiaxiantao.github.io/cos-design/](https://jiaxiantao.github.io/cos-design/)

---

## 组件怎么选？

| 分类     | 典型用途                 | 代表组件                                     |
| -------- | ------------------------ | -------------------------------------------- |
| 背景动效 | 全屏氛围、粒子场景       | `MatrixRain`、`Aurora`、`Starfield`          |
| 文字动效 | 标题、Banner、终端风文字 | `Typewriter`、`NeonText`、`ScrambleText`     |
| 交互玩具 | 鼠标/触摸趣味反馈        | `WaveButton`、`Spotlight`、`MagneticButton`  |
| 游戏营销 | 抽奖、庆祝、活动玩法     | `Turntable`、`ScratchCard`、`Charge`         |
| 数据装饰 | 大屏、倒计时、进度展示   | `FlipCounter`、`Countdown`、`LiquidProgress` |
| 物理创意 | 物理模拟、创意视觉实验   | `Fireworks`、`NewtonCradle`、`MazeGenerator` |

每个组件的 Props 与示例可在 Playground 对应页面查看。

---

## 使用注意事项

### 1. Canvas / 浏览器 API 组件请客户端渲染

大量组件依赖 `window`、`canvas`、`requestAnimationFrame`。在 **Next.js** 等 SSR 框架中请关闭服务端渲染：

```tsx
import dynamic from 'next/dynamic';

const Fireworks = dynamic(() => import('cos-design').then((m) => m.Fireworks), { ssr: false });
const MatrixRain = dynamic(() => import('cos-design').then((m) => m.MatrixRain), { ssr: false });
```

### 2. 控制页面上的动画密度

建议每页 **「一个强视觉背景 + 若干局部交互」**，避免多个全屏 Canvas 同时运行导致卡顿或视觉杂乱。

### 3. 给 Canvas 组件明确宽高

多数 Canvas 组件通过 `width` / `height` 控制画布尺寸，父容器也应有可见高度：

```tsx
<div style={{ width: '100%', height: 500 }}>
  <Fireworks width={800} height={500} />
</div>
```

全屏类组件（如 `Charge`）需父级 `height: 100%` 或固定高度。

### 4. 页面隐藏时动画会自动暂停

`Fireworks`、`MatrixRain`、`ParticleNetwork` 等会在标签页不可见时暂停 `requestAnimationFrame`，减少后台耗电。

### 5. 需要用户授权的组件

| 组件              | 说明                                  |
| ----------------- | ------------------------------------- |
| `AudioVisualizer` | `useMic` 为 `true` 时会请求麦克风权限 |

请在交互前给用户明确提示，并在 HTTPS 环境下使用。

### 6. 命令式触发的组件

部分组件暴露 ref 方法，适合按钮触发：

```tsx
import { useRef } from 'react';
import { Fireworks, type FireworksHandle } from 'cos-design';

const ref = useRef<FireworksHandle>(null);
// <Fireworks ref={ref} auto={false} />
// ref.current?.launch();
```

支持命令式的组件：`Fireworks`、`Confetti`。

### 7. 受控模式

部分组件支持受控数值，便于与业务状态联动：

```tsx
<Charge value={50} autoCharge={false} onChange={setPct} />
<FlipCounter value={1024} digits={5} />
<Countdown targetDate="2026-12-31T23:59:59" onEnd={() => alert('时间到')} />
```

### 8. TypeScript

所有组件均导出 Props 类型，可按需引入：

```tsx
import { Turntable, type TurntableProps, type TurntablePrize } from 'cos-design';
```

---

## 常见问题

**Q：样式没生效？**  
确认构建工具能处理 CSS 副作用。Vite / Webpack 5 一般开箱即用；若自定义打包，勿将 `cos-design` 的 CSS tree-shake 掉。

**Q：组件不显示？**  
检查父容器高度是否为 0；Canvas 组件是否误在 SSR 环境渲染。

**Q：如何只看某一个组件的源码？**  
仓库内路径为 `src/components/<组件名>/`，Playground 演示在 `src/pages/demos/`。

---

## 更多文档

| 文档                                              | 内容           |
| ------------------------------------------------- | -------------- |
| [README](./README.md)                             | 组件总览与命令 |
| [完整指南](./website-content/cos-design-intro.md) | 架构与组件详解 |
| [CHANGELOG](./CHANGELOG.md)                       | 版本更新       |
| [CONTRIBUTING](./CONTRIBUTING.md)                 | 参与贡献       |

---

**有问题？** 欢迎 [提 Issue](https://github.com/jiaxiantao/cos-design/issues) 或给仓库 Star ⭐
