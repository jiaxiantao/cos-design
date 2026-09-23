import { createApp, h, type App, type Component } from 'vue';
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

/**
 * Mount Vue / Web Component / Core previews.
 * Cleanup must survive async import races: dispose is registered immediately after
 * mount, and if the effect was already cancelled the instance is torn down right away.
 *
 * Non-fill demos are flex-centered so fixed-size engines (no applyBlockHostBox /
 * host CSS) don't stick to the left under Vue / Element / Core tabs.
 */
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
  const fullBleed = sized || Boolean(fill);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let alive = true;
    let dispose: (() => void) | null = null;

    const setDispose = (fn: () => void) => {
      if (!alive) {
        fn();
        return;
      }
      dispose = fn;
    };

    const centerMount = (el: HTMLElement) => {
      el.style.display = 'flex';
      el.style.justifyContent = 'center';
      el.style.alignItems = 'center';
      el.style.width = '100%';
      el.style.maxWidth = '100%';
      el.style.boxSizing = 'border-box';
    };

    const run = async () => {
      setError(null);
      host.replaceChildren();
      const dir = exportNameToDir(exportName);
      const parsed = parseExampleProps(exportName, codeExample);
      const exampleProps: Record<string, unknown> = { ...parsed };

      if (sized) {
        exampleProps.width = width;
        exampleProps.height = height;
        exampleProps.fill = false;
      } else if (fill) {
        delete exampleProps.width;
        delete exampleProps.height;
        exampleProps.fill = true;
      }

      try {
        if (framework === 'vue') {
          const key = `../../components/${dir}/vue/${exportName}.vue`;
          const loader = vueModules[key];
          if (!loader) throw new Error(`Vue SFC not found for ${exportName}`);
          const mod = await loader();
          if (!alive) return;
          const mountEl = document.createElement('div');
          if (fullBleed) {
            mountEl.style.cssText = 'display:block;width:100%;height:100%;position:relative;';
          } else {
            centerMount(mountEl);
            mountEl.style.position = 'relative';
          }
          host.style.width = '100%';
          host.style.maxWidth = '100%';
          host.style.height = fullBleed ? '100%' : '';
          host.appendChild(mountEl);
          // createApp(Component, props) cannot pass slots — wrap so plain-text
          // example children (`<Comp>label</Comp>` → defaultContent) become the default slot.
          const slotDefault =
            typeof exampleProps.defaultContent === 'string'
              ? String(exampleProps.defaultContent)
              : null;
          const vueApp: App = createApp({
            name: `${exportName}Preview`,
            render: () =>
              h(
                mod.default,
                exampleProps,
                slotDefault != null ? { default: () => slotDefault } : undefined,
              ),
          });
          vueApp.mount(mountEl);
          setDispose(() => {
            vueApp.unmount();
          });
          return;
        }

        if (framework === 'element') {
          const key = `../../components/${dir}/element/index.ts`;
          const loader = elementModules[key];
          if (!loader) throw new Error(`Element module not found for ${exportName}`);
          await loader();
          if (!alive) return;
          const tag = toElementTag(exportName);
          const el = document.createElement(tag);
          el.style.maxWidth = '100%';
          el.style.boxSizing = 'border-box';
          // Prefer flex centering for fixed-size engines; stretch only for fill stages.
          // (display:block would override component CSS flex hosts and left-align demos.)
          if (fullBleed) {
            el.style.display = 'block';
            el.style.width = '100%';
            el.style.height = '100%';
          } else {
            centerMount(el);
          }
          for (const [k, v] of Object.entries(exampleProps)) {
            const attr = toAttrName(k);
            if (typeof v === 'boolean') {
              if (v) el.setAttribute(attr, '');
              else el.removeAttribute(attr);
              continue;
            }
            if (v == null) continue;
            // Arrays/objects: prefer element property (JSON attrs need double quotes).
            if (typeof v === 'object') {
              (el as HTMLElement & Record<string, unknown>)[k] = v;
              el.setAttribute(attr, JSON.stringify(v));
              continue;
            }
            el.setAttribute(attr, String(v));
          }
          host.appendChild(el);
          setDispose(() => {
            // Prefer explicit destroy if the element exposes it; always remove to
            // trigger disconnectedCallback for animation teardown.
            const maybe = el as HTMLElement & {
              destroy?: () => void;
              ctrl?: { destroy?: () => void };
            };
            maybe.destroy?.();
            maybe.ctrl?.destroy?.();
            el.remove();
          });
          return;
        }

        const key = `../../components/${dir}/core/index.ts`;
        const loader = coreModules[key];
        if (!loader) throw new Error(`Core module not found for ${exportName}`);
        await import(`../../components/${dir}/style/index.css`);
        const mod = (await loader()) as Record<string, unknown>;
        if (!alive) return;
        const factory = mod[`create${exportName}`];
        if (typeof factory !== 'function') {
          throw new Error(`create${exportName} not exported`);
        }
        const mountEl = document.createElement('div');
        if (fullBleed) {
          mountEl.style.width = '100%';
          mountEl.style.maxWidth = '100%';
          mountEl.style.height = '100%';
        } else {
          centerMount(mountEl);
        }
        host.appendChild(mountEl);
        const ctrl = (
          factory as (el: HTMLElement, opts?: Record<string, unknown>) => { destroy?: () => void }
        )(mountEl, exampleProps);
        setDispose(() => {
          ctrl.destroy?.();
        });
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    };

    void run();

    return () => {
      alive = false;
      dispose?.();
      dispose = null;
      host.replaceChildren();
    };
  }, [framework, exportName, codeExample, fill, width, height, sized, fullBleed]);

  // Keep host node mounted even on error so effect cleanup always has a stable target
  // and we never orphan a running engine by swapping the ref node out of the tree.
  return (
    <div
      style={{
        width: '100%',
        height: fullBleed ? '100%' : undefined,
        display: 'flex',
        flexDirection: 'column',
        alignItems: fullBleed ? 'stretch' : 'center',
        justifyContent: fullBleed ? 'stretch' : 'center',
        gap: fullBleed ? undefined : 12,
      }}
    >
      {error ? <p style={{ color: '#fecaca', padding: 16, margin: 0 }}>{error}</p> : null}
      <div
        ref={hostRef}
        hidden={Boolean(error)}
        style={{
          width: '100%',
          maxWidth: '100%',
          height: fullBleed ? '100%' : undefined,
          ...(fullBleed
            ? null
            : {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }),
        }}
      />
    </div>
  );
};

export default FrameworkPreview;
