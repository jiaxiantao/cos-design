export interface PointerPosition {
  x: number;
  y: number;
}

type PointLike = { clientX: number; clientY: number };

/** 相对元素左上角的指针坐标（兼容 mouse / touch / pointer） */
export const getRelativePointerPosition = (
  element: Element,
  event: PointLike | { touches?: ArrayLike<PointLike>; changedTouches?: ArrayLike<PointLike> },
): PointerPosition | null => {
  const rect = element.getBoundingClientRect();
  let point: PointLike | undefined;

  if ('clientX' in event && typeof event.clientX === 'number') {
    point = event;
  } else if ('touches' in event && event.touches && event.touches.length > 0) {
    point = event.touches[0];
  } else if ('changedTouches' in event && event.changedTouches && event.changedTouches.length > 0) {
    point = event.changedTouches[0];
  }

  if (!point) return null;
  return { x: point.clientX - rect.left, y: point.clientY - rect.top };
};
