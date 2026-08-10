/** 图片预览组件通用照片项 */
export interface PhotoItem {
  /** 图片地址 */
  src: string;
  /** 图片替代文本 */
  alt?: string;
  /** 照片标题 */
  title?: string;
  /** 照片说明 */
  description?: string;
}

/** 线性浏览：当前索引变化（相册 / 胶卷 / 晾绳等） */
export type PhotoIndexChangeHandler<T = PhotoItem> = (index: number, photo: T) => void;

/** 环形浏览：正对镜头的面变化（走马灯 / 旋转木马等） */
export type PhotoFaceChangeHandler<T = PhotoItem> = (index: number, photo?: T) => void;
