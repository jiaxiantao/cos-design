/** Apply fill / explicit size to the adapter host and make the engine root fill it. */
export function applyCanvasHostBox(
  container: HTMLElement,
  root: HTMLElement,
  opts: { fill: boolean; width: number; height: number },
): void {
  if (opts.fill) {
    container.style.width = '100%';
    container.style.height = '100%';
  } else {
    container.style.width = `${opts.width}px`;
    container.style.height = `${opts.height}px`;
  }
  root.style.width = '100%';
  root.style.height = '100%';
  root.style.boxSizing = 'border-box';
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
