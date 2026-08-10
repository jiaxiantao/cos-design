export interface ElementSize {
  width: number;
  height: number;
}

/** 观察元素内容尺寸；返回取消订阅函数 */
export const observeElementSize = (
  element: Element,
  onChange: (size: ElementSize) => void,
  options?: { box?: ResizeObserverBoxOptions }
) => {
  const notify = () => {
    if (element instanceof HTMLElement) {
      onChange({ width: element.clientWidth, height: element.clientHeight });
      return;
    }
    const rect = element.getBoundingClientRect();
    onChange({ width: Math.round(rect.width), height: Math.round(rect.height) });
  };

  notify();

  if (typeof ResizeObserver === 'undefined') {
    if (typeof window === 'undefined') return () => undefined;
    window.addEventListener('resize', notify);
    return () => window.removeEventListener('resize', notify);
  }

  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (!entry) return;
    onChange({
      width: Math.round(entry.contentRect.width),
      height: Math.round(entry.contentRect.height)
    });
  });
  observer.observe(element, options);
  return () => observer.disconnect();
};
