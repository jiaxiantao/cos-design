# cos-design v3.0：从 15 个 Demo 到 49 个组件的视觉特效库

> 本文记录 **cos-design v3.0.0** 的重大升级——一次将组件规模扩大三倍以上、并重新梳理产品结构的版本发布。如果你正在评估是否引入、或从 v2.x 升级，这篇文章会比 CHANGELOG 更完整地说明「做了什么」以及「为什么这样做」。

**项目地址**：[github.com/jiaxiantao/cos-design](https://github.com/jiaxiantao/cos-design)  
**npm**：[npmjs.com/package/cos-design](https://www.npmjs.com/package/cos-design)  
**版本**：`3.0.0`  
**发布日期**：2026-06-18

---

## 一、这次升级意味着什么？

在 v2.x 阶段，cos-design 已经具备了组件库的基本形态：独立目录、TypeScript 类型、ESM/CJS 双格式输出、CI 自动发布。但组件数量停留在 **15 个**左右，更像「几个高质量视觉 Demo 的集合」。

v3.0 的目标很明确：**从 Demo 集合进化为可按场景选用的视觉组件工具箱**。

| 指标         | v2.4.x             | v3.0.0                                  |
| ------------ | ------------------ | --------------------------------------- |
| 组件总数     | 15                 | **49**                                  |
| 分类体系     | 无                 | **6 大类**                              |
| Playground   | 平铺卡片           | **分类 + 搜索**                         |
| 典型场景覆盖 | 背景 / 文字 / 抽奖 | 背景 / 文字 / 交互 / 营销 / 数据 / 物理 |

这是一次 **Major Release**：组件 API 面大幅扩展，Playground 信息架构重构，但**现有 v2 组件的对外 API 保持兼容**——你可以直接 `pnpm add cos-design@3` 升级，原有引入方式不需要改动。

---

## 二、为什么是 Major 版本？

按照 [Semantic Versioning](https://semver.org/)，Major 版本意味着「可能有破坏性变更」。v3.0 选择跳 Major，主要基于产品定位的变化，而非大规模 API 破坏：

1. **组件表面积扩大 3 倍**：新增 34 个 export，库的「能力边界」发生了质变。
2. **Playground 信息架构重做**：开发预览页从单列表变为分类导航，对贡献者和使用者的心智模型都有影响。
3. **分类成为一等公民**：每个组件在配置层新增 `category` 字段，这是面向未来的组织方式。

如果你只使用 v2 已有的 15 个组件，升级风险很低；如果你计划在新项目里全面使用视觉特效，v3.0 才是完整的起点。

---

## 三、六大分类：按场景而不是按技术选型

过去所有组件平铺在一个列表里，找「适合活动页抽奖」还是「适合大屏数据装饰」全靠记忆和搜索。v3.0 按**使用场景**划分为六类：

| 分类         | 定位                     | 组件数 | 代表组件                                        |
| ------------ | ------------------------ | ------ | ----------------------------------------------- |
| **背景氛围** | 页面底层动态场景         | 9      | `Aurora`、`CyberGrid`、`Starfield`              |
| **文字动效** | 标题、Banner、终端风文案 | 9      | `ScrambleText`、`GradientFlow`、`BurnAway`      |
| **交互玩具** | 鼠标/触摸驱动的趣味反馈  | 7      | `Spotlight`、`HolographicCard`、`LiquidGlass`   |
| **游戏营销** | 抽奖、庆祝、活动玩法     | 9      | `ScratchCard`、`SlotMachine`、`RedPacketRain`   |
| **数据装饰** | 大屏、仪表盘、时间线     | 8      | `Speedometer`、`TimelinePulse`、`OrbitalChart`  |
| **物理创意** | 物理模拟与视觉实验       | 7      | `NewtonCradle`、`GravityBalls`、`MazeGenerator` |

分类配置集中在 `src/pages/config/categories.ts`，每个组件在 `components.ts` 中标注 `category`。这套结构同时驱动了 Playground 首页的分组展示和筛选器——**配置即文档**。

---

## 四、新增 34 个组件：每个分类补全了什么？

### 4.1 背景氛围：从「一种风格」到「多种情绪」

v2 已有 `MatrixRain`、`MeteorRain`、`ParticleNetwork` 三种 Canvas 背景。v3 补齐了不同情绪走向：

- **柔和梦幻** → `Aurora`（CSS 渐变光带）
- **交互水面** → `RippleWater`（点击产生涟漪）
- **悬疑雾气** → `SmokeFog`（噪声雾气飘动）
- **赛博科幻** → `CyberGrid`（Tron 透视地面）
- **节日浪漫** → `Snowfall`（支持 `snow` / `sakura` 双模式）
- **太空穿越** → `Starfield`（纵深飞行星空）

```tsx
import { Aurora, Snowfall, CyberGrid } from 'cos-design';

// 登录页：柔和极光
<Aurora width={1200} height={600} />

// 春节活动：樱花飘落
<Snowfall mode="sakura" width={800} height={500} count={80} />

// 科技发布会：赛博地面
<CyberGrid width={800} height={400} color="#38bdf8" speed={1.2} />
```

### 4.2 文字动效：从「闪烁」到「叙事」

v2 的 `NeonText`、`GlitchText`、`Typewriter` 覆盖了霓虹、故障、终端三种风格。v3 增加了**过程感**和**入场感**：

| 组件           | 核心体验          | 适用场景           |
| -------------- | ----------------- | ------------------ |
| `ScrambleText` | 乱码逐字「破解」  | 黑客/特工风标题    |
| `SplitReveal`  | 字母从四向弹入    | Landing 页大标题   |
| `WaveText`     | 正弦波起伏        | 音乐/活泼主题      |
| `GradientFlow` | 渐变在文字上流动  | 现代品牌 Slogan    |
| `BurnAway`     | 点燃后燃烧消失    | 转场、倒计时结束   |
| `BarcodeScan`  | 扫描线 + 故障覆盖 | 身份验证、科技 HUD |

```tsx
import { ScrambleText, SplitReveal } from 'cos-design';

<ScrambleText text="ACCESS GRANTED" duration={2000} />
<SplitReveal text="WELCOME" color="#38bdf8" delay={80} />
```

### 4.3 交互玩具：让页面「有手感」

这类组件不追求全屏视觉冲击，而是增强局部交互质感：

- `Spotlight`：暗层中鼠标照亮隐藏区域
- `MagneticButton`：按钮随光标磁吸偏移
- `HolographicCard`：倾斜时彩虹反光的全息卡片
- `ClickSpark`：点击处迸发轻量火花
- `CursorTrail`：光标粒子拖尾
- `LiquidGlass`：Apple 风毛玻璃面板

它们适合嵌在 Hero 区、卡片、按钮等局部，而不是铺满整页。

### 4.4 游戏营销：组成「活动页工具箱」

v2 有 `Turntable`、`Confetti`、`Charge`。v3 补齐了常见营销玩法：

```tsx
import { ScratchCard, SlotMachine, ProgressChest } from 'cos-design';

// 刮刮乐
<ScratchCard prize="🎉 恭喜中奖！" onReveal={() => showModal()} />

// 老虎机
<SlotMachine onSpinEnd={(results) => console.log(results)} />

// 宝箱进度：满格后开箱
<ProgressChest progress={85} label="开启宝箱" onOpen={() => confetti.burst()} />
```

加上 `DiceRoll`（掷骰子）、`RedPacketRain`（红包雨）、`RadarScan`（雷达 HUD），基本覆盖了常见活动页的玩法需求。

### 4.5 数据装饰：让数字「好看」而不只是「可读」

| 组件              | 实现               | 典型用途           |
| ----------------- | ------------------ | ------------------ |
| `LiquidProgress`  | SVG 液面晃动       | 进度环、加载态     |
| `AudioVisualizer` | Canvas + Web Audio | 音乐播放器、语音页 |
| `Speedometer`     | SVG 弧线仪表       | 车速、性能指标     |
| `TimelinePulse`   | CSS 时间轴脉冲     | 流程里程碑         |
| `OrbitalChart`    | SVG 轨道占比       | 数据大屏装饰       |

`AudioVisualizer` 支持麦克风输入，在无权限时自动降级为 Demo 波形，保证演示可用。

### 4.6 物理创意：炫技与科普兼得

- `NewtonCradle`：牛顿摆（CSS 分段 easing 模拟动量守恒）
- `GravityBalls`：Canvas 重力碰撞球池
- `DnaHelix`：旋转双螺旋
- `ElectricArc`：两点间随机闪电
- `MazeGenerator`：DFS 回溯实时生成迷宫

这类组件更适合技术展示、科普页面、创意作品集。

---

## 五、技术实现：两个阵营，一套规范

49 个组件看起来很多，但底层实现可以归纳为两条主线。

### 5.1 Canvas 阵营：性能与生命周期

约一半组件基于 Canvas 绘制（背景、粒子、物理模拟等）。它们共享一套工程约定：

```ts
// src/components/_shared/visibility.ts
export const bindVisibilityPause = (onChange: (paused: boolean) => void) => {
  const handler = () => onChange(document.hidden);
  document.addEventListener('visibilitychange', handler);
  return () => document.removeEventListener('visibilitychange', handler);
};
```

**页面隐藏时暂停 `requestAnimationFrame`**，避免后台标签空转耗电。这在 v2.4.1 已引入，v3 新增的所有 Canvas 组件均遵循此模式。

其他 Canvas 组件共性：

- 使用 `devicePixelRatio` 适配高清屏
- `useEffect` 清理 `cancelAnimationFrame` 和事件监听
- 通过 Props 暴露 `width` / `height`，不硬编码视口尺寸

### 5.2 CSS 阵营：动画与 3D 变换

文字动效、按钮、卡片、时间轴等以 CSS Modules + `@keyframes` 为主。优势是：

- 不占用 JS 主线程做逐帧绘制
- 更易做响应式和主题定制（CSS 变量）
- 包体积更小

例如 `TimelinePulse` 的轴线定位：

```less
.track,
.progress {
  top: calc(var(--dot-size) / 2);
  left: var(--line-inset);
  transform: translateY(-50%);
}

// --line-inset: calc(100% / var(--step-count) / 2)
// 确保线条从第一个圆点中心连到最后一个
```

用 CSS 变量动态计算起止位置，而不是硬编码 `top: 36px`——这是 v3 开发中总结的布局模式。

### 5.3 组件目录约定

每个组件保持统一结构，降低维护和贡献门槛：

```
src/components/fooBar/
├── index.tsx          # 组件 + Props 类型 + default export
└── style/
    └── index.module.less
```

`src/components/index.tsx` 统一 barrel export，配合 `vite-plugin-dts` 生成类型声明。

---

## 六、Playground 改造：49 个组件怎么逛？

组件数量从 15 涨到 49 后，平铺卡片列表已经不可浏览。v3 对开发预览页做了这些改动：

### 6.1 分类导航 + 搜索

首页顶部新增 6 个分类 Pill 按钮，点击可筛选；搜索框同时支持组件名、中文标题、描述和标签。

### 6.2 分组 Section 展示

在「全部」模式下，组件按分类分成多个 Section，每段有标题、说明和数量角标。布局宽度从 960px 扩展到 1200px，适配更多卡片。

### 6.3 演示配置拆分

```
src/pages/config/
├── categories.ts       # 分类元数据
├── components.ts       # 49 个组件的 name / path / category / codeExample
└── demo-components.tsx # 每个组件的 Playground 演示 JSX
```

`app.tsx` 只负责路由映射，演示逻辑集中在 `demo-components.tsx`，新增组件时改三个配置文件即可。

---

## 七、质量打磨：两个典型修复

大规模新增之外，v3 也修复了两个有代表性的「细节不像样就不像样」的问题。

### 7.1 NewtonCradle：CSS 动画的物理感

初版牛顿摆让左右球各自 `alternate` 循环，导致两球同时撞向中间。修复后采用**四段式同步时间轴**：

1. 左球从峰值加速下落（`ease-in-sine`）
2. 右球从静止被弹出、减速上升（`ease-out-sine`）
3. 右球加速回落
4. 左球被撞回峰值

中间球全程静止，符合动量守恒的视觉预期。

### 7.2 TimelinePulse：轴线与圆点对齐

时间轴组件的轴线曾用 `top: 36px` 硬编码，与 14px 圆点中心错位。修复后：

- 轴线 `top` 绑定 `--dot-size / 2`
- 水平起止用 `--line-inset: calc(100% / step-count / 2)` 对齐圆心
- 进度条宽度用 `--progress-ratio` 无单位比例计算

---

## 八、如何升级到 v3.0？

### 8.1 安装

```bash
pnpm add cos-design@3
# or
npm install cos-design@3
```

### 8.2 破坏性变更评估

| 变更项                 | 影响               | 建议                               |
| ---------------------- | ------------------ | ---------------------------------- |
| 新增 34 个 export      | 无影响             | 按需引入即可                       |
| 现有 15 个组件 API     | **兼容**           | 无需改代码                         |
| 包体积 `dist/index.js` | 增大（~24KB gzip） | 依赖 Tree Shaking，不要 `import *` |
| Canvas 组件 SSR        | 同 v2              | 客户端动态导入                     |

### 8.3 快速试用新组件

```tsx
import { ScrambleText, HolographicCard, ScratchCard, Speedometer, NewtonCradle } from 'cos-design';

function ActivityPage() {
  return (
    <div>
      <ScrambleText text="GRAND OPENING" />
      <HolographicCard title="VIP 会员卡" subtitle="限量编号 #001" />
      <ScratchCard prize="🎁 免单券" />
      <Speedometer value={86} max={120} label="km/h" />
      <NewtonCradle ballCount={5} color="#38bdf8" />
    </div>
  );
}
```

### 8.4 SSR 项目注意

所有 Canvas 类组件（背景、粒子、物理模拟等）仍需客户端渲染：

```tsx
import dynamic from 'next/dynamic';

const Starfield = dynamic(() => import('cos-design').then((m) => m.Starfield), {
  ssr: false,
});
```

---

## 九、构建产物与性能预期

v3.0 构建产物（供参考）：

| 文件                   | 大小   | gzip   |
| ---------------------- | ------ | ------ |
| `dist/index.js` (ESM)  | ~86 KB | ~24 KB |
| `dist/index.cjs` (CJS) | ~66 KB | ~21 KB |
| `dist/index.css`       | ~35 KB | ~8 KB  |

这是**全量打包**的体积。实际业务中通过按需引入，只会打入用到的组件及其样式。CSS 通过 `vite-plugin-lib-inject-css` 自动注入，无需手动 `import 'cos-design/dist/index.css'`。

性能建议与 v2 一致：

- 一个页面避免堆叠多个全屏 Canvas 背景
- 使用 `bindVisibilityPause` 的组件在切标签时会自动暂停
- 活动页建议「一个强视觉 + 若干局部交互」的组合，而不是全场动画

---

## 十、写在最后

cos-design v3.0 不是一次简单的「加组件」，而是一次**产品结构化**：

- 从数量上：15 → 49，覆盖六类场景
- 从组织上：分类体系 + 配置驱动 Playground
- 从工程上：Canvas/CSS 双阵营、共享工具、统一目录约定

它面向**活动页、品牌页、展示页、创意作品集**的视觉特效层，专注氛围与趣味表达。如果你需要一个「拿起来就能让页面好看、好玩」的 React 组件集，v3.0 是目前最完整的一个版本。

---

**相关链接**

- [完整介绍与实践指南](./cos-design-intro.md)
- [CHANGELOG](../CHANGELOG.md)
- [GitHub 仓库](https://github.com/jiaxiantao/cos-design)
- [npm 包](https://www.npmjs.com/package/cos-design)

**升级对话**

```bash
# 本地预览全部 49 个组件
git clone git@github.com:jiaxiantao/cos-design.git
cd cos-design && npm run setup
npx --yes pnpm@9 dev
# 访问 http://localhost:4000
```

欢迎 Issue / PR，一起把视觉特效组件库做得更完整。
