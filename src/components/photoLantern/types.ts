import type { CSSProperties } from 'react';

export interface PhotoLanternItem {
  /** 图片地址 */
  src: string;
  /** 图片替代文本 */
  alt?: string;
  /** 照片标题 */
  title?: string;
  /** 照片说明 */
  description?: string;
}

export interface PhotoLanternProps {
  /** 走马灯六面照片（最多取前 6 张） */
  photos: PhotoLanternItem[];
  /** 组件宽度 */
  width?: number | string;
  /** 组件高度 */
  height?: number | string;
  /** 是否自动缓慢顺时针旋转 */
  autoRotate?: boolean;
  /** 自动旋转角速度（度/秒，正值=顺时针） */
  autoRotateSpeed?: number;
  /** 拖拽灵敏度（度/像素） */
  dragSensitivity?: number;
  /** 松手后惯性衰减系数（越大停得越快，约 0.6~4） */
  friction?: number;
  /** 灯架颜色 */
  frameColor?: string;
  /** 灯纸底色 */
  paperColor?: string;
  /** 内部灯光颜色 */
  lightColor?: string;
  /** 舞台背景（任意 CSS background 值） */
  background?: string;
  /** 灯光摆动幅度（0~1） */
  lightSway?: number;
  /** 是否显示吊环、飞檐、流苏等走马灯配件 */
  showAccessories?: boolean;
  /** 流苏颜色 */
  tasselColor?: string;
  /** 照片填充方式 */
  objectFit?: CSSProperties['objectFit'];
  /** 是否以剪影风格呈现图片（更接近传统走马灯） */
  silhouette?: boolean;
  /** 是否在照片底部嵌入标题与说明 */
  showCaption?: boolean;
  /** 初始旋转角（度） */
  initialAngle?: number;
  /** 正面照片变化回调 */
  onFaceChange?: (index: number, photo: PhotoLanternItem | undefined) => void;
  /** 点击照片回调 */
  onPhotoClick?: (index: number, photo: PhotoLanternItem) => void;
  /** 无障碍名称 */
  ariaLabel?: string;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: CSSProperties;
}
