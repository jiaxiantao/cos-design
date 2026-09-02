/**
 * 写入 v4 react / vue / element 适配器与 index 重导出
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COMPONENTS_DIR } from './component-packages.mjs';
import { toElementTag } from './v4-utils.mjs';

export function writeV4Adapters(name, exportName, { exposeMethods = [] } = {}) {
  const dir = join(COMPONENTS_DIR, name);
  const tag = toElementTag(name);

  const exposeReact =
    exposeMethods.length > 0
      ? exposeMethods.map((m) => `    ${m}: (...args: unknown[]) => ctrlRef.current?.${m}(...args)`).join(',\n')
      : '';
  const exposeVue =
    exposeMethods.length > 0
      ? exposeMethods.map((m) => `  ${m}: (...args: unknown[]) => ctrl?.${m}(...args)`).join(',\n')
      : '';

  writeFileSync(
    join(dir, 'react', 'index.tsx'),
    `import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { create${exportName}, type ${exportName}Controller, type ${exportName}Options } from '../core';
import '../style/index.css';

export type { ${exportName}Options, ${exportName}Props } from '../core/types';

const ${exportName} = forwardRef<unknown, ${exportName}Options>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<${exportName}Controller | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({
${exposeReact}${exposeReact ? '\n' : ''}  }));

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

  const emitLines = exposeMethods.length
    ? exposeMethods.map((m) => {
        const event = m.replace(/^on([A-Z])/, (_, c) => c.toLowerCase()).replace(/([A-Z])/g, '-$1').toLowerCase();
        if (m.startsWith('on') && m.length > 2) {
          return `  (props as Record<string, unknown>).${m}?.()`;
        }
        return null;
      }).filter(Boolean)
    : [];

  writeFileSync(
    join(dir, 'vue', `${exportName}.vue`),
    `<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { create${exportName}, type ${exportName}Controller, type ${exportName}Options } from '../core';
import '../style/index.css';

const props = defineProps<${exportName}Options>();
const emit = defineEmits<{${emitLines.length ? " complete: []" : ''}}>();
const hostRef = ref<HTMLElement>();
let ctrl: ${exportName}Controller | null = null;

const toOptions = (): ${exportName}Options => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = create${exportName}(hostRef.value, toOptions());
});

watch(() => ({ ...props }), () => ctrl?.update(toOptions()), { deep: true });

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({
${exposeVue}
});
</script>

<template>
  <div ref="hostRef" class="cos-${name}-host" />
</template>
`
  );

  writeFileSync(
    join(dir, 'element', 'index.ts'),
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

  writeFileSync(
    join(dir, 'index.tsx'),
    `export { default } from './react';
export { default as ${exportName} } from './react';
export type * from './core/types';
`
  );
}
