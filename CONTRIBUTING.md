# 贡献指南

感谢你对 cos-design 的关注！欢迎通过 Issue 或 Pull Request 参与贡献。

## 开发环境

- **Node.js >= 20**（见 `.nvmrc`）
- pnpm >= 9

## 快速开始

```bash
# 1. 切换 Node 版本（必须 >= 20）
nvm use

# 2. 安装依赖（不要用 pnpm install，用 setup 脚本）
npm run setup

# 3. 启动开发
npx --yes pnpm@9 dev
```

## 仓库结构

本仓库是 pnpm monorepo：

| 路径                  | 说明                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| `src/components/*`    | 组件源码（Playground 与构建入口）                                                              |
| `packages/shared`     | `@cos-design/shared` 公共工具                                                                  |
| `packages/<name>`     | `@cos-design/<kebab-name>` 组件包（如 `weatherBackground` → `@cos-design/weather-background`） |
| `packages/cos-design` | 聚合包 `cos-design`（一次安装全部）                                                            |

新增组件后运行 `pnpm sync:packages` 生成对应子包元数据。

## 常用命令

| 命令                             | 说明                       |
| -------------------------------- | -------------------------- |
| `npm run setup`                  | 同步包元数据并安装依赖     |
| `npx --yes pnpm@9 dev`           | 启动开发服务器             |
| `npx --yes pnpm@9 build`         | 构建全部子包与聚合包       |
| `npx --yes pnpm@9 sync:packages` | 按组件目录同步 packages/\* |
| `npx --yes pnpm@9 lint`          | 运行 ESLint 与 Stylelint   |
| `npx --yes pnpm@9 lint:fix`      | 自动修复可修复的 lint 问题 |
| `npx --yes pnpm@9 format`        | 格式化代码                 |

## 故障排查

### `URL.canParse is not a function`

原因：本机 `pnpm` 被 **corepack 代理**，且 Node 版本混用（例如 nvm 默认是 v16，但 pnpm 指向 v22 的 corepack）。

**解决步骤：**

```bash
# 1. 切换到 Node 20
nvm install 20
nvm use 20
node -v   # 确认 >= v20

# 2. 用 setup 脚本安装（不依赖本机 pnpm）
npm run setup

# 3. 日常开发用 npx 调用 pnpm
npx --yes pnpm@9 dev
```

**彻底修复 pnpm 命令：**

```bash
nvm use 20
corepack disable
hash -r
npm install -g pnpm@9
pnpm -v
pnpm install   # 此时应可正常使用
```

## 发布流程

项目已配置 GitHub Actions 自动发布。维护者只需：

1. 在根目录 `package.json` 中递增 `version`（`pnpm sync:packages` / `pnpm build` 会同步到各子包）
2. 更新 `CHANGELOG.md`
3. 推送到 `master` 分支

CI 会自动 lint、build，并在 npm 上不存在该版本时发布：

- `cos-design`（聚合包）
- `@cos-design/shared`
- `@cos-design/<component>`（每个组件一个包）

> 首次发布 scoped 包前，需在 npm 创建并拥有 `@cos-design` organization，且 `NPM_TOKEN` 对该 scope 有 Publish 权限。

## 提交规范

建议使用 [Conventional Commits](https://www.conventionalcommits.org/) 风格：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档变更
- `refactor:` 重构
- `chore:` 工程化 / 工具链

## Pull Request 流程

1. Fork 本仓库并创建功能分支
2. 完成改动，确保 `npx --yes pnpm@9 lint` 与 `npx --yes pnpm@9 build` 通过
3. 如有必要，更新 `CHANGELOG.md` 与 `README.md`
4. 提交 PR 并填写 PR 模板

## 代码风格

- TypeScript + React 函数组件
- 样式使用 Less + CSS Modules（`*.module.less`）
- 提交前会由 Husky + lint-staged 自动执行格式化与 lint
