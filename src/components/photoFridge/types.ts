export type StyleMap = Record<string, string | number | undefined>;

/** 单张冰箱磁贴照片数据 */
export interface PhotoFridgeItem {
  /** 图片地址 */
  src: string;
  /** 图片替代文本 */
  alt?: string;
  /** 照片标题（显示在图片下方） */
  title?: string;
  /** 照片说明（显示在标题下方） */
  description?: string;
}

/** PhotoFridge 组件属性 */
export interface PhotoFridgeProps {
  /** 磁贴照片列表 */
  photos: PhotoFridgeItem[];
  /** 组件宽度 */
  width?: number | string;
  /** 组件高度 */
  height?: number | string;
  /** 单张卡片宽度（px） */
  cardWidth?: number;
  /** 单张卡片高度（px） */
  cardHeight?: number;
  /** 散落程度，0 为紧凑，1 为默认散布，>1 更分散 */
  scatter?: number;
  /** 释放惯性摩擦系数，越大减速越快（指数衰减，默认 2.0） */
  friction?: number;
  /** 是否显示标题与说明 */
  showCaption?: boolean;
  /** 初始置于最前的照片索引 */
  initialIndex?: number;
  /** 点击照片回调（几乎无位移时触发） */
  onPhotoClick?: (index: number, photo: PhotoFridgeItem) => void;
  /** 无障碍名称 */
  ariaLabel?: string;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: StyleMap;
}
