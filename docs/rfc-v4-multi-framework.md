# RFC: cos-design v4.0 — 多框架支持与 Web Components

| 字段         | 值                                                  |
| ------------ | --------------------------------------------------- |
| **状态**     | Approved — Phase 0 + Batch A/B/C 已完成（75/91 v4） |
| **版本**     | 4.0.0                                               |
| **作者**     | cos-design maintainers                              |
| **创建日期** | 2026-09-02                                          |
| **目标发布** | v4.0.0（一次性全量迁移）                            |

---

## 摘要

cos-design 将从 v3.x（仅 React）升级到 v4.0，在**不改变任何 npm 包名**的前提下，为全部 **91 个组件**同时提供：

1. **React** — 默认入口，与 v3 import 路径完全兼容
2. **Vue 3** — 同包名 subpath（`/vue`）
3. **Core 命令式 API** — 同包名 subpath（`/core`），供原生 JS 直接调用
4. **Web Components** — 同包名 subpath（`/element`），Custom Elements 注册

架构采用 **Core + Adapter** 分层：渲染与动画逻辑下沉到框架无关的 Core 层，React / Vue / Element 仅为薄包装。

---

## 动机

### 现状（v3.8）

- 91 个视觉特效组件，面向营销页、活动页、Canvas 背景等场景
- 仅支持 React >= 18
- 组件逻辑与 `useEffect` / `useRef` / React Hooks 强耦合
- 分包发布：`cos-design`（聚合）+ `@cos-design/<kebab-name>`（单组件）+ `@cos-design/shared`
- 构建：Vite 单入口 per package，`scripts/sync-packages.mjs` 自动生成包元数据

### 目标

| 目标         | 说明                                                        |
| ------------ | ----------------------------------------------------------- |
| 多框架       | Vue 3 与 React 并列支持，API 语义一致                       |
| 原生可用     | 无框架项目可通过 Core API 或 Web Components 使用            |
| 包名不变     | 沿用 `@cos-design/*` 与 `cos-design` 历史命名，降低迁移成本 |
| 一次性发布   | v4.0 全量 91 组件四端齐备，不做渐进式 partial release       |
| React 零改动 | 现有 React 用户的 import 路径与 Props 保持不变              |

### 非目标

- **不支持 Vue 2** — 如需兼容，用户应通过 Web Components 接入
- **不新增 npm 包名** — 如 `@cos-design/vue`、`@cos-design/core` 等独立包名不在范围内；Core 能力通过 subpath 暴露
- **不做通用 UI 组件** — 仍专注视觉特效，不扩展表格、表单等 admin UI
- **不改变组件功能语义** — v4 是架构升级，不是功能大改

---

## 已确认决策

以下决策已在 RFC 起草前确认，**不可变更**（除非 RFC 修订）：

| #   | 决策           | 结论                                                                          |
| --- | -------------- | ----------------------------------------------------------------------------- |
| D1  | npm 包命名     | **完全沿用 v3 包名**，不新增、不重命名                                        |
| D2  | Vue 包名       | Vue 用户使用**相同包名**，通过 subpath 区分（如 `@cos-design/fireworks/vue`） |
| D3  | Vue 覆盖范围   | v4.0 **全部 91 个组件**均有 Vue 版本                                          |
| D4  | Web Components | v4.0 **同期发布**，非后续版本                                                 |
| D5  | 迁移策略       | **4.0 一次性全迁**（Big Bang），不做 alpha 逐组件发布                         |
| D6  | React 兼容性   | 默认入口 `.` 仍为 React，现有代码无需修改 import                              |

---

## 架构概览

```
┌──────────────────────────────────────────────────────────────────┐
│                         Component Core                            │
│  createFireworks(container, options) → FireworksController       │
│  • Canvas / WebGL / Three.js 渲染循环                             │
│  • 事件绑定、resize、visibility pause、reduced motion             │
│  • 命令式 API：launch() / spin() / reset() / destroy()           │
│  • 零 React / Vue 依赖                                            │
└────────────┬─────────────────┬─────────────────┬───────────────────┘
             │                 │                 │
      subpath: .        subpath: /vue     subpath: /element
      (React 默认)                              subpath: /core
             │                 │                 │
     forwardRef 薄包装    defineComponent    customElements.define
     useEffect 挂载       onMounted 挂载      属性 ↔ options 映射
             │                 │                 │
        React 18/19         Vue 3.4+          任意框架 / 原生 HTML
```

### 设计原则

1. **Single Source of Truth** — Props / Options 类型定义在 Core 层，React / Vue / Element 共享
2. **Thin Adapters** — 框架层代码应 < 80 行 / 组件（不含模板），禁止在 Adapter 中写渲染逻辑
3. **Imperative First** — 命令式 API 是 Core 的一等公民；React `ref`、Vue `defineExpose`、Element 方法均转发至 Core
4. **Style Sharing** — 样式从 LESS Modules 迁移为 CSS 变量 + 共享 CSS 文件，四端复用

---

## 包结构与 exports

### 单组件包（以 `@cos-design/fireworks` 为例）

