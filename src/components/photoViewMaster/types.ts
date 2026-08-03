import type { CSSProperties } from 'react';

/** 观景器单张照片数据 */
export interface PhotoViewMasterItem {
  /** 图片地址 */
  src: string;
  /** 图片替代文本 */
  alt?: string;
  /** 照片标题 */
  title?: string;
  /** 照片说明 */
  description?: string;
}

/** PhotoViewMaster 组件属性 */
export interface PhotoViewMasterProps {
  /** 转盘照片列表 */
  photos: PhotoViewMasterItem[];
  /** 组件宽度 */
  width?: number | string;
  /** 组件高度 */
  height?: number | string;
  /** 转盘直径（px） */
  discSize?: number;
  /** 窥视窗直径（px） */
  peepSize?: number;
  /** 水平拖拽灵敏度（度/像素） */
  dragSensitivity?: number;
  /** 松手后惯性衰减系数（越大停得越快） */
  friction?: number;
  /** 空闲时是否缓慢自动旋转 */
  autoRotate?: boolean;
  /** 自动旋转角速度（度/秒） */
  autoRotateSpeed?: number;
  /** 是否在窥视窗下方显示当前照片标题与说明 */
  showCaption?: boolean;
  /** 初始正对镜头的照片索引 */
  initialIndex?: number;
  /** 点击当前照片回调 */
  onPhotoClick?: (index: number, photo: PhotoViewMasterItem) => void;
  /** 当前照片索引变化回调 */
  onIndexChange?: (index: number, photo: PhotoViewMasterItem) => void;
  /** 无障碍名称 */
  ariaLabel?: string;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: CSSProperties;
}
