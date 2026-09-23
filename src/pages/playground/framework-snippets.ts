export type FrameworkId = 'react' | 'vue' | 'element' | 'core';

export type ExamplePropValue =
  | string
  | number
  | boolean
  | null
  | ExamplePropValue[]
  | { [key: string]: ExamplePropValue };

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

/** Evaluate a simple JSX / JS expression from our own demo snippets. */
const evalJsxExpr = (
  expr: string,
  bindings: Record<string, ExamplePropValue> = {},
): ExamplePropValue => {
  const trimmed = expr.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1);
  }
  if (/^[a-zA-Z_][\w]*$/.test(trimmed) && Object.prototype.hasOwnProperty.call(bindings, trimmed)) {
    return bindings[trimmed];
  }
  try {
    const keys = Object.keys(bindings);
    const vals = keys.map((k) => bindings[k]);
    // Demo snippets only — needed for texts={['A','B']} / photos={photos}

    return new Function(...keys, `"use strict"; return (${trimmed});`)(...vals) as ExamplePropValue;
  } catch {
    return trimmed.replace(/^['"]|['"]$/g, '');
  }
};

/** Scan `const photos = [...]` style bindings ahead of the JSX tag. */
const extractTopLevelBindings = (code: string): Record<string, ExamplePropValue> => {
  const bindings: Record<string, ExamplePropValue> = {};
  const re = /(?:^|[\n;])\s*(?:const|let|var)\s+([a-zA-Z_][\w]*)\s*=\s*/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(code))) {
    const name = m[1];
    let i = m.index + m[0].length;
    while (code[i] === ' ' || code[i] === '\n' || code[i] === '\t') i += 1;

    let end = i;
    let depth = 0;
    let inStr: '"' | "'" | '`' | null = null;
    for (; end < code.length; end += 1) {
      const c = code[end];
      if (inStr) {
        if (c === '\\') {
          end += 1;
          continue;
        }
        if (c === inStr) inStr = null;
        continue;
      }
      if (c === '"' || c === "'" || c === '`') {
        inStr = c;
        continue;
      }
      if (c === '(' || c === '[' || c === '{') {
        depth += 1;
        continue;
      }
      if (c === ')' || c === ']' || c === '}') {
        depth -= 1;
        continue;
      }
      if (c === ';' && depth === 0) break;
      if (c === '\n' && depth === 0) {
        const rest = code.slice(end + 1);
        if (/^\s*(?:const|let|var|function|return|export|import|<)/.test(rest)) break;
      }
    }

    const expr = code
      .slice(i, end)
      .trim()
      .replace(/;?\s*$/, '');
    if (!expr) continue;
    try {
      bindings[name] = evalJsxExpr(expr, bindings);
    } catch {
      /* skip unparsable binding */
    }
    re.lastIndex = end;
  }

  return bindings;
};

/** Extract `{...}` with nested braces / string awareness; returns inner source + end index. */
const extractBalancedExpr = (
  source: string,
  openIdx: number,
): { inner: string; end: number } | null => {
  if (source[openIdx] !== '{') return null;
  let depth = 0;
  let inStr: '"' | "'" | '`' | null = null;
  for (let i = openIdx; i < source.length; i += 1) {
    const c = source[i];
    if (inStr) {
      if (c === '\\') {
        i += 1;
        continue;
      }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      inStr = c;
      continue;
    }
    if (c === '{') depth += 1;
    else if (c === '}') {
      depth -= 1;
      if (depth === 0) return { inner: source.slice(openIdx + 1, i), end: i + 1 };
    }
  }
  return null;
};

/** Plain text children from `<Comp>text</Comp>` — used as defaultContent for Core/Vue/WC. */
export function parseExampleTextChildren(exportName: string, codeExample: string): string | null {
  const re = new RegExp(`<${exportName}\\b[^>]*>([\\s\\S]*?)</${exportName}>`, 'm');
  const m = codeExample.match(re);
  if (!m) return null;
  const inner = m[1].trim();
  // Only plain text (slot components with nested JSX keep engine defaults)
  if (!inner || /<|>/.test(inner)) return null;
  return inner;
}

