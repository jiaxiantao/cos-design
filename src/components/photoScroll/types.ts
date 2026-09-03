export type StyleMap = Record<string, string | number | undefined>;

export interface PhotoScrollItem {
  /** 图片地址 */
  src: string;
  /** 图片替代文本 */
  alt?: string;
  /** 照片标题，用于卷轴底部墨迹说明 */
  title?: string;
  /** 照片说明，显示在标题下方 */
  description?: string;
}

export interface PhotoScrollProps {
  /** 卷轴上的照片列表 */
  photos: PhotoScrollItem[];
  /** 组件宽度 */
  width?: number | string;
  /** 组件高度 */
  height?: number | string;
  /** 单张照片框宽度（px） */
  frameWidth?: number;
  /** 单张照片框高度（px） */
  frameHeight?: number;
  /** 照片框之间的间距（px） */
  frameGap?: number;
  /** 拖拽灵敏度，1 为 1:1 跟手 */
  dragSensitivity?: number;
  /** 惯性摩擦系数，越大减速越快 */
  friction?: number;
  /** 是否在每张照片底部嵌入标题与说明 */
  showCaption?: boolean;
  /** 初始居中显示的照片索引 */
  initialIndex?: number;
  /** 点击照片回调（位移小于 CLICK_SLOP 时触发） */
  onPhotoClick?: (index: number, photo: PhotoScrollItem) => void;
  /** 当前居中照片索引变化回调 */
  onIndexChange?: (index: number, photo: PhotoScrollItem) => void;
  /** 无障碍区域名称 */
  ariaLabel?: string;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: StyleMap;
}
