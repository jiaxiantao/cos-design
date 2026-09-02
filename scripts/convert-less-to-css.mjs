/**
 * 将 index.module.less 转为 v4 index.css（cos-{kebab} 前缀）
 */
import less from 'less';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { COMPONENTS_DIR } from './component-packages.mjs';
import { toPackageId } from './component-packages.mjs';

const camelToKebab = (value) => value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** 从 LESS 源码提取顶层/嵌套类名 */
export function extractLessClasses(source) {
  const found = new Set();
  const re = /\.([a-zA-Z][\w-]*)/g;
  let match;
  while ((match = re.exec(source))) {
    found.add(match[1]);
  }
  return [...found];
}

export function prefixLessClasses(source, componentName) {
  const prefix = `cos-${toPackageId(componentName)}`;
  const classes = extractLessClasses(source).sort((a, b) => b.length - a.length);
  const rootHint = componentName.charAt(0).toLowerCase() + componentName.slice(1);
  const rootClass =
    classes.find((c) => c === rootHint) ||
    classes.find((c) => c.toLowerCase() === rootHint.toLowerCase()) ||
    classes[0];

  let out = source;
  for (const cls of classes) {
    const replacement = cls === rootClass ? prefix : `${prefix}__${camelToKebab(cls)}`;
    out = out.replace(new RegExp(`\\.${cls}\\b`, 'g'), `.${replacement}`);
  }
  return out;
}

export async function convertComponentLessToCss(componentName) {
  const lessPath = join(COMPONENTS_DIR, componentName, 'style', 'index.module.less');
  const source = readFileSync(lessPath, 'utf8');
  const prefixed = prefixLessClasses(source, componentName);
  const { css } = await less.render(prefixed, { javascriptEnabled: true });
  return css;
}
