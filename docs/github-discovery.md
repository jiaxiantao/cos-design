# GitHub 仓库叙事（多框架）

npm 上的 `description` 已是多框架文案。GitHub 仓库 About 仍可能停留在「91 个 React 视觉特效组件库」，且 topics 为空。本文件是仓库内的权威文案；维护者用下面的步骤写回 GitHub。

## About 描述（≤350 字符）

```text
91 个多框架视觉特效组件（React / Vue 3 / Web Components / Core）：活动页、抽奖、烟花、刮刮乐、Canvas 背景、霓虹标题。TypeScript · 按需分包 @cos-design/* · AI 发现（llms.txt / Context7）
```

## Topics

```text
react
vue
vue3
web-components
custom-elements
canvas
animation
visual-effects
typescript
fireworks
confetti
component-library
marketing
landing-page
```

## 维护者点击（About / Topics）

1. 打开 https://github.com/jiaxiantao/cos-design
2. 右侧 About 旁的齿轮 **Settings**（或仓库 **Settings** 不可见时，用 About 的铅笔图标）
3. 把 **Description** 换成上一节全文
4. **Topics** 填上表中每一项（全小写、连字符），保存

等价 API（需要对仓库的 admin 权限）：

```bash
gh api -X PATCH repos/jiaxiantao/cos-design \
  -f description='91 个多框架视觉特效组件（React / Vue 3 / Web Components / Core）：活动页、抽奖、烟花、刮刮乐、Canvas 背景、霓虹标题。TypeScript · 按需分包 @cos-design/* · AI 发现（llms.txt / Context7）'

gh api -X PUT repos/jiaxiantao/cos-design/topics \
  -H "Accept: application/vnd.github+json" \
  -f 'names[]=react' \
  -f 'names[]=vue' \
  -f 'names[]=vue3' \
  -f 'names[]=web-components' \
  -f 'names[]=custom-elements' \
  -f 'names[]=canvas' \
  -f 'names[]=animation' \
  -f 'names[]=visual-effects' \
  -f 'names[]=typescript' \
  -f 'names[]=fireworks' \
  -f 'names[]=confetti' \
  -f 'names[]=component-library' \
  -f 'names[]=marketing' \
  -f 'names[]=landing-page'
```

## Discussions

仓库默认 **未开启** Discussions（`has_discussions: false`）。Issue 模板里的「用法讨论」链接在开启前会 404。

维护者点击：

1. https://github.com/jiaxiantao/cos-design/settings
2. **General** → **Features**
3. 勾选 **Discussions**
4. 保存后打开 https://github.com/jiaxiantao/cos-design/discussions 确认分类存在（Announcements / General / Ideas / Q&A 用 GitHub 默认即可）

等价 API：

```bash
gh api -X PATCH repos/jiaxiantao/cos-design -F has_discussions=true
```

2026-11 用仓库集成 token 调用上述 API 返回 **403 Resource not accessible by integration**（描述、topics、Discussions 都写不进去）。这一步只能由仓库所有者在网页上完成。Issue 模板不依赖 Discussions 也能提交 Bug / 新特效 / 框架适配。
