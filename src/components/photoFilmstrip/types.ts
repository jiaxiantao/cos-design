export type StyleMap = Record<string, string | number | undefined>;

export interface PhotoFilmstripItem {
  /** 图片地址 */
  src: string;
  /** 图片替代文本 */
  alt?: string;
  /** 照片标题 */
  title?: string;
  /** 照片说明 */
  description?: string;
}

export interface PhotoFilmstripProps {
  /** 胶片条上的照片列表 */
  photos: PhotoFilmstripItem[];
  /** 组件宽度 */
  width?: number | string;
  /** 组件高度 */
  height?: number | string;
  /** 单帧宽度（px） */
  frameWidth?: number;
  /** 单帧高度（px） */
  frameHeight?: number;
  /** 帧间距（px） */
  frameGap?: number;
  /** 是否显示标题与说明 */
  showCaption?: boolean;
  /** 惯性摩擦系数，越大停得越快 */
  friction?: number;
  /** 拖拽灵敏度，1 为 1:1 跟手 */
  dragSensitivity?: number;
  /** 初始居中显示的帧索引 */
  initialIndex?: number;
  /** 点击照片回调 */
  onPhotoClick?: (index: number, photo: PhotoFilmstripItem) => void;
  /** 当前居中帧变化回调 */
  onIndexChange?: (index: number, photo: PhotoFilmstripItem) => void;
  /** 无障碍名称 */
  ariaLabel?: string;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: StyleMap;
}
