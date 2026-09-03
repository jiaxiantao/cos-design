import { createApp, type App, type Component } from 'vue';
import { useEffect, useRef, useState } from 'react';
import {
  exportNameToDir,
  parseExampleProps,
  toElementTag,
  type FrameworkId,
} from './framework-snippets';

const toAttrName = (key: string) => key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const vueModules = import.meta.glob<{ default: Component }>('../../components/*/vue/*.vue');
const elementModules = import.meta.glob('../../components/*/element/index.ts');
const coreModules = import.meta.glob('../../components/*/core/index.ts');

type FrameworkPreviewProps = {
  framework: Exclude<FrameworkId, 'react'>;
  exportName: string;
  codeExample: string;
  fill?: boolean;
};

const FrameworkPreview = ({ framework, exportName, codeExample, fill }: FrameworkPreviewProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let vueApp: App | null = null;
    let destroyCore: (() => void) | null = null;

    const run = async () => {
      setError(null);
      host.replaceChildren();
      const dir = exportNameToDir(exportName);
      const props = parseExampleProps(exportName, codeExample);

      try {
        if (framework === 'vue') {
          const key = `../../components/${dir}/vue/${exportName}.vue`;
          const loader = vueModules[key];
          if (!loader) throw new Error(`Vue SFC not found for ${exportName}`);
          const mod = await loader();
          if (cancelled) return;
          const mountEl = document.createElement('div');
          mountEl.style.width = fill ? '100%' : 'auto';
          mountEl.style.height = fill ? '100%' : 'auto';
          host.appendChild(mountEl);
          vueApp = createApp(mod.default, props);
          vueApp.mount(mountEl);
          return;
        }

        if (framework === 'element') {
          const key = `../../components/${dir}/element/index.ts`;
          const loader = elementModules[key];
          if (!loader) throw new Error(`Element module not found for ${exportName}`);
          await loader();
          if (cancelled) return;
          const tag = toElementTag(exportName);
          const el = document.createElement(tag);
          if (fill) {
            el.style.width = '100%';
            el.style.height = '100%';
            el.setAttribute('fill', '');
          }
          for (const [k, v] of Object.entries(props)) {
            const attr = toAttrName(k);
            if (typeof v === 'boolean') {
              if (v) el.setAttribute(attr, '');
              else el.removeAttribute(attr);
              continue;
            }
            el.setAttribute(attr, String(v));
          }
          host.appendChild(el);
          return;
        }

        const key = `../../components/${dir}/core/index.ts`;
        const loader = coreModules[key];
        if (!loader) throw new Error(`Core module not found for ${exportName}`);
        const mod = (await loader()) as Record<string, unknown>;
        if (cancelled) return;
        const factory = mod[`create${exportName}`];
        if (typeof factory !== 'function') {
          throw new Error(`create${exportName} not exported`);
        }
        const mountEl = document.createElement('div');
        mountEl.style.width = fill ? '100%' : 'auto';
        mountEl.style.height = fill ? '100%' : 'auto';
        host.appendChild(mountEl);
        const ctrl = (
          factory as (el: HTMLElement, opts?: Record<string, unknown>) => { destroy?: () => void }
        )(mountEl, fill ? { ...props, fill: true } : props);
        destroyCore = () => ctrl.destroy?.();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      vueApp?.unmount();
      vueApp = null;
      destroyCore?.();
      destroyCore = null;
      host.replaceChildren();
    };
  }, [framework, exportName, codeExample, fill]);

  return (
    <div style={{ width: '100%', minHeight: fill ? '100%' : undefined }}>
      {error ? (
        <p style={{ color: '#fecaca', padding: 16, margin: 0 }}>{error}</p>
      ) : (
        <div ref={hostRef} style={{ width: '100%', height: fill ? '100%' : undefined }} />
      )}
    </div>
  );
};

export default FrameworkPreview;
