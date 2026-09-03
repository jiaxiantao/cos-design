export type FrameworkId = 'react' | 'vue' | 'element' | 'core';

export const FRAMEWORK_TABS: { id: FrameworkId; label: string }[] = [
  { id: 'react', label: 'React' },
  { id: 'vue', label: 'Vue' },
  { id: 'element', label: 'Web Components' },
  { id: 'core', label: 'Core' },
];

export const exportNameToDir = (name: string) => name.charAt(0).toLowerCase() + name.slice(1);

export const toKebabName = (exportName: string) =>
  exportNameToDir(exportName)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();

export const toElementTag = (exportName: string) => `cos-${toKebabName(exportName)}`;

export const toScopedPackage = (exportName: string) => `@cos-design/${toKebabName(exportName)}`;

/** Parse simple JSX props from a React code example. */
export function parseExampleProps(
  exportName: string,
  codeExample: string,
): Record<string, string | number | boolean> {
  const match = codeExample.match(new RegExp(`<${exportName}([\\s\\S]*?)(/?>)`, 'm'));
  if (!match) return {};

  const attrs = match[1];
  const props: Record<string, string | number | boolean> = {};

  const re = /([a-zA-Z_][\w-]*)(?:=(?:"([^"]*)"|'([^']*)'|\{([^}]*)\}))?(?=\s|$|\/)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrs))) {
    const key = m[1];
    if (key === 'key' || key === 'ref') continue;
    const raw = m[2] ?? m[3] ?? m[4];
    if (raw === undefined) {
      props[key] = true;
      continue;
    }
    const trimmed = raw.trim();
    if (trimmed === 'true') props[key] = true;
    else if (trimmed === 'false') props[key] = false;
    else if (/^-?\d+(\.\d+)?$/.test(trimmed)) props[key] = Number(trimmed);
    else props[key] = trimmed.replace(/^['"]|['"]$/g, '');
  }
  return props;
}

const vueProp = (key: string, value: string | number | boolean) => {
  if (typeof value === 'boolean') return value ? key : `:${key}="false"`;
  if (typeof value === 'number') return `:${key}="${value}"`;
  return `${key}="${value}"`;
};

const toAttrName = (key: string) => key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const htmlAttr = (key: string, value: string | number | boolean) => {
  const kebab = toAttrName(key);
  if (typeof value === 'boolean') return value ? kebab : null;
  return `${kebab}="${value}"`;
};

const jsLiteral = (value: string | number | boolean) => {
  if (typeof value === 'string') return JSON.stringify(value);
  return String(value);
};

export function buildFrameworkSnippets(exportName: string, codeExample: string) {
  const pkg = toScopedPackage(exportName);
  const tag = toElementTag(exportName);
  const props = parseExampleProps(exportName, codeExample);
  const entries = Object.entries(props);
  const vueAttrs = entries.map(([k, v]) => vueProp(k, v)).join('\n  ');
  const htmlAttrs = entries
    .map(([k, v]) => htmlAttr(k, v))
    .filter(Boolean)
    .join('\n  ');
  const coreOptions =
    entries.length === 0 ? '' : entries.map(([k, v]) => `  ${k}: ${jsLiteral(v)},`).join('\n');

  return {
    react: codeExample.trim(),
    vue: `<script setup lang="ts">
import { ${exportName} } from '${pkg}/vue';
</script>

<template>
  <${exportName}${vueAttrs ? `\n  ${vueAttrs}\n` : ' '}/>
</template>`,
    element: `<script type="module">
  import '${pkg}/element';
</script>

<${tag}${htmlAttrs ? `\n  ${htmlAttrs}\n` : ' '}></${tag}>`,
    core: `import { create${exportName} } from '${pkg}/core';

const host = document.getElementById('host')!;
const ctrl = create${exportName}(host, {${coreOptions ? `\n${coreOptions}\n` : ''}});

// ctrl.update({ ... }) / ctrl.destroy()`,
  } as const;
}
