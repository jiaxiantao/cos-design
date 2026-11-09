/**
 * Web Component attribute → Core options parsing (v4 Element adapters).
 * Keeps behavior consistent across 91 components.
 */

export type BooleanAttrMode =
  /** `options.key = el.hasAttribute(attr)` — always written */
  | 'presence'
  /** Only when attribute present: `raw !== 'false' && raw !== '0'` (omit when absent) */
  | 'optional-true'
  /** Only when attribute present; when absent leave `undefined` (controlled props like `flipped`) */
  | 'optional-undefined';

export const camelToKebabAttr = (name: string) =>
  name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

export function readStringAttr<T extends object>(
  options: T,
  el: HTMLElement,
  key: keyof T & string,
  attr?: string,
): void {
  const a = attr ?? camelToKebabAttr(key);
  if (el.hasAttribute(a)) {
    (options as Record<string, unknown>)[key] = el.getAttribute(a) ?? undefined;
  }
}

export function readNumberAttr<T extends object>(
  options: T,
  el: HTMLElement,
  key: keyof T & string,
  attr?: string,
): void {
  const a = attr ?? camelToKebabAttr(key);
  if (el.hasAttribute(a)) {
    (options as Record<string, unknown>)[key] = Number(el.getAttribute(a));
  }
}

export function readBooleanAttr<T extends object>(
  options: T,
  el: HTMLElement,
  key: keyof T & string,
  attr?: string,
  mode: BooleanAttrMode = 'presence',
): void {
  const a = attr ?? camelToKebabAttr(key);
  if (mode === 'presence') {
    (options as Record<string, unknown>)[key] = el.hasAttribute(a);
    return;
  }
  if (!el.hasAttribute(a)) {
    if (mode !== 'optional-undefined') return;
    return;
  }
  const raw = el.getAttribute(a);
  (options as Record<string, unknown>)[key] = raw !== 'false' && raw !== '0';
}

export function readJsonAttr<T extends object, K extends keyof T & string>(
  options: T,
  el: HTMLElement,
  key: K,
  attr?: string,
): void {
  const a = attr ?? camelToKebabAttr(key);
  if (!el.hasAttribute(a)) return;
  try {
    (options as Record<string, unknown>)[key] = JSON.parse(el.getAttribute(a) ?? 'null');
  } catch {
    /* ignore invalid JSON */
  }
}

/** Property setters on the custom element class (`_prizes`, `_items`, …) override attributes. */
export function readPropertyOverride<T extends object, K extends keyof T & string>(
  options: T,
  el: HTMLElement,
  key: K,
  backingKey: string,
): void {
  const backing = (el as HTMLElement & Record<string, unknown>)[backingKey];
  if (backing !== undefined) {
    (options as Record<string, unknown>)[key as string] = backing;
  }
}

export function optionCallbackDispatcher(
  el: HTMLElement,
  eventName: string,
): (...args: unknown[]) => void {
  return (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent(eventName, {
        detail: args.length <= 1 ? args[0] : args,
        bubbles: true,
      }),
    );
  };
}
