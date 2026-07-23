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

| 命令                             | 说明                                             |
| -------------------------------- | ------------------------------------------------ |
| `npm run setup`                  | 同步包元数据并安装依赖                           |
| `npx --yes pnpm@9 dev`           | 启动开发服务器                                   |
| `npx --yes pnpm@9 build`         | 构建全部子包与聚合包                             |
| `npx --yes pnpm@9 sync:packages` | 按组件目录同步 packages/\*（保留各子包独立版本） |
| `npx --yes pnpm@9 release`       | 检测变更组件并 bump（可加 `-- --dry-run`）       |
| `npx --yes pnpm@9 lint`          | 运行 ESLint 与 Stylelint                         |
| `npx --yes pnpm@9 lint:fix`      | 自动修复可修复的 lint 问题                       |
| `npx --yes pnpm@9 format`        | 格式化代码                                       |

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

项目已配置「只发变更组件」：未改动的子包保持原版本，不会重新 publish。

### 日常发版

1. 完成组件改动并确保 `pnpm lint` / `pnpm build` 通过
2. 运行 `pnpm release`（自动对比上次 `v*` tag，检测变更包并 patch bump）
   - 变更的组件子包会升版本
   - 聚合包 `cos-design`（及根目录 `version`）会升版本
   - 若只改了 `@cos-design/shared`：只发 `shared` + `cos-design`，**不**跟发依赖它的其他组件
   - 可用 `pnpm release -- --dry-run` 预览；`pnpm release -- --since=v3.5.3` 指定基线
3. 检查 `CHANGELOG.md` 与版本号后提交：`git commit -m "chore: release vX.Y.Z"`
4. 推送到 `master`

CI 会自动 lint、build，并：

- 仅 publish **npm 上尚不存在** 的 `name@version`（未 bump 的子包会被 skip）
- 发布成功后打 `vX.Y.Z` tag，作为下次 `pnpm release` 的对比基线

### 首次启用

若仓库还没有 `v*` tag，先为当前已发布版本打标：

```bash
git tag v3.5.3
git push origin v3.5.3
```

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
