import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { COMPONENTS_DIR, toPackageId } from './component-packages.mjs';

/** v4 组件入口 */
export const V4_ENTRIES = ['react', 'vue', 'core', 'element'];

/** 是否已完成 v4 迁移（存在 core/index.ts） */
export function isV4Component(name) {
  return existsSync(join(COMPONENTS_DIR, name, 'core', 'index.ts'));
}

/** fireworks → cos-fireworks */
export function toElementTag(name) {
  return `cos-${toPackageId(name)}`;
}

/** Fireworks → Fireworks.vue */
export function toVueFileName(name) {
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}.vue`;
}

export function componentCorePath(name) {
  return join(COMPONENTS_DIR, name, 'core', 'index.ts');
}

export function packageEntryPath(name, entry) {
  if (entry === 'react') {
    return isV4Component(name)
      ? join('packages', name, 'src', 'react.ts')
      : join('packages', name, 'src', 'index.ts');
  }
  return join('packages', name, 'src', `${entry}.ts`);
}