**包名不变**。`package.json` 的 `exports` 扩展为 4 个 subpath：

```json
{
  "name": "@cos-design/fireworks",
  "version": "4.0.0",
  "type": "module",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/react/index.d.ts",
        "default": "./dist/react/index.js"
      },
      "require": {
        "types": "./dist/react/index.d.ts",
        "default": "./dist/react/index.cjs"
      }
    },
    "./vue": {
      "import": {
        "types": "./dist/vue/index.d.ts",
        "default": "./dist/vue/index.js"
      }
    },
    "./core": {
      "import": {
        "types": "./dist/core/index.d.ts",
        "default": "./dist/core/index.js"
      }
    },
    "./element": {
      "import": {
        "types": "./dist/element/index.d.ts",
        "default": "./dist/element/index.js"
      }
    }
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0",
    "vue": ">=3.4.0"
  },
  "peerDependenciesMeta": {
    "react": { "optional": true },
    "react-dom": { "optional": true },
    "vue": { "optional": true }
  },
  "sideEffects": ["**/*.css", "./dist/element/index.js"]
}
```

> `./element` 标记为 `sideEffects`，确保 bundler 不会 tree-shake 掉 `customElements.define` 副作用。

### 聚合包 `cos-design`

| subpath               | 用途                             | 构建产物                 |
| --------------------- | -------------------------------- | ------------------------ |
| `cos-design`          | React 全量导出（默认，向后兼容） | `dist/react/index.js`    |
| `cos-design/vue`      | Vue 全量导出                     | `dist/vue/index.js`      |
| `cos-design/core`     | 全部 Core API                    | `dist/core/index.js`     |
| `cos-design/elements` | 注册全部 91 个 Custom Elements   | `dist/elements/index.js` |

### 共享包 `@cos-design/shared`

包名不变，拆分为两个 subpath：

| subpath                    | 内容                                                                | 消费者        |
| -------------------------- | ------------------------------------------------------------------- | ------------- |
| `@cos-design/shared`       | 纯 TS 工具：`clamp`、`bindVisibilityPause`、`observeElementSize` 等 | Core 层       |
| `@cos-design/shared/react` | React Hooks：`useElementSize`、`useCanvasBox` 等                    | React Adapter |

---

## 导入约定

### React（与 v3 完全一致）

```tsx
import { Fireworks } from '@cos-design/fireworks';
import { Fireworks, ScratchCard } from 'cos-design';
```

### Vue 3

```vue
<script setup lang="ts">
import { Fireworks } from '@cos-design/fireworks/vue';
// 或聚合导入
import { Fireworks, ScratchCard } from 'cos-design/vue';
</script>

<template>
  <Fireworks :width="800" :height="500" auto />
</template>
```

### Core 命令式 API（原生 JS / Node 渲染后挂载）

```typescript
import { createFireworks } from '@cos-design/fireworks/core';

const container = document.getElementById('fw')!;
const controller = createFireworks(container, {
  auto: true,
  fill: true,
  onComplete: () => console.log('done')
});

// 命令式调用
controller.launch(400);
controller.update({ auto: false });
controller.destroy();
```

### Web Components

```html
<script type="module">
  import '@cos-design/fireworks/element';
  // 或一次性注册全部
  import 'cos-design/elements';
</script>

<cos-fireworks auto interactive fill hint="点击燃放"></cos-fireworks>

<script type="module">
  const el = document.querySelector('cos-fireworks');
  el.launch(300);
  el.addEventListener('complete', () => console.log('done'));
</script>
```

---

## 源码目录结构

每个组件目录统一为以下结构（以 `fireworks` 为例）：

```
src/components/fireworks/
├── core/
│   ├── engine.ts          # 渲染循环、物理、事件
│   ├── types.ts           # FireworksOptions, FireworksController
│   └── index.ts           # export { createFireworks }
├── react/
│   └── index.tsx          # forwardRef 薄包装
├── vue/
│   └── Fireworks.vue      # <script setup> 薄包装
├── element/
│   └── index.ts           # customElements.define('cos-fireworks', ...)
├── style/
│   └── index.css          # CSS 变量 + 共享样式（替代 index.module.less）
└── index.tsx              # re-export react/（构建默认入口，保持现有路径引用）
```

### 文件职责

| 文件                | 职责                            | 最大行数指导                  |
| ------------------- | ------------------------------- | ----------------------------- |
| `core/engine.ts`    | 全部渲染与状态逻辑              | 不限（从现有 index.tsx 迁移） |
| `core/types.ts`     | Options、Controller、事件类型   | ~50                           |
| `react/index.tsx`   | 挂载/更新/销毁 Core，forwardRef | ~80                           |
| `vue/Fireworks.vue` | 同上，defineExpose              | ~80                           |
| `element/index.ts`  | 属性观察、CustomEvent 派发      | ~100                          |

---

## Core 层 API 规范

### 工厂函数签名

每个组件 Core 层导出一个 `create*` 工厂函数：

