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
    title: '抽奖转盘',
    description: '可交互抽奖转盘，支持自定义奖品、旋转动画与结果回调。',
    tags: ['Canvas', '交互']
  },
  {
    name: 'Fireworks',
    path: '/fireworks',
    title: '烟花特效',
    description: 'Canvas 烟花燃放，支持自动播放与点击触发。',
    tags: ['Canvas', '交互']
  },
  {
    name: 'MatrixRain',
    path: '/matrixRain',
    title: '黑客帝国数字雨',
    description: '经典 Matrix 风格数字雨背景动画。',
    tags: ['Canvas', '特效']
  },
  {
    name: 'ParticleNetwork',
    path: '/particleNetwork',
    title: '粒子网络',
    description: '粒子连线网络，鼠标靠近时产生排斥互动效果。',
    tags: ['Canvas', '交互']
  },
  {
    name: 'Typewriter',
    path: '/typewriter',
    title: '打字机',
    description: '终端风格打字机效果，支持多文案轮播。',
    tags: ['CSS', '文字']
  },
  {
    name: 'NeonText',
    path: '/neonText',
    title: '霓虹灯文字',
    description: '赛博朋克风格霓虹发光文字，支持自定义颜色与闪烁。',
    tags: ['CSS', '特效']
  },
  {
    name: 'WaveButton',
    path: '/waveButton',
    title: '波纹按钮',
    description: '带水波扩散动画的交互按钮。',
    tags: ['CSS', '交互']
  }
];
