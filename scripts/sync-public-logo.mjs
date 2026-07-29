/**
 * 将浅色背景 favicon 源文件同步到 public/，供 index.html 引用。
 * 单一数据源：src/assets/icons/cos-logo-light.svg → public/cos-logo.svg
 */
import { copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'src/assets/icons/cos-logo-light.svg');
const target = join(root, 'public/cos-logo.svg');

copyFileSync(source, target);
console.log('sync-public-logo: cos-logo-light.svg → public/cos-logo.svg');
