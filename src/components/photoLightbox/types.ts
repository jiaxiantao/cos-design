export type StyleMap = Record<string, string | number | undefined>;

export interface PhotoLightboxItem {
  /** 图片地址 */
  src: string;
  /** 图片替代文本 */
  alt?: string;
  /** 照片标题 */
  title?: string;
  /** 照片说明 */
  description?: string;
}

export interface PhotoLightboxProps {
  /** 灯箱内的胶片幻灯片列表 */
  photos: PhotoLightboxItem[];
  /** 组件宽度 */
  width?: number | string;
  /** 组件高度 */
  height?: number | string;
  /** 单张幻灯片宽度（px） */
  slideWidth?: number;
  /** 单张幻灯片高度（px） */
  slideHeight?: number;
  /** 横向拖拽超过该距离（px）后松手即切换上一张/下一张 */
  pullThreshold?: number;
  /** 是否显示幻灯片底部标题与说明 */
  showCaption?: boolean;
  /** 初始显示的幻灯片索引 */
  initialIndex?: number;
  /** 点击当前幻灯片（未发生拖拽）时的回调 */
  onPhotoClick?: (index: number, photo: PhotoLightboxItem) => void;
  /** 当前索引变化时的回调 */
  onIndexChange?: (index: number, photo: PhotoLightboxItem) => void;
  /** 无障碍名称 */
  ariaLabel?: string;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: StyleMap;
}