/** Parse simple JSX props from a React code example. */
export function parseExampleProps(
  exportName: string,
  codeExample: string,
): Record<string, ExamplePropValue> {
  const match = codeExample.match(new RegExp(`<${exportName}([\\s\\S]*?)(/?>)`, 'm'));
  if (!match) return {};

  const bindings = extractTopLevelBindings(codeExample);
  const attrs = match[1];
  const props: Record<string, ExamplePropValue> = {};
  const nameRe = /([a-zA-Z_][\w-]*)/g;
  let m: RegExpExecArray | null;

  while ((m = nameRe.exec(attrs))) {
    const key = m[1];
    if (key === 'key' || key === 'ref') continue;
    let i = m.index + key.length;
    while (attrs[i] === ' ' || attrs[i] === '\n' || attrs[i] === '\t') i += 1;

    if (attrs[i] !== '=') {
      props[key] = true;
      continue;
    }
    i += 1;
    while (attrs[i] === ' ' || attrs[i] === '\n' || attrs[i] === '\t') i += 1;

    if (attrs[i] === '"' || attrs[i] === "'") {
      const quote = attrs[i];
      const end = attrs.indexOf(quote, i + 1);
      if (end === -1) break;
      props[key] = attrs.slice(i + 1, end);
      nameRe.lastIndex = end + 1;
      continue;
    }

    if (attrs[i] === '{') {
      const extracted = extractBalancedExpr(attrs, i);
      if (!extracted) break;
      props[key] = evalJsxExpr(extracted.inner, bindings);
      nameRe.lastIndex = extracted.end;
      continue;
    }

    // Bare token (rare)
    const token = attrs.slice(i).match(/^[^\s/>]+/);
    if (token) {
      props[key] = evalJsxExpr(token[0], bindings);
      nameRe.lastIndex = i + token[0].length;
    }
  }

  // Slot text → defaultContent for Vue / Element / Core (no children portal)
  if (props.defaultContent == null) {
    const text = parseExampleTextChildren(exportName, codeExample);
    if (text != null) props.defaultContent = text;
  }

  return props;
}

const vueProp = (key: string, value: ExamplePropValue) => {
  if (typeof value === 'boolean') return value ? key : `:${key}="false"`;
  if (typeof value === 'number') return `:${key}="${value}"`;
  if (value == null) return `:${key}="null"`;
  if (typeof value === 'object') return `:${key}='${JSON.stringify(value)}'`;
  return `${key}="${value}"`;
};

const toAttrName = (key: string) => key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const htmlAttr = (key: string, value: ExamplePropValue) => {
  const kebab = toAttrName(key);
  if (typeof value === 'boolean') return value ? kebab : null;
  if (value == null) return null;
  if (typeof value === 'object') return `${kebab}='${JSON.stringify(value)}'`;
  return `${kebab}="${value}"`;
};

const jsLiteral = (value: ExamplePropValue): string => {
  if (typeof value === 'string') return JSON.stringify(value);
  if (value == null) return 'null';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export function buildFrameworkSnippets(exportName: string, codeExample: string) {
  const pkg = toScopedPackage(exportName);
  const tag = toElementTag(exportName);
  const props = parseExampleProps(exportName, codeExample);
  const slotText = typeof props.defaultContent === 'string' ? props.defaultContent : null;
  const entries = Object.entries(props);
  // Vue prefers slot children; drop defaultContent attr when we have plain text
  const vueEntries = entries.filter(([k]) => !(slotText != null && k === 'defaultContent'));
  const vueAttrs = vueEntries.map(([k, v]) => vueProp(k, v)).join('\n  ');
  const htmlAttrs = entries
    .map(([k, v]) => htmlAttr(k, v))
    .filter(Boolean)
    .join('\n  ');
  const coreOptions =
    entries.length === 0 ? '' : entries.map(([k, v]) => `  ${k}: ${jsLiteral(v)},`).join('\n');
  const vueOpen = vueAttrs ? `\n  ${vueAttrs}\n` : '';
  const htmlOpen = htmlAttrs ? `\n  ${htmlAttrs}\n` : ' ';

  return {
    react: codeExample.trim(),
    vue: `<script setup lang="ts">
import { ${exportName} } from '${pkg}/vue';
</script>

<template>
  <${exportName}${vueOpen}${slotText != null ? `>${slotText}</${exportName}>` : ' />'}
</template>`,
    element: `<script type="module">
  import '${pkg}/element';
</script>

<${tag}${htmlOpen}></${tag}>`,
    core: `import { create${exportName} } from '${pkg}/core';

const host = document.getElementById('host')!;
const ctrl = create${exportName}(host, {${coreOptions ? `\n${coreOptions}\n` : ''}});

// ctrl.update({ ... }) / ctrl.destroy()`,
  } as const;
}
