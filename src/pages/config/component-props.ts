// 此文件由 scripts/extract-component-props.mjs 自动生成，请勿手动编辑
// 运行 pnpm extract-props 更新

export interface ComponentPropDoc {
  name: string;
  type: string;
  required: boolean;
  default: string;
  description: string;
}

export type ComponentPropsMap = Record<string, ComponentPropDoc[]>;

export const componentProps: ComponentPropsMap = {
  AudioVisualizer: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '400',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '120',
      description: ''
    },
    {
      name: 'barCount',
      type: 'number',
      required: false,
      default: '32',
      description: ''
    },
    {
      name: 'useMic',
      type: 'boolean',
      required: false,
      default: 'false',
      description: ''
    }
  ],
  Aurora: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '800',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '500',
      description: ''
    },
    {
      name: 'colors',
      type: 'string[]',
      required: false,
      default: 'DEFAULT_COLORS',
      description: '极光色带，默认绿/青/紫'
    }
  ],
  BarcodeScan: [
    {
      name: 'children',
      type: 'React.ReactNode',
      required: false,
      default: '',
      description: '包裹内容'
    },
    {
      name: 'scanColor',
      type: 'string',
      required: false,
      default: "'#22c55e'",
      description: '扫描线颜色'
    },
    {
      name: 'speed',
      type: 'number',
      required: false,
      default: '2.5',
      description: '扫描速度（秒/次）'
    }
  ],
  BurnAway: [
    {
      name: 'text',
      type: 'string',
      required: false,
      default: "'BURN'",
      description: '显示文字'
    },
    {
      name: 'fontSize',
      type: 'number',
      required: false,
      default: '64',
      description: '字号'
    },
    {
      name: 'onComplete',
      type: '() => void',
      required: false,
      default: '',
      description: '燃烧完成回调'
    }
  ],
  CanvasClock: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '400',
      description: '画布宽度（与 height 取较小值作为正方形边长）'
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '400',
      description: '画布高度（与 width 取较小值作为正方形边长）'
    }
  ],
  Charge: [
    {
      name: 'initQuantity',
      type: 'number',
      required: false,
      default: '0',
      description: '初始电量（非受控），默认 0'
    },
    {
      name: 'value',
      type: 'number',
      required: false,
      default: '',
      description: '受控电量 0–100'
    },
    {
      name: 'onChange',
      type: '(value: number) => void',
      required: false,
      default: '',
      description: '电量变化回调'
    },
    {
      name: 'autoCharge',
      type: 'boolean',
      required: false,
      default: 'true',
      description: '是否自动充电，默认 true'
    },
    {
      name: 'interval',
      type: 'number',
      required: false,
      default: '500',
      description: '充电间隔（毫秒），默认 500'
    },
    {
      name: 'step',
      type: 'number',
      required: false,
      default: '0.01',
      description: '每次增量，默认 0.01'
    }
  ],
  ClickSpark: [
    {
      name: 'children',
      type: 'React.ReactNode',
      required: false,
      default: '',
      description: ''
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#fbbf24'",
      description: '火花颜色'
    },
    {
      name: 'count',
      type: 'number',
      required: false,
      default: '16',
      description: '每次点击粒子数，默认 16'
    }
  ],
  Confetti: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '',
      description: ''
    },
    {
      name: 'auto',
      type: 'boolean',
      required: false,
      default: '',
      description: '挂载后自动播放，默认 true'
    },
    {
      name: 'particleCount',
      type: 'number',
      required: false,
      default: '',
      description: '每次喷射粒子数，默认 120'
    }
  ],
  Countdown: [
    {
      name: 'targetDate',
      type: 'Date | string | number',
      required: true,
      default: '',
      description: '目标时间（Date、时间戳或 ISO 字符串）'
    },
    {
      name: 'onEnd',
      type: '() => void',
      required: false,
      default: '',
      description: '倒计时结束回调'
    },
    {
      name: 'showLabels',
      type: 'boolean',
      required: false,
      default: 'true',
      description: '是否显示单位标签，默认 true'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#f472b6'",
      description: '主色'
    }
  ],
  CursorTrail: [
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#38bdf8'",
      description: '轨迹颜色'
    },
    {
      name: 'length',
      type: 'number',
      required: false,
      default: '20',
      description: '轨迹长度，默认 20'
    },
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '800',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '400',
      description: ''
    }
  ],
  CyberGrid: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '800',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '500',
      description: ''
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#00f0ff'",
      description: '网格线颜色'
    },
    {
      name: 'speed',
      type: 'number',
      required: false,
      default: '1',
      description: '移动速度，默认 1'
    }
  ],
  DiceRoll: [
    {
      name: 'onRoll',
      type: '(value: number) => void',
      required: false,
      default: '',
      description: '掷骰结束回调'
    },
    {
      name: 'sides',
      type: '6',
      required: false,
      default: '6',
      description: '骰子面数，默认 6'
    }
  ],
  DnaHelix: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '200',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '360',
      description: ''
    },
    {
      name: 'speed',
      type: 'number',
      required: false,
      default: '1',
      description: ''
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#38bdf8'",
      description: ''
    }
  ],
  DoublePendulum: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '400',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '400',
      description: ''
    },
    {
      name: 'trailLength',
      type: 'number',
      required: false,
      default: '120',
      description: ''
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#38bdf8'",
      description: ''
    },
    {
      name: 'color2',
      type: 'string',
      required: false,
      default: "'#a78bfa'",
      description: ''
    }
  ],
  ElectricArc: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '320',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '160',
      description: ''
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#67e8f9'",
      description: ''
    }
  ],
  Fireworks: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '',
      description: ''
    },
    {
      name: 'auto',
      type: 'boolean',
      required: false,
      default: '',
      description: '是否自动燃放，默认 true'
    }
  ],
  FlipCounter: [
    {
      name: 'value',
      type: 'number',
      required: true,
      default: '',
      description: '显示数值'
    },
    {
      name: 'digits',
      type: 'number',
      required: false,
      default: '4',
      description: '最少位数（左侧补零），默认 4'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#38bdf8'",
      description: '主色'
    },
    {
      name: 'duration',
      type: 'number',
      required: false,
      default: '600',
      description: '翻牌动画时长（毫秒），默认 600'
    }
  ],
  GlitchText: [
    {
      name: 'text',
      type: 'string',
      required: false,
      default: "'GLITCH'",
      description: '显示文字'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#f8fafc'",
      description: '主色'
    },
    {
      name: 'glitchColor1',
      type: 'string',
      required: false,
      default: "'#ff00de'",
      description: '故障色 1'
    },
    {
      name: 'glitchColor2',
      type: 'string',
      required: false,
      default: "'#00f0ff'",
      description: '故障色 2'
    },
    {
      name: 'fontSize',
      type: 'number',
      required: false,
      default: '64',
      description: '字号'
    }
  ],
  GradientFlow: [
    {
      name: 'text',
      type: 'string',
      required: false,
      default: "'GRADIENT'",
      description: '显示文字'
    },
    {
      name: 'colors',
      type: 'string[]',
      required: false,
      default: 'DEFAULT_COLORS',
      description: '渐变色列表'
    },
    {
      name: 'fontSize',
      type: 'number',
      required: false,
      default: '64',
      description: '字号'
    }
  ],
  GravityBalls: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '400',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '300',
      description: ''
    },
    {
      name: 'ballCount',
      type: 'number',
      required: false,
      default: '12',
      description: ''
    }
  ],
  HolographicCard: [
    {
      name: 'title',
      type: 'string',
      required: false,
      default: "'全息卡片'",
      description: ''
    },
    {
      name: 'subtitle',
      type: 'string',
      required: false,
      default: "'移动鼠标体验 3D 效果'",
      description: ''
    },
    {
      name: 'image',
      type: 'string',
      required: false,
      default: '',
      description: ''
    }
  ],
  LiquidGlass: [
    {
      name: 'children',
      type: 'React.ReactNode',
      required: false,
      default: "'液态玻璃面板'",
      description: ''
    },
    {
      name: 'blur',
      type: 'number',
      required: false,
      default: '16',
      description: '模糊强度，默认 16'
    },
    {
      name: 'borderRadius',
      type: 'number',
      required: false,
      default: '20',
      description: '圆角，默认 20'
    }
  ],
  LiquidProgress: [
    {
      name: 'value',
      type: 'number',
      required: false,
      default: '0',
      description: ''
    },
    {
      name: 'max',
      type: 'number',
      required: false,
      default: '100',
      description: ''
    },
    {
      name: 'size',
      type: 'number',
      required: false,
      default: '160',
      description: ''
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#38bdf8'",
      description: ''
    }
  ],
  LorenzAttractor: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '400',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '360',
      description: ''
    },
    {
      name: 'speed',
      type: 'number',
      required: false,
      default: '1',
      description: ''
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#f472b6'",
      description: ''
    },
    {
      name: 'pointCount',
      type: 'number',
      required: false,
      default: '2000',
      description: ''
    }
  ],
  MagneticButton: [
    {
      name: 'children',
      type: 'React.ReactNode',
      required: false,
      default: "'磁吸按钮'",
      description: ''
    },
    {
      name: 'strength',
      type: 'number',
      required: false,
      default: '0.4',
      description: '磁力强度 0–1，默认 0.4'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#6366f1'",
      description: '按钮颜色'
    }
  ],
  MatrixRain: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '800',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '500',
      description: ''
    },
    {
      name: 'density',
      type: 'number',
      required: false,
      default: '0.6',
      description: '列密度 0~1，默认 0.6'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#00ff41'",
      description: '主色调'
    },
    {
      name: 'showOverlay',
      type: 'boolean',
      required: false,
      default: 'true',
      description: '是否显示标题叠层，默认 true'
    },
    {
      name: 'title',
      type: 'string',
      required: false,
      default: "'MATRIX'",
      description: '叠层标题'
    },
    {
      name: 'subtitle',
      type: 'string',
      required: false,
      default: "'数字雨效果'",
      description: '叠层副标题'
    }
  ],
  MazeGenerator: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '400',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '300',
      description: ''
    },
    {
      name: 'cellSize',
      type: 'number',
      required: false,
      default: '20',
      description: ''
    },
    {
      name: 'onGenerated',
      type: '(cols: number, rows: number) => void',
      required: false,
      default: '',
      description: ''
    }
  ],
  MetaballPool: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '400',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '300',
      description: ''
    },
    {
      name: 'ballCount',
      type: 'number',
      required: false,
      default: '5',
      description: ''
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#38bdf8'",
      description: ''
    }
  ],
  MeteorRain: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '800',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '500',
      description: ''
    },
    {
      name: 'meteorCount',
      type: 'number',
      required: false,
      default: '8',
      description: '流星数量，默认 8'
    }
  ],
  NeonText: [
    {
      name: 'text',
      type: 'string',
      required: false,
      default: "'NEON'",
      description: '显示文字'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#ff00de'",
      description: '霓虹主色'
    },
    {
      name: 'fontSize',
      type: 'number',
      required: false,
      default: '72',
      description: '字号'
    },
    {
      name: 'flicker',
      type: 'boolean',
      required: false,
      default: 'true',
      description: '是否闪烁'
    }
  ],
  NewtonCradle: [
    {
      name: 'ballCount',
      type: 'number',
      required: false,
      default: '5',
      description: ''
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#38bdf8'",
      description: ''
    },
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '280',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '200',
      description: ''
    }
  ],
  OrbitalChart: [
    {
      name: 'data',
      type: 'OrbitalChartItem[]',
      required: false,
      default: 'DEFAULT_DATA',
      description: ''
    },
    {
      name: 'size',
      type: 'number',
      required: false,
      default: '240',
      description: ''
    }
  ],
  ParticleNetwork: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '800',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '500',
      description: ''
    },
    {
      name: 'particleCount',
      type: 'number',
      required: false,
      default: '60',
      description: '粒子数量'
    },
    {
      name: 'linkDistance',
      type: 'number',
      required: false,
      default: '120',
      description: '连线距离'
    },
    {
      name: 'repelRadius',
      type: 'number',
      required: false,
      default: '150',
      description: '鼠标排斥半径'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#38bdf8'",
      description: '粒子颜色'
    }
  ],
  PlasmaBall: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '320',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '320',
      description: ''
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#a78bfa'",
      description: ''
    },
    {
      name: 'arcCount',
      type: 'number',
      required: false,
      default: '8',
      description: ''
    }
  ],
  ProgressChest: [
    {
      name: 'progress',
      type: 'number',
      required: false,
      default: '0',
      description: '进度 0–100'
    },
    {
      name: 'onOpen',
      type: '() => void',
      required: false,
      default: '',
      description: '宝箱打开回调'
    },
    {
      name: 'label',
      type: 'string',
      required: false,
      default: "'开启宝箱'",
      description: '标签文字'
    }
  ],
  RadarScan: [
    {
      name: 'size',
      type: 'number',
      required: false,
      default: '300',
      description: ''
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#22d3ee'",
      description: ''
    },
    {
      name: 'blipCount',
      type: 'number',
      required: false,
      default: '5',
      description: '光点数量，默认 5'
    }
  ],
  RedPacketRain: [
    {
      name: 'duration',
      type: 'number',
      required: false,
      default: '10000',
      description: '持续时间（毫秒），默认 10000'
    },
    {
      name: 'onGrab',
      type: '(amount: number) => void',
      required: false,
      default: '',
      description: '抢到红包回调'
    }
  ],
  ReturnCity: [
    {
      name: 'starCount',
      type: 'number',
      required: false,
      default: '',
      description: '星星数量，默认按容器宽度自动计算'
    },
    {
      name: 'glassCount',
      type: 'number',
      required: false,
      default: '8',
      description: '光壁数量，默认 8'
    },
    {
      name: 'glassRadius',
      type: 'number',
      required: false,
      default: '150',
      description: '光壁半径（px），默认 150'
    }
  ],
  RippleWater: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '800',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '500',
      description: ''
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#38bdf8'",
      description: '涟漪颜色'
    }
  ],
  RopeChain: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '400',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '400',
      description: ''
    },
    {
      name: 'segments',
      type: 'number',
      required: false,
      default: '16',
      description: ''
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#38bdf8'",
      description: ''
    },
    {
      name: 'gravity',
      type: 'number',
      required: false,
      default: '0.4',
      description: ''
    }
  ],
  ScrambleText: [
    {
      name: 'text',
      type: 'string',
      required: false,
      default: "'DECRYPTED'",
      description: '目标文字'
    },
    {
      name: 'duration',
      type: 'number',
      required: false,
      default: '2000',
      description: '解密动画时长（毫秒）'
    },
    {
      name: 'charset',
      type: 'string',
      required: false,
      default: 'DEFAULT_CHARSET',
      description: '随机字符集'
    }
  ],
  ScratchCard: [
    {
      name: 'coverColor',
      type: 'string',
      required: false,
      default: "'#94a3b8'",
      description: '涂层颜色'
    },
    {
      name: 'prize',
      type: 'string',
      required: false,
      default: "'🎉 恭喜中奖！'",
      description: '奖品文字'
    },
    {
      name: 'onReveal',
      type: '() => void',
      required: false,
      default: '',
      description: '刮开完成回调'
    },
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '300',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '180',
      description: ''
    }
  ],
  SlotMachine: [
    {
      name: 'symbols',
      type: 'string[]',
      required: false,
      default: 'DEFAULT_SYMBOLS',
      description: '符号列表'
    },
    {
      name: 'onSpinEnd',
      type: '(results: string[]) => void',
      required: false,
      default: '',
      description: '旋转结束回调'
    }
  ],
  SmokeFog: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '800',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '500',
      description: ''
    },
    {
      name: 'density',
      type: 'number',
      required: false,
      default: '0.5',
      description: '雾气密度 0~1，默认 0.5；点击/触摸画面可使雾气向外散开'
    }
  ],
  Snowfall: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '800',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '500',
      description: ''
    },
    {
      name: 'mode',
      type: "'snow' | 'sakura'",
      required: false,
      default: "'snow'",
      description: '飘落模式'
    },
    {
      name: 'count',
      type: 'number',
      required: false,
      default: '120',
      description: '粒子数量'
    }
  ],
  SolarSystem: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '400',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '400',
      description: ''
    },
    {
      name: 'speed',
      type: 'number',
      required: false,
      default: '1',
      description: ''
    },
    {
      name: 'showOrbits',
      type: 'boolean',
      required: false,
      default: 'true',
      description: ''
    }
  ],
  Speedometer: [
    {
      name: 'value',
      type: 'number',
      required: false,
      default: '0',
      description: ''
    },
    {
      name: 'max',
      type: 'number',
      required: false,
      default: '100',
      description: ''
    },
    {
      name: 'label',
      type: 'string',
      required: false,
      default: "'SPEED'",
      description: ''
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#f97316'",
      description: ''
    }
  ],
  SplitReveal: [
    {
      name: 'text',
      type: 'string',
      required: false,
      default: "'REVEAL'",
      description: '显示文字'
    },
    {
      name: 'delay',
      type: 'number',
      required: false,
      default: '80',
      description: '每个字符的延迟间隔（毫秒）'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#f8fafc'",
      description: '文字颜色'
    }
  ],
  Spotlight: [
    {
      name: 'children',
      type: 'React.ReactNode',
      required: false,
      default: '',
      description: ''
    },
    {
      name: 'radius',
      type: 'number',
      required: false,
      default: '120',
      description: '聚光半径，默认 120'
    },
    {
      name: 'dimColor',
      type: 'string',
      required: false,
      default: "'rgba(0",
      description: '遮罩颜色，默认 rgba(0,0,0,0.85)'
    }
  ],
  Starfield: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '800',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '500',
      description: ''
    },
    {
      name: 'starCount',
      type: 'number',
      required: false,
      default: '400',
      description: '星星数量'
    },
    {
      name: 'speed',
      type: 'number',
      required: false,
      default: '1',
      description: '飞行速度，默认 1'
    }
  ],
  TimelinePulse: [
    {
      name: 'steps',
      type: 'string[]',
      required: false,
      default: "['Start'",
      description: ''
    },
    {
      name: 'current',
      type: 'number',
      required: false,
      default: '0',
      description: ''
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#22d3ee'",
      description: ''
    }
  ],
  Turntable: [
    {
      name: 'prizes',
      type: 'TurntablePrize[]',
      required: false,
      default: 'DEFAULT_PRIZES',
      description: '奖品列表'
    },
    {
      name: 'size',
      type: 'number',
      required: false,
      default: '360',
      description: '转盘直径，默认 360'
    },
    {
      name: 'spinDuration',
      type: 'number',
      required: false,
      default: '4000',
      description: '旋转动画时长（毫秒），默认 4000'
    },
    {
      name: 'spinRounds',
      type: 'number',
      required: false,
      default: '5',
      description: '旋转圈数，默认 5'
    },
    {
      name: 'buttonText',
      type: 'string',
      required: false,
      default: "'开始抽奖'",
      description: '抽奖按钮文案'
    },
    {
      name: 'onSpinEnd',
      type: '(prize: TurntablePrize, index: number) => void',
      required: false,
      default: '',
      description: '旋转结束回调'
    }
  ],
  Typewriter: [
    {
      name: 'texts',
      type: 'string[]',
      required: false,
      default: '',
      description: '轮播文案列表'
    },
    {
      name: 'speed',
      type: 'number',
      required: false,
      default: '',
      description: '打字速度（毫秒/字符）'
    },
    {
      name: 'deleteSpeed',
      type: 'number',
      required: false,
      default: '',
      description: '删除速度（毫秒/字符）'
    },
    {
      name: 'pause',
      type: 'number',
      required: false,
      default: '',
      description: '完整展示后的停顿（毫秒）'
    }
  ],
  WaveButton: [
    {
      name: 'text',
      type: 'string',
      required: false,
      default: "'点我试试'",
      description: '按钮文字'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#38bdf8'",
      description: '主色'
    },
    {
      name: '…原生 button 属性',
      type: 'ButtonHTMLAttributes',
      required: false,
      default: '',
      description: '继承 onClick、disabled、type、aria-* 等（children 由 text 代替）'
    }
  ],
  WaveText: [
    {
      name: 'text',
      type: 'string',
      required: false,
      default: "'WAVE'",
      description: '显示文字'
    },
    {
      name: 'amplitude',
      type: 'number',
      required: false,
      default: '12',
      description: '波浪振幅（px）'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#38bdf8'",
      description: '文字颜色'
    },
    {
      name: 'fontSize',
      type: 'number',
      required: false,
      default: '56',
      description: '字号'
    }
  ],
  WeatherBackground: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '800',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '450',
      description: ''
    },
    {
      name: 'weather',
      type: "'sunny' | 'partlyCloudy' | 'overcast' | 'lightRain' | 'moderateRain' | 'heavyRain' | 'thunderstorm' | 'fog' | 'lightSnow' | 'moderateSnow' | 'heavySnow' | 'sleet' | 'hail' | 'smog' | 'gale' | 'snow'",
      required: false,
      default: "'sunny'",
      description:
        '天气类型：sunny 大晴天 / partlyCloudy 多云 / overcast 阴天 / lightRain 小雨 / moderateRain 中雨 / heavyRain 大雨 / thunderstorm 雷阵雨 / fog 雾 / lightSnow 小雪 / moderateSnow 中雪 / heavySnow 大雪 / sleet 雨夹雪 / hail 冰雹 / smog 霾 / gale 大风'
    },
    {
      name: 'night',
      type: 'boolean',
      required: false,
      default: 'false',
      description: '夜间模式：渲染深夜天空、月亮与星空；live 模式下自动按当地实际日夜覆盖此值'
    },
    {
      name: 'live',
      type: 'boolean',
      required: false,
      default: 'false',
      description: '接入 Open-Meteo 实况：自动定位并按真实天气渲染，定位或请求失败时回退到 weather'
    },
    {
      name: 'latitude',
      type: 'number',
      required: false,
      default: '',
      description: 'live 模式查询纬度（-90 ~ 90），与 longitude 同时配置时跳过浏览器定位'
    },
    {
      name: 'longitude',
      type: 'number',
      required: false,
      default: '',
      description: 'live 模式查询经度（-180 ~ 180），与 latitude 同时配置时跳过浏览器定位'
    },
    {
      name: 'onLiveWeather',
      type: '(weather: WeatherType) => void',
      required: false,
      default: '',
      description: 'live 模式解析出真实天气后回调'
    },
    {
      name: 'loading',
      type: 'boolean',
      required: false,
      default: 'false',
      description: '外部受控 loading：在当前画面上叠加加载遮罩（live 模式定位/请求期间会自动显示，无需传入）'
    }
  ]
};
