/** 当前是否偏好减少动效 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/** 监听 prefers-reduced-motion 变化；返回取消订阅函数 */
export const bindPrefersReducedMotion = (onChange: (reduced: boolean) => void) => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    onChange(false);
    return () => undefined;
  }

  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = () => onChange(media.matches);
  handler();

  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }

  media.addListener(handler);
  return () => media.removeListener(handler);
};
