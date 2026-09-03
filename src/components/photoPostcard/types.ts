export type StyleMap = Record<string, string | number | undefined>;

/** 单张旅行明信片数据 */
export interface PhotoPostcardItem {
  /** 图片地址 */
  src: string;
  /** 图片替代文本 */
  alt?: string;
  /** 明信片标题（背面问候语 / 正面说明标题） */
  title?: string;
  /** 明信片正文（背面书写区 / 正面说明） */
  description?: string;
}

/** PhotoPostcard 组件属性 */
export interface PhotoPostcardProps {
  /** 明信片照片列表 */
  photos: PhotoPostcardItem[];
  /** 组件宽度 */
  width?: number | string;
  /** 组件高度 */
  height?: number | string;
  /** 单张明信片宽度（px） */
  cardWidth?: number;
  /** 单张明信片高度（px） */
  cardHeight?: number;
  /** 水平拖拽切换阈值（px） */
  pullThreshold?: number;
  /** 是否在正面底部显示标题与说明 */
  showCaption?: boolean;
  /** 初始展示索引 */
  initialIndex?: number;
  /** 初始是否背面朝上 */
  initialFlipped?: boolean;
  /** 点击当前明信片（几乎无位移时触发） */
  onPhotoClick?: (index: number, photo: PhotoPostcardItem) => void;
  /** 当前索引变化回调 */
  onIndexChange?: (index: number, photo: PhotoPostcardItem) => void;
  /** 正反面翻转状态变化回调 */
  onFlipChange?: (flipped: boolean) => void;
  /** 无障碍名称 */
  ariaLabel?: string;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: StyleMap;
}
