import { execSync } from 'node:child_process';

const major = Number.parseInt(process.versions.node.split('.')[0], 10);

if (major < 20) {
  console.error(`\n❌ 需要 Node.js >= 20，当前为 v${process.versions.node}`);
  console.error('请先切换 Node 版本：');
  console.error('  nvm install 20');
  console.error('  nvm use 20\n');
  process.exit(1);
}

console.log(`\n✓ Node.js v${process.versions.node}`);
console.log('→ 同步 workspace 包元数据...\n');
execSync('node scripts/sync-packages.mjs', { stdio: 'inherit' });

console.log('→ 通过 npx 安装依赖（绕过 corepack）...\n');

execSync('npx --yes pnpm@9 install', {
  stdio: 'inherit',
  env: { ...process.env, COREPACK_ENABLE_STRICT: '0' }
});

console.log('\n✓ 依赖安装完成！');
console.log('  启动开发: npx --yes pnpm@9 dev');
console.log('  或修复 pnpm 后: pnpm dev\n');
