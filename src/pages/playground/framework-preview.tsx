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
  /** Injected by FillStage — pixel box for background previews */
  width?: number;
  height?: number;
};

const FrameworkPreview = ({
  framework,
  exportName,
  codeExample,
  fill,
  width,
  height,
}: FrameworkPreviewProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const sized = Boolean(width && height && width > 0 && height > 0);

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
      const parsed = parseExampleProps(exportName, codeExample);
      const props: Record<string, unknown> = { ...parsed };

      // FillStage provides a fixed pixel box — use explicit size, never percentage fill
      // (percentage fill + ResizeObserver caused unbounded height growth).
      if (sized) {
        props.width = width;
        props.height = height;
        props.fill = false;
      } else if (fill) {
        delete props.width;
        delete props.height;
        props.fill = true;
      }

      try {
        if (framework === 'vue') {
          const key = `../../components/${dir}/vue/${exportName}.vue`;
          const loader = vueModules[key];
          if (!loader) throw new Error(`Vue SFC not found for ${exportName}`);
          const mod = await loader();
          if (cancelled) return;
          const mountEl = document.createElement('div');
          mountEl.style.cssText = 'display:block;width:100%;height:100%;position:relative;';
          host.style.width = '100%';
          host.style.height = '100%';
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
          el.style.width = '100%';
          el.style.height = '100%';
          el.style.display = 'block';
          for (const [k, v] of Object.entries(props)) {
            const attr = toAttrName(k);
            if (typeof v === 'boolean') {
              if (v) el.setAttribute(attr, '');
              else el.removeAttribute(attr);
              continue;
            }
            if (v == null) continue;
            el.setAttribute(attr, String(v));
          }
          host.appendChild(el);
          return;
        }

        const key = `../../components/${dir}/core/index.ts`;
        const loader = coreModules[key];
        if (!loader) throw new Error(`Core module not found for ${exportName}`);
        await import(`../../components/${dir}/style/index.css`);
        const mod = (await loader()) as Record<string, unknown>;
        if (cancelled) return;
        const factory = mod[`create${exportName}`];
        if (typeof factory !== 'function') {
          throw new Error(`create${exportName} not exported`);
        }
        const mountEl = document.createElement('div');
        mountEl.style.width = '100%';
        mountEl.style.height = '100%';
        host.appendChild(mountEl);
        const ctrl = (
          factory as (el: HTMLElement, opts?: Record<string, unknown>) => { destroy?: () => void }
        )(mountEl, props);
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
  }, [framework, exportName, codeExample, fill, width, height, sized]);

  return (
    <div
      style={{
        width: '100%',
        height: sized ? '100%' : fill ? '100%' : undefined,
        minHeight: sized || fill ? undefined : undefined,
      }}
    >
      {error ? (
        <p style={{ color: '#fecaca', padding: 16, margin: 0 }}>{error}</p>
      ) : (
        <div
          ref={hostRef}
          style={{
            width: '100%',
            height: sized || fill ? '100%' : undefined,
          }}
        />
      )}
    </div>
  );
};

export default FrameworkPreview;
