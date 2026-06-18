# cos-design

[![CI](https://github.com/jiaxiantao/cos-design/actions/workflows/ci.yml/badge.svg)](https://github.com/jiaxiantao/cos-design/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/cos-design.svg)](https://www.npmjs.com/package/cos-design)
[![license](https://img.shields.io/npm/l/cos-design.svg)](https://github.com/jiaxiantao/cos-design/blob/main/LICENSE)

基于 React 19 + Vite 8 + TypeScript 5 的 React 组件库。

## 特性

- 开箱即用的 React 组件
- ESM / CJS 双格式输出，完整 TypeScript 类型支持
- 样式自动注入，无需手动引入 CSS
- 使用 pnpm + Vite 的现代工程化方案

## 安装

```bash
pnpm add cos-design
# or
npm install cos-design
# or
yarn add cos-design
```

## 使用

```tsx
import { CanvasClock, Charge, ReturnCity, Turntable } from 'cos-design';

function App() {
  return <CanvasClock width={400} height={400} />;
}
```

## 组件

| 组件              | 说明                 |
| ----------------- | -------------------- |
| `CanvasClock`     | Canvas 画布时钟      |
| `Charge`          | 充电特效             |
| `ReturnCity`      | 回城特效             |
| `Turntable`       | 抽奖转盘             |
| `Fireworks`       | 烟花特效（点击燃放） |
| `MatrixRain`      | 黑客帝国数字雨       |
| `ParticleNetwork` | 粒子连线网络         |
| `Typewriter`      | 打字机文字效果       |
| `NeonText`        | 霓虹灯发光文字       |
| `WaveButton`      | 波纹扩散按钮         |

## 本地开发

> **要求 Node.js >= 20**（项目含 `.nvmrc`，推荐使用 Node 22）

### 第一步：切换 Node 版本

```bash
nvm use
# 若未安装 Node 20
nvm install 20 && nvm use 20
```

### 第二步：安装依赖

**不要直接运行 `pnpm install`**（若本机 corepack 有问题会报错），请使用：

```bash
npm run setup
```

该命令会通过 `npx` 直接调用 pnpm，绕过 corepack。

### 第三步：启动开发

```bash
npx --yes pnpm@9 dev
```

访问 `http://localhost:4000` 进入首页，点击卡片跳转到对应组件演示（共 10 个组件）。

## 脚本

| 命令                     | 说明                            |
| ------------------------ | ------------------------------- |
| `npm run setup`          | 安装依赖（推荐，绕过 corepack） |
| `npx --yes pnpm@9 dev`   | 启动本地演示                    |
| `npx --yes pnpm@9 build` | 构建组件库                      |
| `npx --yes pnpm@9 lint`  | 代码检查                        |
| `npx --yes pnpm@9 pub`   | 构建并发布到 npm                |

## 修复本机 pnpm（可选）

若希望直接使用 `pnpm` 命令，在 **Node 20+** 环境下执行：

```bash
nvm use 20
corepack disable
hash -r
npm install -g pnpm@9
which pnpm        # 确认路径不在 corepack 下
pnpm -v
```

## 自动发布（CI/CD）

推送到 `master` 分支后，GitHub Actions 会自动执行 lint、构建，并将**新版本**发布到 [npm](https://www.npmjs.com/package/cos-design)。

### 首次配置（仅需一次）

1. 打开 [npm Access Tokens](https://www.npmjs.com/settings/jiaxiantao/tokens)
2. 创建 **Granular Access Token**：
   - Permissions: Packages → **Read and write**
   - 勾选 **Bypass 2FA for publish**（自动化发布必须）
3. 打开 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**
4. 新建 Secret：`NPM_TOKEN`，值为上一步的 token

### 发布新版本

```bash
# 1. 更新 package.json 中的 version（如 2.2.0）
# 2. 更新 CHANGELOG.md
# 3. 提交并推送
git add .
git commit -m "chore: release v2.2.0"
git push origin master

# 4.（可选）打 tag
git tag v2.2.0 && git push origin v2.2.0
```

推送后可在 [Actions](https://github.com/jiaxiantao/cos-design/actions) 查看发布进度。若 npm 上已存在相同版本号，会自动跳过发布。

## 参与贡献

欢迎提交 Issue 与 Pull Request，请参阅 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 更新日志

详见 [CHANGELOG.md](./CHANGELOG.md)。

## License

[MIT](./LICENSE) © jiaxiantao
