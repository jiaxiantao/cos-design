#!/usr/bin/env node
/**
 * 生成 v4 组件迁移骨架（core/react/vue/element + style/index.css）。
 * 已有 core/index.ts 时跳过。
 * 用法：node scripts/migrate-component.mjs <componentName>
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COMPONENTS_DIR } from './component-packages.mjs';
import { toExportName } from './component-packages.mjs';
import { toElementTag } from './v4-utils.mjs';

const name = process.argv[2];
if (!name) {
  console.error('Usage: node scripts/migrate-component.mjs <componentName>');
  process.exit(1);
}

const componentDir = join(COMPONENTS_DIR, name);
if (!existsSync(componentDir)) {
  console.error(`Component not found: ${name}`);
  process.exit(1);
}

const exportName = toExportName(name);
const tag = toElementTag(name);
const coreIndex = join(componentDir, 'core', 'index.ts');

if (existsSync(coreIndex)) {
  console.log(`Skip: ${name} already has core/index.ts`);
  process.exit(0);
}

const dirs = ['core', 'react', 'vue', 'element', 'style'];
for (const dir of dirs) {
  mkdirSync(join(componentDir, dir), { recursive: true });
}

writeFileSync(
  join(componentDir, 'core', 'types.ts'),
  `export interface ${exportName}Options {
  /** TODO: migrate props from react component */
}

export interface ${exportName}Controller {
  update(options: Partial<${exportName}Options>): void;
  destroy(): void;
}

export type ${exportName}Props = ${exportName}Options;
`
);

writeFileSync(
  join(componentDir, 'core', 'engine.ts'),
  `import type { ${exportName}Controller, ${exportName}Options } from './types';

export function create${exportName}(container: HTMLElement, options: ${exportName}Options = {}): ${exportName}Controller {
  // TODO: move rendering logic from index.tsx
  container.classList.add('cos-${name.replace(/([A-Z])/g, '-$1').toLowerCase()}');
  let current = { ...options };

  return {
    update(next) {
      current = { ...current, ...next };
    },
    destroy() {
      container.replaceChildren();
    }
  };
}
`
);

writeFileSync(
  join(componentDir, 'core', 'index.ts'),
  `export { create${exportName} } from './engine';
export type { ${exportName}Controller, ${exportName}Options, ${exportName}Props } from './types';
`
);

writeFileSync(
  join(componentDir, 'react', 'index.tsx'),
  `import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { create${exportName}, type ${exportName}Controller, type ${exportName}Options } from '../core';
import '../style/index.css';

export type { ${exportName}Options, ${exportName}Props } from '../core/types';

const ${exportName} = forwardRef<unknown, ${exportName}Options>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<${exportName}Controller | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = create${exportName}(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-${name}-host" />;
});

${exportName}.displayName = '${exportName}';

export default ${exportName};
`
);

writeFileSync(
  join(componentDir, 'vue', `${exportName}.vue`),
  `<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { create${exportName}, type ${exportName}Controller, type ${exportName}Options } from '../core';
import '../style/index.css';

const props = defineProps<${exportName}Options>();
const hostRef = ref<HTMLElement>();
let ctrl: ${exportName}Controller | null = null;

onMounted(() => {
  if (hostRef.value) ctrl = create${exportName}(hostRef.value, props);
});

watch(() => ({ ...props }), (next) => ctrl?.update(next), { deep: true });

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({});
</script>

<template>
  <div ref="hostRef" class="cos-${name}-host" />
</template>
`
);

writeFileSync(
  join(componentDir, 'element', 'index.ts'),
  `import { create${exportName}, type ${exportName}Controller, type ${exportName}Options } from '../core';
import '../style/index.css';

const TAG = '${tag}';

class Cos${exportName}Element extends HTMLElement {
  private ctrl: ${exportName}Controller | null = null;

  connectedCallback() {
    this.ctrl = create${exportName}(this, this.parseOptions());
  }

  disconnectedCallback() {
    this.ctrl?.destroy();
    this.ctrl = null;
  }

  private parseOptions(): ${exportName}Options {
    return {};
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, Cos${exportName}Element);
}

export { Cos${exportName}Element, TAG };
`
);

if (!existsSync(join(componentDir, 'style', 'index.css'))) {
  writeFileSync(
    join(componentDir, 'style', 'index.css'),
    `/* TODO: migrate from style/index.module.less */
.cos-${name.replace(/([A-Z])/g, '-$1').toLowerCase()} {
  position: relative;
}
`
  );
}

console.log(`Scaffolded v4 layers for ${name}. Next:`);
console.log(`  1. Move logic into core/engine.ts`);
console.log(`  2. Update src/components/${name}/index.tsx to re-export ./react`);
console.log(`  3. pnpm sync:packages && pnpm build`);
console.log(`  4. node scripts/verify-v4-matrix.mjs`);
