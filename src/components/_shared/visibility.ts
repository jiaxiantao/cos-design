/** 注册 visibilitychange，页面隐藏时暂停动画循环 */
export const bindVisibilityPause = (onChange: (paused: boolean) => void) => {
  const handler = () => onChange(document.hidden);
  document.addEventListener('visibilitychange', handler);
  return () => document.removeEventListener('visibilitychange', handler);
};

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
