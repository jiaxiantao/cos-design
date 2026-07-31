import type { CSSProperties } from 'react';

export interface PhotoClotheslineItem {
  /** 图片地址 */
  src: string;
  /** 图片替代文本 */
  alt?: string;
  /** 照片标题 */
  title?: string;
  /** 照片说明 */
  description?: string;
}

export interface PhotoClotheslineProps {
  /** 晾绳上的照片列表 */
  photos: PhotoClotheslineItem[];
  /** 组件宽度 */
  width?: number | string;
  /** 组件高度 */
  height?: number | string;
  /** 单张照片宽度（px） */
  photoWidth?: number;
  /** 单张照片高度（px） */
  photoHeight?: number;
  /** 照片间距（px） */
  photoGap?: number;
  /** 绳索悬挂高度（px，距顶部） */
  ropeTop?: number;
  /** 绳索整体垂度（px） */
  ropeSag?: number;
  /** 照片吊带长度（px），越长摆动幅度越大、周期越慢 */
  bandLength?: number;
  /** 吊带宽度（px） */
  bandWidth?: number;
  /** 照片被拖离静止位的最大距离（px），越小吊带越快绷紧 */
  maxPull?: number;
  /** 主绳刚度 0.1~2，越大被拽下后弹回越快 */
  stiffness?: number;
  /** 阻尼比 0~1，越小摆动越久 */
  damping?: number;
  /** 相邻照片之间的绳索牵连强度 0~1 */
  tension?: number;
  /** 照片随机倾角幅度（度） */
  tilt?: number;
  /** 主绳颜色 */
  ropeColor?: string;
  /** 吊带颜色，默认跟随 ropeColor */
  bandColor?: string;
  /** 木夹子颜色 */
  pinColor?: string;
  /** 相纸边框颜色 */
  frameColor?: string;
  /** 背景（任意 CSS background 值） */
  background?: string;
  /** 照片填充方式 */
  objectFit?: CSSProperties['objectFit'];
  /** 是否显示照片标题与说明 */
  showCaption?: boolean;
  /** 初始居中显示的照片索引 */
  initialIndex?: number;
  /** 点击照片回调 */
  onPhotoClick?: (index: number, photo: PhotoClotheslineItem) => void;
  /** 无障碍名称 */
  ariaLabel?: string;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: CSSProperties;
}
