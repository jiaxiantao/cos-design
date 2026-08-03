import type { CSSProperties } from 'react';

/** 棱镜单面照片数据 */
export interface PhotoPrismItem {
  /** 图片地址 */
  src: string;
  /** 图片替代文本 */
  alt?: string;
  /** 照片标题 */
  title?: string;
  /** 照片说明 */
  description?: string;
}

/** PhotoPrism 组件属性 */
export interface PhotoPrismProps {
  /** 六面照片（最多取前 6 张，按 front/back/right/left/top/bottom 顺序映射） */
  photos: PhotoPrismItem[];
  /** 组件宽度 */
  width?: number | string;
  /** 组件高度 */
  height?: number | string;
  /** 立方体边长（px） */
  size?: number;
  /** 空闲时是否缓慢绕 Y 轴自转 */
  autoRotate?: boolean;
  /** 拖拽灵敏度（度/像素） */
  dragSensitivity?: number;
  /** 松手后惯性衰减系数（越大停得越快，约 0.6~4） */
  friction?: number;
  /** 是否在每面照片底部嵌入标题与说明 */
  showCaption?: boolean;
  /** 点击某面照片回调 */
  onPhotoClick?: (index: number, photo: PhotoPrismItem) => void;
  /** 无障碍名称 */
  ariaLabel?: string;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: CSSProperties;
}
