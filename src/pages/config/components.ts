export interface ComponentDemoItem {
  name: string;
  path: string;
  title: string;
  description: string;
  tags: string[];
}

export const componentDemos: ComponentDemoItem[] = [
  {
    name: 'CanvasClock',
    path: '/canvasClock',
    title: '画布时钟',
    description: '基于 Canvas 绘制的模拟时钟，支持自定义宽高。',
    tags: ['Canvas', '动画']
  },
  {
    name: 'Charge',
    path: '/charge',
    title: '充电特效',
    description: '电量充电动画效果，支持设置初始电量。',
    tags: ['CSS', '动画']
  },
  {
    name: 'ReturnCity',
    path: '/returnCity',
    title: '回城特效',
    description: '星空与光壁环绕的回城传送视觉效果。',
    tags: ['CSS', '3D']
  },
  {
    name: 'Turntable',
    path: '/turntable',
    title: '转盘',
    description: '可交互抽奖转盘，支持自定义奖品、旋转动画与结果回调。',
    tags: ['Canvas', '动画']
  }
];
