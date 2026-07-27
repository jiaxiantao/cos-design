import type { ComponentCategory } from './categories';

export type { ComponentCategory };

export interface ComponentDemoItem {
  name: string;
  path: string;
  title: string;
  description: string;
  tags: string[];
  category: ComponentCategory;
  codeExample: string;
  isNew?: boolean;
}

export const componentDemos: ComponentDemoItem[] = [
  {
    name: 'WeatherBackground',
    path: '/weatherBackground',
    title: '天气背景',
    description: '多种天气场景，雨/雪/雾/冰雹/霾强度可调，支持接入 Open-Meteo 实况渲染。',
    tags: ['Canvas', '特效', 'API'],
    category: 'background' as const,
    codeExample: `import { WeatherBackground } from 'cos-design';

// 接入 Open-Meteo 实况：把 live 改为 true
<WeatherBackground
  weather="partlyCloudy"
  time="14:00"
  live={false}
  latitude={30.2741}
  longitude={120.1551}
  windLevel={3}
  rainLevel={5}
  snowLevel={5}
  hailLevel={2}
  fogLevel={2}
  smogLevel={2}
  loading={false}
  width={800}
  height={450}
/>`
  },
  {
    name: 'RippleWater',
    path: '/rippleWater',
    title: '水波纹',
    description: '真实感水面背景，点击后产生物理扩散的水花涟漪。',
    tags: ['WebGL', '交互'],
    category: 'background' as const,
    codeExample: `import { RippleWater } from 'cos-design';

<RippleWater
  width={800}
  height={500}
  fromColor="#52ade3"
  toColor="#013565"
  waveAmplitude={1}
  shimmer={1.2}
  rippleStrength={1.2}
/>`
  },
  {
    name: 'SmokeFog',
    path: '/smokeFog',
    title: '烟雾雾气',
    description: 'Canvas 噪声雾气缓慢飘动；点击画面可使雾气向外散开。',
    tags: ['Canvas', '特效'],
    category: 'background' as const,
    codeExample: `import { SmokeFog } from 'cos-design';

<SmokeFog width={800} height={500} density={0.5} speed={1} color="#d2d4d8" />`
  },
  {
    name: 'BubbleField',
    path: '/bubbleField',
    title: '气泡场',
    description: '深海气泡从海底生成并上升，相近气泡自动融合，带真实水下光影。',
    tags: ['Canvas', '交互'],
    category: 'background' as const,
    isNew: true,
    codeExample: `import { BubbleField } from 'cos-design';

<BubbleField width={800} height={500} bubbleCount={32} speed={1} />`
  },
  {
    name: 'MatrixRain',
    path: '/matrixRain',
    title: '黑客帝国数字雨',
    description: '经典 Matrix 风格数字雨背景动画。',
    tags: ['Canvas', '特效'],
    category: 'background' as const,
    codeExample: `import { MatrixRain } from 'cos-design';

<MatrixRain width={800} height={500} />`
  },
  {
    name: 'MeteorRain',
    path: '/meteorRain',
    title: '流星雨',
    description: 'Canvas 流星雨背景动画，适合登录页与活动页。',
    tags: ['Canvas', '特效'],
    category: 'background' as const,
    codeExample: `import { MeteorRain } from 'cos-design';

<MeteorRain width={800} height={500} />`
  },
  {
    name: 'ParticleNetwork',
    path: '/particleNetwork',
    title: '粒子网络',
    description: '粒子连线网络，鼠标靠近时产生排斥互动。',
    tags: ['Canvas', '交互'],
    category: 'background' as const,
    codeExample: `import { ParticleNetwork } from 'cos-design';

<ParticleNetwork width={800} height={500} />`
  },
  {
    name: 'Aurora',
    path: '/aurora',
    title: '极光背景',
    description: '流动渐变光带，柔和梦幻的背景氛围。',
    tags: ['CSS', '特效'],
    category: 'background' as const,
    codeExample: `import { Aurora } from 'cos-design';

<Aurora width={800} height={500} />`
  },
  {
    name: 'CyberGrid',
    path: '/cyberGrid',
    title: '赛博地面',
    description: 'Tron 风格透视网格无限滚动。',
    tags: ['Canvas', '特效'],
    category: 'background' as const,
    codeExample: `import { CyberGrid } from 'cos-design';

<CyberGrid width={800} height={500} />`
  },
  {
    name: 'Snowfall',
    path: '/snowfall',
    title: '飘落特效',
    description: '雪花或樱花瓣飘落，支持 mode 切换。',
    tags: ['Canvas', '特效'],
    category: 'background' as const,
    codeExample: `import { Snowfall } from 'cos-design';

<Snowfall mode="sakura" width={800} height={500} />`
  },
  {
    name: 'Starfield',
    path: '/starfield',
    title: '3D 星野',
    description: '纵深飞行的星空穿越效果。',
    tags: ['Canvas', '特效'],
    category: 'background' as const,
    codeExample: `import { Starfield } from 'cos-design';

<Starfield width={800} height={500} />`
  },
  {
    name: 'Typewriter',
    path: '/typewriter',
    title: '打字机',
    description: '终端风格打字机效果，支持多文案轮播。',
    tags: ['CSS', '文字'],
    category: 'text' as const,
    codeExample: `import { Typewriter } from 'cos-design';

<Typewriter texts={['Hello!']} />`
  },
  {
    name: 'NeonText',
    path: '/neonText',
    title: '霓虹灯文字',
    description: '赛博朋克风格霓虹发光文字。',
    tags: ['CSS', '特效'],
    category: 'text' as const,
    codeExample: `import { NeonText } from 'cos-design';

<NeonText text="COS DESIGN" color="#00f0ff" />`
  },
  {
    name: 'GlitchText',
    path: '/glitchText',
    title: '故障风文字',
    description: '赛博朋克故障闪烁文字。',
    tags: ['CSS', '文字'],
    category: 'text' as const,
    codeExample: `import { GlitchText } from 'cos-design';

<GlitchText text="SYSTEM ERROR" />`
  },
  {
    name: 'ScrambleText',
    path: '/scrambleText',
    title: '解密文字',
    description: '乱码逐字破解成目标文案。',
    tags: ['CSS', '文字'],
    category: 'text' as const,
    codeExample: `import { ScrambleText } from 'cos-design';

<ScrambleText text="ACCESS GRANTED" />`
  },
  {
    name: 'SplitReveal',
    path: '/splitReveal',
    title: '分裂入场',
    description: '每个字母从四个方向弹入。',
    tags: ['CSS', '动画'],
    category: 'text' as const,
    codeExample: `import { SplitReveal } from 'cos-design';

<SplitReveal text="WELCOME" />`
  },
  {
    name: 'WaveText',
    path: '/waveText',
    title: '波浪文字',
    description: '文字沿正弦波起伏动画。',
    tags: ['CSS', '动画'],
    category: 'text' as const,
    codeExample: `import { WaveText } from 'cos-design';

<WaveText text="WAVE" />`
  },
  {
    name: 'GradientFlow',
    path: '/gradientFlow',
    title: '流光文字',
    description: '渐变在文字上流动的现代效果。',
    tags: ['CSS', '文字'],
    category: 'text' as const,
    codeExample: `import { GradientFlow } from 'cos-design';

<GradientFlow text="FLOW" />`
  },
  {
    name: 'BurnAway',
    path: '/burnAway',
    title: '燃烧消失',
    description: '点击点燃，文字燃烧剥落消失。',
    tags: ['Canvas', '文字'],
    category: 'text' as const,
    codeExample: `import { BurnAway } from 'cos-design';

<BurnAway text="BURN" onComplete={() => {}} />`
  },
  {
    name: 'BarcodeScan',
    path: '/barcodeScan',
    title: '扫描线',
    description: '扫描线 + 故障风覆盖层。',
    tags: ['CSS', '特效'],
    category: 'text' as const,
    codeExample: `import { BarcodeScan } from 'cos-design';

<BarcodeScan>SCAN ME</BarcodeScan>`
  },
  {
    name: 'TextMorph',
    path: '/textMorph',
    title: '文字形变',
    description: '两段文案之间柔和模糊过渡，适合 Banner 标题轮播。',
    tags: ['CSS', '文字'],
    category: 'text' as const,
    isNew: true,
    codeExample: `import { TextMorph } from 'cos-design';

<TextMorph texts={['COS DESIGN', 'TEXT MORPH', 'SMOOTH TRANSITION']} />`
  },
  {
    name: 'SplitText',
    path: '/splitText',
    title: '拆字入场',
    description: '文字按字母拆分动画入场，支持 fadeUp/scale/rotate/blur 四种模式。',
    tags: ['CSS', '动画'],
    category: 'text' as const,
    isNew: true,
    codeExample: `import { SplitText } from 'cos-design';

<SplitText text="HELLO" animation="fadeUp" loop />`
  },
  {
    name: 'WaveButton',
    path: '/waveButton',
    title: '波纹按钮',
    description: '带水波扩散动画的交互按钮。',
    tags: ['CSS', '交互'],
    category: 'interactive' as const,
    codeExample: `import { WaveButton } from 'cos-design';

<WaveButton text="点我" />`
  },
  {
    name: 'Spotlight',
    path: '/spotlight',
    title: '手电筒',
    description: '暗层中鼠标位置挖洞照亮。',
    tags: ['CSS', '交互'],
    category: 'interactive' as const,
    codeExample: `import { Spotlight } from 'cos-design';

<Spotlight>隐藏内容</Spotlight>`
  },
  {
    name: 'MagneticButton',
    path: '/magneticButton',
    title: '磁吸按钮',
    description: '按钮随鼠标靠近磁吸偏移。',
    tags: ['CSS', '交互'],
    category: 'interactive' as const,
    codeExample: `import { MagneticButton } from 'cos-design';

<MagneticButton>磁吸我</MagneticButton>`
  },
  {
    name: 'HolographicCard',
    path: '/holographicCard',
    title: '全息卡片',
    description: '倾斜时彩虹反光的 3D 卡片。',
    tags: ['CSS', '3D'],
    category: 'interactive' as const,
    codeExample: `import { HolographicCard } from 'cos-design';

<HolographicCard title="VIP" subtitle="全息会员卡" />`
  },
  {
    name: 'ClickSpark',
    path: '/clickSpark',
    title: '点击火花',
    description: '点击处迸出轻量粒子火花。',
    tags: ['Canvas', '交互'],
    category: 'interactive' as const,
    codeExample: `import { ClickSpark } from 'cos-design';

<ClickSpark>点击任意位置</ClickSpark>`
  },
  {
    name: 'CursorTrail',
    path: '/cursorTrail',
    title: '光标拖尾',
    description: '鼠标后跟随粒子光点拖尾。',
    tags: ['Canvas', '交互'],
    category: 'interactive' as const,
    codeExample: `import { CursorTrail } from 'cos-design';

<CursorTrail width={800} height={500} />`
  },
  {
    name: 'LiquidGlass',
    path: '/liquidGlass',
    title: '液态玻璃',
    description: 'Apple 风毛玻璃面板效果。',
    tags: ['CSS', '特效'],
    category: 'interactive' as const,
    codeExample: `import { LiquidGlass } from 'cos-design';

<LiquidGlass>毛玻璃内容</LiquidGlass>`
  },
  {
    name: 'Turntable',
    path: '/turntable',
    title: '抽奖转盘',
    description: '可交互抽奖转盘，支持自定义奖品。',
    tags: ['Canvas', '交互'],
    category: 'game' as const,
    codeExample: `import { Turntable } from 'cos-design';

<Turntable prizes={[{ label: '一等奖' }]} />`
  },
  {
    name: 'Confetti',
    path: '/confetti',
    title: '彩纸庆祝',
    description: 'Canvas 彩纸喷射，适合中奖庆祝。',
    tags: ['Canvas', '交互'],
    category: 'game' as const,
    codeExample: `import { Confetti } from 'cos-design';

<Confetti auto={false} />`
  },
  {
    name: 'Charge',
    path: '/charge',
    title: '充电特效',
    description: '电量充电动画，支持受控模式。',
    tags: ['CSS', '动画'],
    category: 'game' as const,
    codeExample: `import { Charge } from 'cos-design';

<Charge value={50} autoCharge={false} />`
  },
  {
    name: 'ScratchCard',
    path: '/scratchCard',
    title: '刮刮乐',
    description: 'Canvas 刮开涂层露出奖品。',
    tags: ['Canvas', '交互'],
    category: 'game' as const,
    codeExample: `import { ScratchCard } from 'cos-design';

<ScratchCard prize="🎉 恭喜中奖！" />`
  },
  {
    name: 'SlotMachine',
    path: '/slotMachine',
    title: '老虎机',
    description: '三列滚轮停下对齐的抽奖玩法。',
    tags: ['CSS', '交互'],
    category: 'game' as const,
    codeExample: `import { SlotMachine } from 'cos-design';

<SlotMachine />`
  },
  {
    name: 'DiceRoll',
    path: '/diceRoll',
    title: '掷骰子',
    description: '3D CSS 骰子翻滚出点数。',
    tags: ['CSS', '3D'],
    category: 'game' as const,
    codeExample: `import { DiceRoll } from 'cos-design';

<DiceRoll onRoll={(n) => console.log(n)} />`
  },
  {
    name: 'RedPacketRain',
    path: '/redPacketRain',
    title: '红包雨',
    description: '红包从上掉落，点击抢夺。',
    tags: ['Canvas', '交互'],
    category: 'game' as const,
    codeExample: `import { RedPacketRain } from 'cos-design';

<RedPacketRain />`
  },
  {
    name: 'ProgressChest',
    path: '/progressChest',
    title: '宝箱进度',
    description: '进度满后宝箱打开动画。',
    tags: ['CSS', '动画'],
    category: 'game' as const,
    codeExample: `import { ProgressChest } from 'cos-design';

<ProgressChest progress={75} />`
  },
  {
    name: 'RadarScan',
    path: '/radarScan',
    title: '雷达扫描',
    description: '圆形雷达光点扫描 HUD。',
    tags: ['Canvas', '特效'],
    category: 'game' as const,
    codeExample: `import { RadarScan } from 'cos-design';

<RadarScan size={280} />`
  },
  {
    name: 'CanvasClock',
    path: '/canvasClock',
    title: '画布时钟',
    description: '基于 Canvas 绘制的模拟时钟。',
    tags: ['Canvas', '动画'],
    category: 'data' as const,
    codeExample: `import { CanvasClock } from 'cos-design';

<CanvasClock width={400} height={400} />`
  },
  {
    name: 'FlipCounter',
    path: '/flipCounter',
    title: '数字翻牌器',
    description: '机械翻牌风格数字展示。',
    tags: ['CSS', '动画'],
    category: 'data' as const,
    codeExample: `import { FlipCounter } from 'cos-design';

<FlipCounter value={12345} digits={5} />`
  },
  {
    name: 'Countdown',
    path: '/countdown',
    title: '倒计时',
    description: '活动截止倒计时，支持结束回调。',
    tags: ['CSS', '交互'],
    category: 'data' as const,
    codeExample: `import { Countdown } from 'cos-design';

<Countdown targetDate="2026-12-31T23:59:59" />`
  },
  {
    name: 'CountUp',
    path: '/countUp',
    title: '数字递增',
    description: '带缓动的数字增长动画，适合指标卡片和运营大屏。',
    tags: ['CSS', '数据'],
    category: 'data' as const,
    isNew: true,
    codeExample: `import { CountUp } from 'cos-design';

<CountUp value={128560} prefix="$" duration={1800} />`
  },
  {
    name: 'LiquidProgress',
    path: '/liquidProgress',
    title: '液体进度环',
    description: '圆环内液体晃荡填充的进度。',
    tags: ['SVG', '动画'],
    category: 'data' as const,
    codeExample: `import { LiquidProgress } from 'cos-design';

<LiquidProgress value={65} />`
  },
  {
    name: 'AudioVisualizer',
    path: '/audioVisualizer',
    title: '音频可视化',
    description: '柱状波形随音频跳动。',
    tags: ['Canvas', '音频'],
    category: 'data' as const,
    codeExample: `import { AudioVisualizer } from 'cos-design';

<AudioVisualizer width={400} height={200} />`
  },
  {
    name: 'Speedometer',
    path: '/speedometer',
    title: '仪表盘',
    description: '指针弧线仪表盘动画。',
    tags: ['SVG', '动画'],
    category: 'data' as const,
    codeExample: `import { Speedometer } from 'cos-design';

<Speedometer value={72} max={120} label="km/h" />`
  },
  {
    name: 'TimelinePulse',
    path: '/timelinePulse',
    title: '时间轴脉冲',
    description: '横向时间轴当前节点发光。',
    tags: ['CSS', '动画'],
    category: 'data' as const,
    codeExample: `import { TimelinePulse } from 'cos-design';

<TimelinePulse steps={['设计','开发','测试','上线']} current={1} />`
  },
  {
    name: 'OrbitalChart',
    path: '/orbitalChart',
    title: '轨道图',
    description: '圆环上小球公转表示占比。',
    tags: ['SVG', '动画'],
    category: 'data' as const,
    codeExample: `import { OrbitalChart } from 'cos-design';

<OrbitalChart data={[{ label: 'A', value: 40, color: '#38bdf8' }]} />`
  },
  {
    name: 'NetworkGraph',
    path: '/networkGraph',
    title: '关系网络图',
    description: '力导向节点关系网络，支持拖拽节点交互。',
    tags: ['Canvas', '数据'],
    category: 'data' as const,
    isNew: true,
    codeExample: `import { NetworkGraph } from 'cos-design';

<NetworkGraph width={600} height={420} />`
  },
  {
    name: 'NewtonCradle',
    path: '/newtonCradle',
    title: '牛顿摆',
    description: '经典小球碰撞摆动动画。',
    tags: ['CSS', '物理'],
    category: 'physics' as const,
    codeExample: `import { NewtonCradle } from 'cos-design';

<NewtonCradle ballCount={5} />`
  },
  {
    name: 'GravityBalls',
    path: '/gravityBalls',
    title: '重力球池',
    description: '容器内小球受重力碰撞。',
    tags: ['Canvas', '物理'],
    category: 'physics' as const,
    codeExample: `import { GravityBalls } from 'cos-design';

<GravityBalls width={600} height={400} />`
  },
  {
    name: 'SandFall',
    path: '/sandFall',
    title: '像素沙落',
    description: '按住鼠标在画布绘制沙粒，模拟重力下落堆积。',
    tags: ['Canvas', '物理'],
    category: 'physics' as const,
    isNew: true,
    codeExample: `import { SandFall } from 'cos-design';

<SandFall width={480} height={400} cellSize={4} />`
  },
  {
    name: 'SpringMass',
    path: '/springMass',
    title: '弹簧质点网格',
    description: '二维弹簧质点网格，四角固定，拖拽中间质点观察整体回弹。',
    tags: ['Canvas', '物理'],
    category: 'physics' as const,
    isNew: true,
    codeExample: `import { SpringMass } from 'cos-design';

<SpringMass width={560} height={400} cols={6} rows={5} />`
  },
  {
    name: 'DoublePendulum',
    path: '/doublePendulum',
    title: '双摆混沌',
    description: '双摆混沌轨迹，展现经典力学中的蝴蝶效应。',
    tags: ['Canvas', '物理'],
    category: 'physics' as const,
    codeExample: `import { DoublePendulum } from 'cos-design';

<DoublePendulum width={400} height={400} />`
  },
  {
    name: 'MetaballPool',
    path: '/metaballPool',
    title: '液态融合球',
    description: 'Metaball 软球融合，鼠标推开液体。',
    tags: ['Canvas', '物理'],
    category: 'physics' as const,
    codeExample: `import { MetaballPool } from 'cos-design';

<MetaballPool width={500} height={320} />`
  },
  {
    name: 'RopeChain',
    path: '/ropeChain',
    title: '绳索链条',
    description: 'Verlet 积分绳索，拖拽摆动。',
    tags: ['Canvas', '物理'],
    category: 'physics' as const,
    codeExample: `import { RopeChain } from 'cos-design';

<RopeChain width={400} height={400} segments={16} />`
  },
  {
    name: 'DnaHelix',
    path: '/dnaHelix',
    title: 'DNA 双螺旋',
    description: '旋转的双螺旋结构。',
    tags: ['Canvas', '3D'],
    category: 'science' as const,
    codeExample: `import { DnaHelix } from 'cos-design';

<DnaHelix width={300} height={500} />`
  },
  {
    name: 'SolarSystem',
    path: '/solarSystem',
    title: '太阳系',
    description: '行星公转与月球绕地，含土星环。',
    tags: ['Canvas', '天文'],
    category: 'science' as const,
    codeExample: `import { SolarSystem } from 'cos-design';

<SolarSystem width={400} height={400} speed={1.2} />`
  },
  {
    name: 'LorenzAttractor',
    path: '/lorenzAttractor',
    title: '洛伦兹吸引子',
    description: '3D 混沌蝴蝶轨迹，缓慢旋转展示。',
    tags: ['Canvas', '数学'],
    category: 'science' as const,
    codeExample: `import { LorenzAttractor } from 'cos-design';

<LorenzAttractor width={400} height={360} />`
  },
  {
    name: 'MazeGenerator',
    path: '/mazeGenerator',
    title: '迷宫生成',
    description: '实时 DFS 生成并绘制迷宫。',
    tags: ['Canvas', '算法'],
    category: 'science' as const,
    codeExample: `import { MazeGenerator } from 'cos-design';

<MazeGenerator width={400} height={400} />`
  },
  {
    name: 'GameOfLife',
    path: '/gameOfLife',
    title: '生命游戏',
    description: '经典 Conway 生命游戏，支持暂停、随机重置与点击布种。',
    tags: ['Canvas', '算法'],
    category: 'science' as const,
    isNew: true,
    codeExample: `import { GameOfLife } from 'cos-design';

<GameOfLife width={560} height={420} cellSize={14} speed={120} />`
  },
  {
    name: 'Fireworks',
    path: '/fireworks',
    title: '烟花特效',
    description: 'Canvas 烟花燃放，支持 ref 触发。',
    tags: ['Canvas', '交互'],
    category: 'effect' as const,
    codeExample: `import { Fireworks } from 'cos-design';

<Fireworks auto={false} />`
  },
  {
    name: 'ReturnCity',
    path: '/returnCity',
    title: '回城特效',
    description: '星空与光壁环绕的回城传送视觉。',
    tags: ['CSS', '3D'],
    category: 'effect' as const,
    codeExample: `import { ReturnCity } from 'cos-design';

<ReturnCity />`
  },
  {
    name: 'ElectricArc',
    path: '/electricArc',
    title: '电弧',
    description: '两点间随机闪电连接。',
    tags: ['Canvas', '特效'],
    category: 'effect' as const,
    codeExample: `import { ElectricArc } from 'cos-design';

<ElectricArc width={400} height={200} />`
  },
  {
    name: 'PlasmaBall',
    path: '/plasmaBall',
    title: '等离子球',
    description: '静电球效果，鼠标吸引电弧。',
    tags: ['Canvas', '交互'],
    category: 'effect' as const,
    codeExample: `import { PlasmaBall } from 'cos-design';

<PlasmaBall width={320} height={320} />`
  }
];
