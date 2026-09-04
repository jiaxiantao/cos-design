/** Apply fill / explicit size to the adapter host and make the engine root fill it. */
export function applyCanvasHostBox(
  container: HTMLElement,
  root: HTMLElement,
  opts: { fill: boolean; width: number; height: number },
): void {
  container.style.display = 'block';
  container.style.boxSizing = 'border-box';
  container.style.maxWidth = '100%';
  if (opts.fill) {
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.marginInline = '0';
  } else {
    container.style.width = `${opts.width}px`;
    container.style.height = `${opts.height}px`;
    // Fixed-size demos sit in a full-width playground host — center like block components.
    container.style.marginInline = 'auto';
  }
  root.style.width = '100%';
  root.style.height = '100%';
  root.style.boxSizing = 'border-box';
}

const cssBoxSize = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

/**
 * Size the adapter host (React/Vue div or custom element) so percentage widths
 * don't collapse when the host is a shrink-wrapped flex child. Root fills the host
 * unless `rootFillsHost` is false (e.g. PhotoAlbum sizes itself via CSS variables).
 */
export function applyBlockHostBox(
  container: HTMLElement,
  root: HTMLElement,
  size: {
    width?: number | string;
    height?: number | string;
    rootFillsHost?: boolean;
  },
): void {
  const width = size.width ?? '100%';
  const fixedWidth =
    typeof width === 'number' ||
    (typeof width === 'string' && /^\d+(\.\d+)?px$/i.test(width.trim()));

  container.style.display = 'block';
  container.style.boxSizing = 'border-box';
  container.style.maxWidth = '100%';
  container.style.width = cssBoxSize(width);
  // Fixed-size demos sit in a full-width playground host — center them like React wrappers.
  container.style.marginInline = fixedWidth ? 'auto' : '0';
  if (size.height != null) {
    container.style.height = cssBoxSize(size.height);
  }
  if (size.rootFillsHost === false) return;
  root.style.boxSizing = 'border-box';
  root.style.width = '100%';
  if (size.height != null) {
    root.style.height = '100%';
  }
}

/** Toggle empty-state nodes; author `display:` rules must not override `[hidden]`. */
export function setHidden(el: HTMLElement, hidden: boolean): void {
  el.hidden = hidden;
  el.style.display = hidden ? 'none' : '';
}

/** Stable JSON key for options, ignoring functions (callbacks). */
export function optionsFingerprint(value: unknown): string {
  try {
    return JSON.stringify(value, (_key, v) => (typeof v === 'function' ? undefined : v)) ?? '';
  } catch {
    return '';
  }
}

/** True when non-function fields differ (shallow). */
export function optionsVisualChanged(
  prev: Record<string, unknown>,
  next: Record<string, unknown>,
): boolean {
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  for (const key of keys) {
    const a = prev[key];
    const b = next[key];
    if (typeof a === 'function' || typeof b === 'function') continue;
    if (a !== b) {
      if (typeof a === 'object' || typeof b === 'object') {
        if (optionsFingerprint(a) !== optionsFingerprint(b)) return true;
      } else {
        return true;
      }
    }
  }
  return false;
}
