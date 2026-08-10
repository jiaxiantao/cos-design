import type { CSSProperties } from 'react';

export interface PhotoAlbumItem {
  /** 图片地址 */
  src: string;
  /** 图片替代文本 */
  alt?: string;
  /** 照片标题 */
  title?: string;
  /** 照片说明 */
  description?: string;
}

export interface PhotoAlbumLabels {
  /** 上一页按钮标签 */
  previous?: string;
  /** 下一页按钮标签 */
  next?: string;
  /** 空相册提示 */
  empty?: string;
  /** 首页飞页主标题 */
  flyleafTitle?: string;
  /** 首页飞页副标题 */
  flyleafSubtitle?: string;
  /** 尾页飞页主标题 */
  flyleafEndTitle?: string;
  /** 尾页飞页副标题 */
  flyleafEndSubtitle?: string;
}

export interface PhotoAlbumProps {
  /** 相册照片列表 */
  photos: PhotoAlbumItem[];
  /** 相册宽度 */
  width?: number | string;
  /** 相册高度 */
  height?: number | string;
  /** 初始右页照片索引（摊开为左 index-1 / 右 index；每次翻页翻过一叶两面） */
  initialIndex?: number;
  /** 单次翻页动画时长（毫秒） */
  pageTurnDuration?: number;
  /** 照片填充方式 */
  objectFit?: CSSProperties['objectFit'];
  /** 是否显示页码 */
  showPageNumber?: boolean;
  /** 相纸颜色 */
  pageColor?: string;
  /** 封皮颜色 */
  coverColor?: string;
  /** 相册无障碍名称 */
  ariaLabel?: string;
  /** 内置文案 */
  labels?: PhotoAlbumLabels;
  /** 当前照片变化回调 */
  onPageChange?: (index: number, photo: PhotoAlbumItem) => void;
  /** 当前照片变化回调别名（与其他 photo 组件对齐） */
  onIndexChange?: (index: number, photo: PhotoAlbumItem) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: CSSProperties;
}