```typescript
// core/types.ts
export interface FireworksOptions {
  width?: number;
  height?: number;
  fill?: boolean;
  auto?: boolean;
  interactive?: boolean;
  hint?: string;
  onComplete?: () => void;
}

export interface FireworksController {
  /** 增量更新 options（不重建实例） */
  update(options: Partial<FireworksOptions>): void;
  /** 命令式 API */
  launch(x?: number): void;
  /** 卸载：取消 rAF、移除监听器、释放 GL 资源 */
  destroy(): void;
}

// core/index.ts
export function createFireworks(container: HTMLElement, options: FireworksOptions): FireworksController;
```

### 统一约定

| 约定             | 说明                                                                                |
| ---------------- | ----------------------------------------------------------------------------------- |
| 容器             | 工厂函数接收 `HTMLElement`，Core 自行创建内部 DOM（canvas、wrapper 等）             |
| 生命周期         | `create*` → `update*`（多次）→ `destroy`（一次）                                    |
| 尺寸             | `fill` 模式由 Core 内部 `ResizeObserver` 处理，不依赖框架 Hook                      |
| 回调             | 通过 options 传入（`onComplete`、`onSpinEnd` 等），`update` 时可替换                |
| Reduced motion   | Core 内部调用 `@cos-design/shared` 的 `prefersReducedMotion()`                      |
| Visibility pause | Core 内部调用 `bindVisibilityPause()`                                               |
| SSR              | Core 不执行 DOM 操作；Adapter 仅在 `typeof window !== 'undefined'` 时调用 `create*` |

### 含 ref / 命令式 API 的组件

以下组件除 `update` / `destroy` 外，Controller 还暴露命令式方法：

| 组件        | Controller 方法                     |
| ----------- | ----------------------------------- |
| Fireworks   | `launch(x?)`                        |
| Confetti    | `fire()`, `reset()`                 |
| Turntable   | `spin(targetIndex?)`, `reset()`     |
| SlotMachine | `spin(targetIndex?)`, `reset()`     |
| NineGrid    | `draw(targetIndex?)`, `reset()`     |
| ScratchCard | `reveal()`                          |
| FlipCard    | `flip()`                            |
| Countdown   | `start()`, `pause()`, `reset()`     |
| …           | 迁移时从现有 `*Handle` 接口完整映射 |

React `ref`、Vue `defineExpose`、Element 公共方法均转发到同一 Controller。

---

## React Adapter 规范

```tsx
// react/index.tsx
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createFireworks, type FireworksController, type FireworksOptions } from '../core';
import '../style/index.css';

export type FireworksProps = FireworksOptions;
export type FireworksHandle = Pick<FireworksController, 'launch'>;

const Fireworks = forwardRef<FireworksHandle, FireworksProps>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<FireworksController | null>(null);

  useImperativeHandle(ref, () => ({
    launch: (x) => ctrlRef.current?.launch(x)
  }));

  useEffect(() => {
    if (!hostRef.current) return;
    const ctrl = createFireworks(hostRef.current, props);
    ctrlRef.current = ctrl;
    return () => ctrl.destroy();
  }, []); // 仅挂载/卸载

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]); // props 变化时增量更新

  return <div ref={hostRef} className="cos-fireworks" />;
});

export default Fireworks;
```

### React 兼容性承诺

- `FireworksProps` 类型名保持不变
- `FireworksHandle` 类型名保持不变
- 默认导出 + 命名导出保持不变
- `displayName` 保持不变
- 行为语义与 v3 一致（包括 `aria-busy`、`prefers-reduced-motion` 等）

---

## Vue Adapter 规范

```vue
<!-- vue/Fireworks.vue -->
<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createFireworks, type FireworksController, type FireworksOptions } from '../core';
import '../style/index.css';

const props = defineProps<FireworksOptions>();
const hostRef = ref<HTMLElement>();
let ctrl: FireworksController | null = null;

onMounted(() => {
  if (hostRef.value) {
    ctrl = createFireworks(hostRef.value, props);
  }
});

watch(
  () => ({ ...props }),
  (next) => ctrl?.update(next),
  { deep: true }
);

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({
  launch: (x?: number) => ctrl?.launch(x)
});
</script>

<template>
  <div ref="hostRef" class="cos-fireworks" />
</template>
```

### Vue 约定

| 项         | 约定                                                  |
| ---------- | ----------------------------------------------------- |
| 组件文件名 | PascalCase，与 export name 一致（`Fireworks.vue`）    |
| Props      | 直接使用 Core `*Options` 类型                         |
| 事件       | `onComplete` → `emit('complete')`；模板用 `@complete` |
| expose     | 与 React `*Handle` 方法集一致                         |
| 包入口     | `vue/index.ts` re-export 组件                         |

### Vue 事件映射

| Core callback   | Vue emit        | Element CustomEvent |
| --------------- | --------------- | ------------------- |
| `onComplete`    | `@complete`     | `complete`          |
| `onSpinEnd`     | `@spin-end`     | `spin-end`          |
| `onReveal`      | `@reveal`       | `reveal`            |
| `onIndexChange` | `@index-change` | `index-change`      |

---

## Web Components 规范

### 标签命名

