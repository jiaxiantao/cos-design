import type { CSSProperties } from 'react';

export interface PhotoCarouselItem {
  /** 图片地址 */
  src: string;
  /** 图片替代文本 */
  alt?: string;
  /** 照片标题 */
  title?: string;
  /** 照片说明 */
  description?: string;
}

export interface PhotoCarouselProps {
  /** 转盘上的照片列表 */
  photos: PhotoCarouselItem[];
  /** 组件宽度 */
  width?: number | string;
  /** 组件高度 */
  height?: number | string;
  /** 照片环半径（px） */
  radius?: number;
  /** 单张照片宽度（px） */
  cardWidth?: number;
  /** 单张照片高度（px） */
  cardHeight?: number;
  /** 空闲时是否自动顺时针旋转 */
  autoRotate?: boolean;
  /** 自动旋转角速度（度/秒） */
  autoRotateSpeed?: number;
  /** 水平拖拽灵敏度，越大同样位移转得越多 */
  dragSensitivity?: number;
  /** 惯性摩擦系数，越大减速越快 */
  friction?: number;
  /** 是否仅对正面照片显示标题与说明 */
  showCaption?: boolean;
  /** 初始旋转角（度），0 表示第一张正对镜头 */
  initialAngle?: number;
  /** 点击正面照片回调 */
  onPhotoClick?: (index: number, photo: PhotoCarouselItem) => void;
  /** 正对镜头的照片索引变化回调 */
  onFaceChange?: (index: number) => void;
  /** 无障碍名称 */
  ariaLabel?: string;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: CSSProperties;
}
