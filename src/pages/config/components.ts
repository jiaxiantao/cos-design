export interface ComponentDemoItem {
  name: string;
  path: string;
  title: string;
  description: string;
  tags: string[];
  codeExample: string;
}

export const componentDemos: ComponentDemoItem[] = [
  {
    name: 'CanvasClock',
    path: '/canvasClock',
    title: '画布时钟',
    description: '基于 Canvas 绘制的模拟时钟，支持自定义宽高。',
    tags: ['Canvas', '动画'],
    codeExample: `import { CanvasClock } from 'cos-design';

<CanvasClock width={400} height={400} />`
  },
  {
    name: 'Charge',
    path: '/charge',
    title: '充电特效',
    description: '电量充电动画效果，支持设置初始电量。',
    tags: ['CSS', '动画'],
    codeExample: `import { Charge } from 'cos-design';

// 非受控：从 0 自动充电
<Charge initQuantity={0} />

// 受控：外部控制电量
<Charge value={quantity} onChange={setQuantity} autoCharge={false} />`
  },
  {
    name: 'ReturnCity',
    path: '/returnCity',
    title: '回城特效',
    description: '星空与光壁环绕的回城传送视觉效果。',
    tags: ['CSS', '3D'],
    codeExample: `import { ReturnCity } from 'cos-design';

<ReturnCity starCount={80} glassCount={8} glassRadius={180} />`
  },
  {
    name: 'Turntable',
    path: '/turntable',
    title: '抽奖转盘',
    description: '可交互抽奖转盘，支持自定义奖品、旋转动画与结果回调。',
    tags: ['Canvas', '交互'],
    codeExample: `import { Turntable } from 'cos-design';

<Turntable
  prizes={[{ label: '一等奖' }, { label: '二等奖' }, { label: '谢谢参与' }]}
  onSpinEnd={(prize) => console.log(prize.label)}
/>`
  },
  {
    name: 'Fireworks',
    path: '/fireworks',
    title: '烟花特效',
    description: 'Canvas 烟花燃放，支持自动播放与点击触发。',
    tags: ['Canvas', '交互'],
    codeExample: `import { useRef } from 'react';
import { Fireworks, type FireworksHandle } from 'cos-design';

const ref = useRef<FireworksHandle>(null);

<Fireworks ref={ref} auto={false} />
<button onClick={() => ref.current?.launch()}>燃放</button>`
  },
  {
    name: 'MatrixRain',
    path: '/matrixRain',
    title: '黑客帝国数字雨',
    description: '经典 Matrix 风格数字雨背景动画。',
    tags: ['Canvas', '特效'],
    codeExample: `import { MatrixRain } from 'cos-design';

<MatrixRain width={800} height={500} />`
  },
  {
    name: 'ParticleNetwork',
    path: '/particleNetwork',
    title: '粒子网络',
    description: '粒子连线网络，鼠标靠近时产生排斥互动效果。',
    tags: ['Canvas', '交互'],
    codeExample: `import { ParticleNetwork } from 'cos-design';

<ParticleNetwork width={800} height={500} particleCount={80} />`
  },
  {
    name: 'Typewriter',
    path: '/typewriter',
    title: '打字机',
    description: '终端风格打字机效果，支持多文案轮播。',
    tags: ['CSS', '文字'],
    codeExample: `import { Typewriter } from 'cos-design';

<Typewriter texts={['Hello, cos-design!', '视觉特效组件库']} />`
  },
  {
    name: 'NeonText',
    path: '/neonText',
    title: '霓虹灯文字',
    description: '赛博朋克风格霓虹发光文字，支持自定义颜色与闪烁。',
    tags: ['CSS', '特效'],
    codeExample: `import { NeonText } from 'cos-design';

<NeonText text="COS DESIGN" color="#00f0ff" fontSize={64} flicker />`
  },
  {
    name: 'WaveButton',
    path: '/waveButton',
    title: '波纹按钮',
    description: '带水波扩散动画的交互按钮。',
    tags: ['CSS', '交互'],
    codeExample: `import { WaveButton } from 'cos-design';

<WaveButton text="点击我" onClick={() => alert('clicked')} />`
  },
  {
    name: 'FlipCounter',
    path: '/flipCounter',
    title: '数字翻牌器',
    description: '机械翻牌风格的数字展示，适合数据大屏与统计面板。',
    tags: ['CSS', '动画'],
    codeExample: `import { FlipCounter } from 'cos-design';

<FlipCounter value={12345} digits={5} color="#38bdf8" />`
  },
  {
    name: 'Countdown',
    path: '/countdown',
    title: '倒计时',
    description: '活动截止倒计时，支持自定义目标时间与结束回调。',
    tags: ['CSS', '交互'],
    codeExample: `import { Countdown } from 'cos-design';

<Countdown
  targetDate="2026-12-31T23:59:59"
  color="#f472b6"
  onEnd={() => console.log('倒计时结束')}
/>`
  },
  {
    name: 'Confetti',
    path: '/confetti',
    title: '彩纸庆祝',
    description: 'Canvas 彩纸喷射特效，适合中奖、完成任务的庆祝反馈。',
    tags: ['Canvas', '交互'],
    codeExample: `import { useRef } from 'react';
import { Confetti, type ConfettiHandle } from 'cos-design';

const ref = useRef<ConfettiHandle>(null);

<Confetti ref={ref} auto={false} />
<button onClick={() => ref.current?.burst()}>庆祝</button>`
  },
  {
    name: 'GlitchText',
    path: '/glitchText',
    title: '故障风文字',
    description: '赛博朋克故障闪烁文字，适合科技风标题与 Banner。',
    tags: ['CSS', '文字'],
    codeExample: `import { GlitchText } from 'cos-design';

<GlitchText text="SYSTEM ERROR" fontSize={56} glitchColor1="#ff00de" />`
  },
  {
    name: 'MeteorRain',
    path: '/meteorRain',
    title: '流星雨',
    description: 'Canvas 流星雨背景动画，适合登录页与活动页背景。',
    tags: ['Canvas', '特效'],
    codeExample: `import { MeteorRain } from 'cos-design';

<MeteorRain width={800} height={500} meteorCount={10} />`
  }
];
