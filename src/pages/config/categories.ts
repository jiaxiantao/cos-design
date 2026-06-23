export type ComponentCategory = 'background' | 'text' | 'interactive' | 'game' | 'data' | 'physics';

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
    label: '物理创意',
    description: '物理模拟与脑洞视觉实验',
    accent: '#fb923c'
  }
];

export const getCategoryMeta = (id: ComponentCategory) => COMPONENT_CATEGORIES.find((c) => c.id === id)!;
