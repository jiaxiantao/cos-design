---
name: 框架适配
about: 为现有组件补一个框架入口，或报告 React / Vue / Web Components / Core 行为不一致
title: '[Adapter] '
labels: enhancement
assignees: ''
---

## 组件

<!-- 例如 Fireworks / @cos-design/fireworks -->

## 目标入口

- [ ] Vue 3（`@cos-design/<pkg>/vue`）
- [ ] Web Components（`@cos-design/<pkg>/element`，标签 `cos-*`）
- [ ] Core（`create*`）
- [ ] 其他（请说明运行时，并接受「不一定做」）

## 不一致之处

| 入口     | 实际行为 | 期望行为 |
| -------- | -------- | -------- |
| React    |          |          |
| 目标入口 |          |          |

## 最小复现

<!-- Vue SFC、或 Playground Element Tab 的「复制 HTML」片段、或 create* 调用 -->

```html

```

## 约束

- 包名保持 `@cos-design/<kebab>`，不要新开一套 npm 名
- Canvas / WebGL 仍然 client-only
- 事件在 Element 上应是 `CustomEvent`（如 `reveal` / `draw-end`），不要要求调用方传函数属性
