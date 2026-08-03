export type ComponentCategory =
  | 'background'
  | 'text'
  | 'photo'
  | 'interactive'
  | 'game'
  | 'data'
  | 'physics'
  | 'science'
  | 'effect';

export interface CategoryMeta {
  id: ComponentCategory;
  label: string;
  description: string;
  accent: string;
}

export const COMPONENT_CATEGORIES: CategoryMeta[] = [
  {
    id: 'background',
    label: '背景动效',
    description: 'Canvas / CSS 动态背景与粒子场景',
    accent: '#38bdf8'
  },
  {
    id: 'text',
    label: '文字动效',
    description: '标题、Banner 与终端风格文字动画',
    accent: '#f472b6'
  },
  {
    id: 'photo',
    label: '图片预览',
    description: '相册、走马灯、晾绳等物件隐喻式图片浏览',
    accent: '#f59e0b'
  },
  {
    id: 'interactive',
    label: '交互玩具',
    description: '鼠标、触摸驱动的趣味交互组件',
    accent: '#a78bfa'
  },
  {
    id: 'game',
    label: '游戏营销',
    description: '抽奖、庆祝与活动页玩法组件',
    accent: '#fbbf24'
  },
  {
    id: 'data',
    label: '数据装饰',
    description: '大屏、仪表盘与时间数据展示',
    accent: '#34d399'
  },
  {
    id: 'physics',
    label: '物理模拟',
    description: '重力、弹簧、碰撞等真实物理互动',
    accent: '#fb923c'
  },
  {
    id: 'science',
    label: '科学算法',
    description: '天文、混沌、细胞自动机与算法可视化',
    accent: '#22d3ee'
  },
  {
    id: 'effect',
    label: '视觉特效',
    description: '烟花、电弧、传送门等视觉实验效果',
    accent: '#e879f9'
  }
];

export const getCategoryMeta = (id: ComponentCategory) => COMPONENT_CATEGORIES.find((c) => c.id === id)!;
