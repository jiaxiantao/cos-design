import type { CSSProperties } from 'react';

export interface PhotoTunnelItem {
  /** 图片地址 */
  src: string;
  /** 图片替代文本 */
  alt?: string;
  /** 照片标题 */
  title?: string;
  /** 照片说明 */
  description?: string;
}

export interface PhotoTunnelProps {
  /** 隧道中的照片列表 */
  photos: PhotoTunnelItem[];
  /** 组件宽度 */
  width?: number | string;
  /** 组件高度 */
  height?: number | string;
  /** 相邻照片沿 Z 轴间距（px） */
  depthStep?: number;
  /** 拖拽灵敏度（索引单位 / px） */
  dragSensitivity?: number;
  /** 惯性摩擦系数，越大减速越快 */
  friction?: number;
  /** 空闲时是否缓慢自动前进 */
  autoAdvance?: boolean;
  /** 自动前进速度（张 / 秒） */
  autoAdvanceSpeed?: number;
  /** 是否显示当前照片的标题与说明 */
  showCaption?: boolean;
  /** 初始照片索引 */
  initialIndex?: number;
  /** 点击当前照片回调 */
  onPhotoClick?: (index: number, photo: PhotoTunnelItem) => void;
  /** 当前索引变化回调（吸附到整数后触发） */
  onIndexChange?: (index: number, photo: PhotoTunnelItem) => void;
  /** 无障碍名称 */
  ariaLabel?: string;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: CSSProperties;
}