格式：`cos-{kebab-case}`

| 目录名              | 标签名                     |
| ------------------- | -------------------------- |
| `fireworks`         | `<cos-fireworks>`          |
| `weatherBackground` | `<cos-weather-background>` |
| `scratchCard`       | `<cos-scratch-card>`       |
| `nineGrid`          | `<cos-nine-grid>`          |
| `photoViewMaster`   | `<cos-photo-view-master>`  |

完整 91 个组件映射见 [附录 B](#附录-b-web-component-标签名全表)。

### 属性与事件

```typescript
// element/index.ts
class CosFireworks extends HTMLElement {
  private ctrl: FireworksController | null = null;

  static get observedAttributes() {
    return ['auto', 'interactive', 'fill', 'width', 'height', 'hint'];
  }

  connectedCallback() {
    this.ctrl = createFireworks(this, this.parseOptions());
  }

  disconnectedCallback() {
    this.ctrl?.destroy();
  }

  attributeChangedCallback() {
    this.ctrl?.update(this.parseOptions());
  }

  launch(x?: number) {
    this.ctrl?.launch(x);
  }

  private parseOptions(): FireworksOptions {
    return {
      auto: this.hasAttribute('auto'),
      interactive: this.hasAttribute('interactive'),
      fill: this.hasAttribute('fill'),
      width: this.hasAttribute('width') ? Number(this.getAttribute('width')) : undefined,
      height: this.hasAttribute('height') ? Number(this.getAttribute('height')) : undefined,
      hint: this.getAttribute('hint') ?? undefined,
      onComplete: () => this.dispatchEvent(new CustomEvent('complete', { bubbles: true }))
    };
  }
}

if (!customElements.get('cos-fireworks')) {
  customElements.define('cos-fireworks', CosFireworks);
}
```

### Element 设计决策

| 项         | 决策                                    | 理由                                      |
| ---------- | --------------------------------------- | ----------------------------------------- |
| Shadow DOM | **不使用**（Light DOM）                 | 避免样式隔离问题；与现有 CSS 变量方案兼容 |
| 属性类型   | 字符串 attribute + 运行时解析           | Custom Elements 标准约束                  |
| 复杂 props | 支持 JSON property：`el.prizes = [...]` | 数组/对象无法通过 attribute 传递          |
| 注册方式   | 副作用导入即注册                        | `import '@cos-design/fireworks/element'`  |
| 重复注册   | `customElements.get()` 守卫             | 防止 HMR / 重复导入报错                   |

---

## 样式迁移

### 从 LESS Modules 到共享 CSS

v3 使用 `index.module.less` + `generateScopedName: 'cos-[local]-[hash:base64:5]'`。

v4 迁移策略：

1. LESS 变量 → CSS 自定义属性（`--cos-fireworks-bg` 等）
2. 类名改为固定前缀（`.cos-fireworks__canvas`），不再 hash
3. 单文件 `style/index.css`，Core 层注入 DOM 时挂载 class
4. React / Vue / Element 均 `import '../style/index.css'`

```css
/* style/index.css */
.cos-fireworks {
  position: relative;
  overflow: hidden;
}
.cos-fireworks__canvas {
  display: block;
  width: 100%;
  height: 100%;
}
.cos-fireworks__hint {
  position: absolute;
  bottom: 8px;
  color: var(--cos-hint-color, rgb(255 255 255 / 60%));
}
```

### 迁移期间

- 构建仍支持 LESS（Playground 站点），但组件库产物仅 ship CSS
- `sideEffects` 保留 `**/*.css` 以确保注入

---

## 构建链改造

### 现状

- `scripts/vite.component.config.mjs` — 单入口，仅 React
- `scripts/build-packages.mjs` — 并发构建各 package
- `scripts/sync-packages.mjs` — 从 `src/components` 生成 package.json 与入口

### v4 改造

#### 1. 多入口 Vite 配置

每个组件 package 构建 4 个入口：

```
packages/fireworks/dist/
├── react/
│   ├── index.js
│   ├── index.cjs
│   └── index.d.ts
├── vue/
│   ├── index.js
│   └── index.d.ts
├── core/
│   ├── index.js
│   └── index.d.ts
└── element/
    ├── index.js
    └── index.d.ts
```

环境变量扩展：

```
COS_PACKAGE=fireworks
COS_ENTRY=react|vue|core|element
```

#### 2. 新增依赖

| 依赖                                 | 用途                        |
| ------------------------------------ | --------------------------- |
| `@vitejs/plugin-vue`                 | Vue SFC 编译                |
| `vue` (devDep)                       | Vue 类型与编译              |
| `@custom-elements-manifest/analyzer` | 可选，生成 Element API 文档 |

#### 3. sync-packages.mjs 扩展

自动生成：

- 4 个入口文件（`src/react.ts`、`src/vue.ts`、`src/core.ts`、`src/element.ts`）
- 扩展后的 `exports` 字段
- `peerDependencies` + `peerDependenciesMeta`

#### 4. 新增脚本

| 脚本                            | 用途                                                |
| ------------------------------- | --------------------------------------------------- |
| `pnpm migrate:component <name>` | 脚手架：从现有 index.tsx 生成 core/ + adapters 骨架 |
| `pnpm verify:v4-matrix`         | 校验 91 组件 × 4 入口产物完整性                     |
| `pnpm test:smoke:vue`           | Playwright 针对 Vue demo 页                         |

---

## `@cos-design/shared` 拆分方案

### 迁移映射

| 现有导出                                                 | v4 位置                    |
| -------------------------------------------------------- | -------------------------- |
| `clamp`, `lerp`                                          | `@cos-design/shared`       |
| `bindVisibilityPause`                                    | `@cos-design/shared`       |
| `prefersReducedMotion`, `bindPrefersReducedMotion`       | `@cos-design/shared`       |
| `observeElementSize`                                     | `@cos-design/shared`       |
| `getRelativePointerPosition`                             | `@cos-design/shared`       |
| `PhotoItem` 等类型                                       | `@cos-design/shared`       |
| `useElementSize`, `useCanvasBox`, `resolveCanvasBoxSize` | `@cos-design/shared/react` |

### Core 层替代

`useElementSize` 的功能在 Core 层由 `observeElementSize`（纯函数）直接调用，不再依赖 React Hook：

```typescript
// core/engine.ts 内部
import { observeElementSize } from '@cos-design/shared';

function mount(container: HTMLElement, options: FireworksOptions) {
  if (options.fill) {
    return observeElementSize(container, ({ width, height }) => {
      this.resize(width, height);
    });
  }
}
```

---

## 特殊组件处理

### A 类 — 纯 CSS / DOM（~25 个）

`neonText`, `glitchText`, `typewriter`, `blurText`, …

- Core 层创建 DOM 结构 + 挂载 CSS class
- 无 canvas / rAF 循环
- 迁移成本最低，用于验证流水线

### B 类 — Canvas 2D（~35 个）

`fireworks`, `matrixRain`, `confetti`, `snowfall`, …

- 从现有 `useEffect` 中提取 canvas 循环至 Core
- 占组件大多数，是迁移主战场

### C 类 — WebGL / Three.js（~15 个）

`lavaBubble`, `photoLantern`, `rippleWater`, `soapBubbles`, …

- Core 封装 WebGL context / Three.js scene 生命周期
- `destroy()` 必须 dispose geometry / material / renderer
- 保持 `three` 为 optional peerDependency

### D 类 — 复合 DOM + 状态机（~16 个）

`turntable`, `scratchCard`, `nineGrid`, `slotMachine`, …

- Core 包含状态机 + canvas/dom 混合渲染
- 命令式 API + `aria-busy` 在 Core 或 React Adapter 层设置
- 重点测试：防重复点击、服务端 `targetIndex`、`reset()` 语义

### 特殊导出（`EXTRA_EXPORTS`）

`weatherBackground` 等组件有大量具名导出（`useLiveWeather`、`mapWmoCodeToWeatherType` 等）。

| 导出类型                        | v4 处理                                                       |
| ------------------------------- | ------------------------------------------------------------- |
| 纯函数 / 类型                   | 保留在默认 React 入口 + 同步至 `/core`                        |
| React Hooks（`useLiveWeather`） | 保留在 React 入口；Core 提供非 Hook 等价函数供 Vue / 原生使用 |
| Vue composable                  | 新增 `weatherBackground/vue` 导出 `useLiveWeather` composable |

---

## 测试策略

### 单元测试

- Core engine 纯函数 / 状态机 → Vitest
- 属性解析（Element attribute → Options）→ Vitest

### Smoke 测试（Playwright，延续现有 `pnpm test:smoke`）

每个组件至少 3 条：

| 端      | 验证点                            |
| ------- | --------------------------------- |
| React   | 渲染、交互、ref 方法              |
| Vue     | 渲染、交互、expose 方法           |
| Element | 注册、属性、CustomEvent、公共方法 |

### 视觉回归（可选，Phase 3）

- 关键 Canvas 组件截图对比（Fireworks, WeatherBackground, Turntable）

### CI 矩阵

```yaml
jobs:
  build:
    - pnpm build
    - pnpm verify:v4-matrix # 91 × 4 产物完整性
  smoke-react:
    - pnpm test:smoke
  smoke-vue:
    - pnpm test:smoke:vue
  smoke-element:
    - pnpm test:smoke:element
  lint:
    - pnpm lint
```

---

## 文档更新清单

| 文档                                 | 更新内容                                   |
| ------------------------------------ | ------------------------------------------ |
| `README.md`                          | 增加 Vue / Element / Core 快速开始         |
| `QUICKSTART.md`                      | 三端安装与导入示例                         |
| `docs/ai.md`                         | AI agent 规则：Vue / Element 导入路径      |
| `llms.txt` / `llms-full.txt`         | 每个组件 4 种导入方式                      |
| `docs/ai-discovery.md`               | Skill 更新                                 |
| `docs/migration-v4.md`               | **新建** — 从 v3 升级到 v4 指南            |
| `AGENTS.md`                          | 多框架约束                                 |
| `.agents/skills/cos-design/SKILL.md` | Vue / Element 场景                         |
| Playground                           | 每组件页增加 Vue / Element / Core 三个 Tab |
| `examples/next-app`                  | 保持 React 示例不变                        |
| `examples/vue-app`                   | **新建** — Vue 3 示例项目                  |
| `examples/vanilla`                   | **新建** — Core + Element 原生示例         |

---

## Breaking Changes

v4.0 为 major release，但 **React 默认入口用户几乎无感知**。

| 变更                                            | 影响面                         | 迁移动作                        |
| ----------------------------------------------- | ------------------------------ | ------------------------------- |
| 主版本 3.x → 4.0                                | 全部                           | 常规 semver 升级                |
| `@cos-design/shared` 默认入口不再含 React Hooks | 直接依赖 shared Hooks 的用户   | 改为 `@cos-design/shared/react` |
| 组件内部 CSS 类名从 hash 变为固定前缀           | 极少数直接覆盖 hash 类名的用户 | 改用 CSS 变量或公开 class       |
| peerDependencies 新增 `vue`（optional）         | 无（optional）                 | 无需动作                        |
| 构建产物目录结构变化                            | 直接引用 dist 内部路径的用户   | 仅使用 exports 公开路径         |

**不受影响的用户：**

```tsx
import { Fireworks } from 'cos-design';
import { Fireworks } from '@cos-design/fireworks';
// Props、ref、行为均不变
```

---

## 迁移执行计划

### Phase 0 — 基础设施（阻塞项）

| #   | 任务                       | 产出               |
| --- | -------------------------- | ------------------ |
| 0.1 | `@cos-design/shared` 拆分  | `/react` subpath   |
| 0.2 | 多入口 Vite 配置           | 4-entry build 模板 |
| 0.3 | `sync-packages.mjs` 升级   | 自动生成 exports   |
| 0.4 | `migrate:component` CLI    | 骨架生成器         |
| 0.5 | `verify:v4-matrix`         | 产物完整性校验     |
| 0.6 | Playground 多框架 Tab 框架 | UI 壳              |

**预估：3–4 周**

### Phase 1 — POC 验证

| #   | 组件        | 验证点                                     |
| --- | ----------- | ------------------------------------------ |
| 1.1 | `fireworks` | Canvas + fill + launch + Element           |
| 1.2 | `turntable` | 状态机 + spin/reset + aria-busy + 三端 ref |

POC 通过标准：4 入口构建成功 + 3 端 smoke 通过 + Playground Tab 可用。

**预估：1–2 周**

### Phase 2 — 全量迁移（89 组件）

按类别批量并行，使用 `migrate:component` CLI + 人工 review：

| 批次 | 类别        | 数量 | 组件                                          |
| ---- | ----------- | ---- | --------------------------------------------- |
| A    | 纯 CSS 文本 | 25   | neonText, glitchText, typewriter, blurText, … |
| B    | Canvas 2D   | 35   | matrixRain, confetti, snowfall, cyberGrid, …  |
| C    | WebGL/Three | 15   | lavaBubble, photoLantern, rippleWater, …      |
| D    | 交互/抽奖   | 16   | scratchCard, nineGrid, slotMachine, …         |

每组件 DoD（Definition of Done）：

- [ ] `core/engine.ts` 通过单元测试
- [ ] `react/` Props / Handle 与 v3 一致
- [ ] `vue/` Props / expose 与 React 语义一致
- [ ] `element/` 标签注册 + 属性/事件/方法
- [ ] Playground 三 Tab 可运行
- [ ] Smoke 测试 3 端通过

**预估：10–14 周**

### Phase 3 — 文档、示例、发布

| #   | 任务                                           |
| --- | ---------------------------------------------- |
| 3.1 | 全部 AI 文档更新（llms.txt、Context7、Skills） |
| 3.2 | `examples/vue-app` + `examples/vanilla`        |
| 3.3 | `docs/migration-v4.md`                         |
| 3.4 | CHANGELOG v4.0.0                               |
| 3.5 | 全量 CI 绿                                     |
| 3.6 | npm 发布 4.0.0（全部包版本对齐）               |

**预估：3–4 周**

### 总工期估算

**约 17–24 周（4–6 个月）**，取决于 WebGL 组件与 WeatherBackground 特殊导出的复杂度。

---

## 风险与缓解

| 风险                                            | 严重度 | 缓解措施                                                   |
| ----------------------------------------------- | ------ | ---------------------------------------------------------- |
| 91 组件 × 4 端 = 364 产物，构建耗时激增         | 中     | 并发构建 + 增量 build + 缓存                               |
| WebGL 组件 Core 提取遗漏 dispose                | 高     | C 类组件单独 review 清单 + 内存 leak smoke                 |
| Vue SFC 与 React 行为不一致                     | 中     | 共享 Core 单测 + 三端 smoke 对齐                           |
| Element 复杂 props（数组/对象）不可用 attribute | 中     | 文档明确 JSON property 用法；提供 `setPrizes()` 方法       |
| WeatherBackground 大量 Hook/函数导出            | 高     | 单独子项目：Core 纯函数 + React Hook + Vue composable 三份 |
| Big Bang 发布回归面大                           | 高     | POC 充分验证 + 全量 smoke + RC 内部试用一周                |
| 样式迁移破坏现有视觉                            | 中     | 视觉回归截图（关键 10 组件）                               |

---

## 开放问题

以下问题需在 RFC 批准前确认：

| #   | 问题                                                       | 建议                                                       | 决定 |
| --- | ---------------------------------------------------------- | ---------------------------------------------------------- | ---- |
| Q1  | Vue Playground 用 Vue SFC 还是 `@vue/live`？               | Vite 原生 SFC，与构建链一致                                | ☐    |
| Q2  | `cos-design/elements` 一次性注册 91 个标签是否过大？       | 提供 per-component `/element` 为主，`/elements` 为便利入口 | ☐    |
| Q3  | WeatherBackground 的 `useLiveWeather` Vue 版命名？         | `useLiveWeather` composable，从 `/vue` 额外导出            | ☐    |
| Q4  | v4 发布前是否发 RC（`4.0.0-rc.N`）？                       | 建议发 2–3 个 RC，Big Bang 风险高                          | ☐    |
| Q5  | 是否在 v4 同时支持 React 19 的 Activity / Suspense 边界？  | 不专门适配，保持现有 client-only 模式                      | ☐    |
| Q6  | Element 是否需要在 Playground 提供「复制 HTML 片段」功能？ | 建议有，降低原生用户门槛                                   | ☐    |

---

## 附录 A — 组件迁移分级

### A 类：纯 CSS / DOM（25）

`blurText`, `burnAway`, `charge`, `circularText`, `curvedLoop`, `fuzzyText`, `glitchText`, `gradientFlow`, `holographicCard`, `liquidGlass`, `magneticButton`, `neonText`, `rotatingText`, `scrambleText`, `shinyText`, `splitReveal`, `splitText`, `spotlight`, `textMorph`, `timelinePulse`, `trueFocus`, `typewriter`, `waveButton`, `waveText`, `barcodeScan`

### B 类：Canvas 2D（35）

`audioVisualizer`, `aurora`, `auroraVeil`, `bubbleField`, `canvasClock`, `clickSpark`, `confetti`, `cursorTrail`, `cyberGrid`, `dandelionField`, `diceRoll`, `electricArc`, `fireworks`, `flipCounter`, `gameOfLife`, `gravityBalls`, `inkBloom`, `matrixRain`, `mazeGenerator`, `meteorRain`, `networkGraph`, `particleNetwork`, `radarScan`, `redPacketRain`, `returnCity`, `ropeChain`, `sandFall`, `smokeFog`, `snowfall`, `starfield`, `progressChest`, `countUp`, `countdown`, `flipCard`, `speedometer`

### C 类：WebGL / Three.js（15）

`lavaBubble`, `liquidProgress`, `metaballPool`, `photoLantern`, `photoPrism`, `photoTunnel`, `plasmaBall`, `rippleWater`, `soapBubbles`, `solarSystem`, `dnaHelix`, `orbitalChart`, `photoClothesline`, `photoViewMaster`, `weatherBackground`

> 注：部分 C 类组件以 Canvas 2D 为主但含复杂子系统（如 `weatherBackground`），实际迁移工时按 C 类计。

### D 类：复合 DOM + 状态机（16）

`turntable`, `slotMachine`, `nineGrid`, `scratchCard`, `photoAlbum`, `photoCarousel`, `photoFilmstrip`, `photoFridge`, `photoLightbox`, `photoPolaroid`, `photoPostcard`, `photoScroll`, `newtonCradle`, `doublePendulum`, `springMass`, `lorenzAttractor`

> 注：部分 physics/science 组件（`newtonCradle` 等）归入 D 类因含交互状态；部分 photo 组件归入 D 类因含复杂 DOM 结构。

---

## 附录 B — Web Component 标签名全表

| 目录名          | 标签名                   | 目录名            | 标签名                     |
| --------------- | ------------------------ | ----------------- | -------------------------- |
| audioVisualizer | `<cos-audio-visualizer>` | magneticButton    | `<cos-magnetic-button>`    |
| aurora          | `<cos-aurora>`           | matrixRain        | `<cos-matrix-rain>`        |
| auroraVeil      | `<cos-aurora-veil>`      | mazeGenerator     | `<cos-maze-generator>`     |
| barcodeScan     | `<cos-barcode-scan>`     | metaballPool      | `<cos-metaball-pool>`      |
| blurText        | `<cos-blur-text>`        | meteorRain        | `<cos-meteor-rain>`        |
| bubbleField     | `<cos-bubble-field>`     | neonText          | `<cos-neon-text>`          |
| burnAway        | `<cos-burn-away>`        | networkGraph      | `<cos-network-graph>`      |
| canvasClock     | `<cos-canvas-clock>`     | newtonCradle      | `<cos-newton-cradle>`      |
| charge          | `<cos-charge>`           | nineGrid          | `<cos-nine-grid>`          |
| circularText    | `<cos-circular-text>`    | orbitalChart      | `<cos-orbital-chart>`      |
| clickSpark      | `<cos-click-spark>`      | particleNetwork   | `<cos-particle-network>`   |
| confetti        | `<cos-confetti>`         | photoAlbum        | `<cos-photo-album>`        |
| countUp         | `<cos-count-up>`         | photoCarousel     | `<cos-photo-carousel>`     |
| countdown       | `<cos-countdown>`        | photoClothesline  | `<cos-photo-clothesline>`  |
| cursorTrail     | `<cos-cursor-trail>`     | photoFilmstrip    | `<cos-photo-filmstrip>`    |
| curvedLoop      | `<cos-curved-loop>`      | photoFridge       | `<cos-photo-fridge>`       |
| cyberGrid       | `<cos-cyber-grid>`       | photoLantern      | `<cos-photo-lantern>`      |
| dandelionField  | `<cos-dandelion-field>`  | photoLightbox     | `<cos-photo-lightbox>`     |
| diceRoll        | `<cos-dice-roll>`        | photoPolaroid     | `<cos-photo-polaroid>`     |
| dnaHelix        | `<cos-dna-helix>`        | photoPostcard     | `<cos-photo-postcard>`     |
| doublePendulum  | `<cos-double-pendulum>`  | photoPrism        | `<cos-photo-prism>`        |
| electricArc     | `<cos-electric-arc>`     | photoScroll       | `<cos-photo-scroll>`       |
| fireworks       | `<cos-fireworks>`        | photoTunnel       | `<cos-photo-tunnel>`       |
| flipCard        | `<cos-flip-card>`        | photoViewMaster   | `<cos-photo-view-master>`  |
| flipCounter     | `<cos-flip-counter>`     | plasmaBall        | `<cos-plasma-ball>`        |
| fuzzyText       | `<cos-fuzzy-text>`       | progressChest     | `<cos-progress-chest>`     |
| gameOfLife      | `<cos-game-of-life>`     | radarScan         | `<cos-radar-scan>`         |
| glitchText      | `<cos-glitch-text>`      | redPacketRain     | `<cos-red-packet-rain>`    |
| gradientFlow    | `<cos-gradient-flow>`    | returnCity        | `<cos-return-city>`        |
| gravityBalls    | `<cos-gravity-balls>`    | rippleWater       | `<cos-ripple-water>`       |
| holographicCard | `<cos-holographic-card>` | ropeChain         | `<cos-rope-chain>`         |
| inkBloom        | `<cos-ink-bloom>`        | rotatingText      | `<cos-rotating-text>`      |
| lavaBubble      | `<cos-lava-bubble>`      | sandFall          | `<cos-sand-fall>`          |
| liquidGlass     | `<cos-liquid-glass>`     | scrambleText      | `<cos-scramble-text>`      |
| liquidProgress  | `<cos-liquid-progress>`  | scratchCard       | `<cos-scratch-card>`       |
| lorenzAttractor | `<cos-lorenz-attractor>` | shinyText         | `<cos-shiny-text>`         |
|                 |                          | slotMachine       | `<cos-slot-machine>`       |
|                 |                          | smokeFog          | `<cos-smoke-fog>`          |
|                 |                          | snowfall          | `<cos-snowfall>`           |
|                 |                          | soapBubbles       | `<cos-soap-bubbles>`       |
|                 |                          | solarSystem       | `<cos-solar-system>`       |
|                 |                          | speedometer       | `<cos-speedometer>`        |
|                 |                          | splitReveal       | `<cos-split-reveal>`       |
|                 |                          | splitText         | `<cos-split-text>`         |
|                 |                          | spotlight         | `<cos-spotlight>`          |
|                 |                          | springMass        | `<cos-spring-mass>`        |
|                 |                          | starfield         | `<cos-starfield>`          |
|                 |                          | textMorph         | `<cos-text-morph>`         |
|                 |                          | timelinePulse     | `<cos-timeline-pulse>`     |
|                 |                          | trueFocus         | `<cos-true-focus>`         |
|                 |                          | turntable         | `<cos-turntable>`          |
|                 |                          | typewriter        | `<cos-typewriter>`         |
|                 |                          | waveButton        | `<cos-wave-button>`        |
|                 |                          | waveText          | `<cos-wave-text>`          |
|                 |                          | weatherBackground | `<cos-weather-background>` |

---

## 附录 C — 批准清单

RFC 批准需确认以下各项：

- [ ] **D1–D6 已确认决策**无异议
- [ ] **Core + Adapter 架构**认可
- [ ] **subpath exports 方案**（`.` / `/vue` / `/core` / `/element`）认可
- [ ] **样式迁移方案**（LESS Modules → CSS 变量）认可
- [ ] **Breaking Changes** 可接受
- [ ] **开放问题 Q1–Q6** 已逐条决定
- [ ] **工期估算（4–6 个月）** 可接受
- [ ] 批准开始 Phase 0 实施

---

**请在确认 RFC 后回复，我们将从 Phase 0 基础设施开始实施。**
