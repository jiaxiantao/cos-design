// 此文件由 scripts/extract-component-props.mjs 自动生成，请勿手动编辑
// 运行 pnpm extract-props 更新

export interface ComponentPropDoc {
  name: string;
  type: string;
  required: boolean;
  default: string;
  description: string;
}

export interface ComponentTypeDoc {
  name: string;
  fields: ComponentPropDoc[];
}

export type ComponentPropsMap = Record<string, ComponentPropDoc[]>;
export type ComponentTypesMap = Record<string, ComponentTypeDoc[]>;

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
  BlurText: [
    {
      name: 'text',
      type: 'string',
      required: false,
      default: "'BLUR TEXT'",
      description: '显示文字'
    },
    {
      name: 'animateBy',
      type: "'words' | 'letters'",
      required: false,
      default: "'words'",
      description: '按词或按字拆分'
    },
    {
      name: 'direction',
      type: "'top' | 'bottom'",
      required: false,
      default: "'top'",
      description: '入场方向'
    },
    {
      name: 'stagger',
      type: 'number',
      required: false,
      default: '120',
      description: '相邻单元延迟（毫秒）'
    },
    {
      name: 'duration',
      type: 'number',
      required: false,
      default: '500',
      description: '单单元动画时长（毫秒）'
    },
    {
      name: 'fontSize',
      type: 'number',
      required: false,
      default: '56',
      description: '字号'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#f8fafc'",
      description: '颜色'
    },
    {
      name: 'onAnimationComplete',
      type: '() => void',
      required: false,
      default: '',
      description: '动画完成后回调'
    }
  ],
  BubbleField: [
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
      name: 'bubbleCount',
      type: 'number',
      required: false,
      default: '36',
      description: '气泡数量上限'
    },
    {
      name: 'speed',
      type: 'number',
      required: false,
      default: '1',
      description: '上浮速度'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#7dd3fc'",
      description: '水体主色'
    },
    {
      name: 'interactive',
      type: 'boolean',
      required: false,
      default: 'true',
      description: '是否启用鼠标划过扰动'
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
    },
    {
      name: 'completedText',
      type: 'string',
      required: false,
      default: "'Gone.'",
      description: '燃烧完成提示'
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
  CircularText: [
    {
      name: 'text',
      type: 'string',
      required: false,
      default: "'COS DESIGN • REACT BITS • '",
      description: '环绕文字'
    },
    {
      name: 'spinDuration',
      type: 'number',
      required: false,
      default: '20',
      description: '一圈旋转时长（秒）'
    },
    {
      name: 'onHover',
      type: "'slowDown' | 'speedUp' | 'pause' | 'goBonkers'",
      required: false,
      default: "'speedUp'",
      description: '悬停行为'
    },
    {
      name: 'fontSize',
      type: 'number',
      required: false,
      default: '22',
      description: '字号'
    },
    {
      name: 'radius',
      type: 'number',
      required: false,
      default: '90',
      description: '圆环半径（像素）'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#f8fafc'",
      description: '文字颜色'
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
    },
    {
      name: 'hint',
      type: 'string',
      required: false,
      default: '',
      description: '画布操作提示'
    }
  ],
  CountUp: [
    {
      name: 'value',
      type: 'number',
      required: true,
      default: '',
      description: '目标值'
    },
    {
      name: 'start',
      type: 'number',
      required: false,
      default: '0',
      description: '起始值'
    },
    {
      name: 'duration',
      type: 'number',
      required: false,
      default: '1400',
      description: '动画时长（毫秒）'
    },
    {
      name: 'decimals',
      type: 'number',
      required: false,
      default: '0',
      description: '小数位数'
    },
    {
      name: 'prefix',
      type: 'string',
      required: false,
      default: "''",
      description: '前缀'
    },
    {
      name: 'suffix',
      type: 'string',
      required: false,
      default: "''",
      description: '后缀'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#34d399'",
      description: '主色'
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
    },
    {
      name: 'labels',
      type: "Partial<Record<keyof Omit<TimeLeft, 'total'>, string>>",
      required: false,
      default: '',
      description: '单位标签，可用于国际化'
    },
    {
      name: 'invalidText',
      type: 'string',
      required: false,
      default: "'无效的目标时间'",
      description: '目标时间无效时的提示'
    },
    {
      name: 'endedText',
      type: 'string',
      required: false,
      default: "'时间到！'",
      description: '倒计时结束提示'
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
    },
    {
      name: 'hint',
      type: 'string',
      required: false,
      default: "'移动鼠标查看粒子轨迹'",
      description: '操作提示'
    }
  ],
  CurvedLoop: [
    {
      name: 'text',
      type: 'string',
      required: false,
      default: "'COS DESIGN ✦ CURVED LOOP ✦ '",
      description: '跑马灯文案'
    },
    {
      name: 'speed',
      type: 'number',
      required: false,
      default: '2',
      description: '滚动速度（像素/帧）'
    },
    {
      name: 'curveAmount',
      type: 'number',
      required: false,
      default: '80',
      description: '曲线幅度'
    },
    {
      name: 'direction',
      type: "'left' | 'right'",
      required: false,
      default: "'left'",
      description: '初始方向'
    },
    {
      name: 'interactive',
      type: 'boolean',
      required: false,
      default: 'true',
      description: '是否可拖拽'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#f8fafc'",
      description: '文字颜色'
    },
    {
      name: 'fontSize',
      type: 'number',
      required: false,
      default: '56',
      description: '字号（相对 SVG）'
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
    },
    {
      name: 'rollText',
      type: 'string',
      required: false,
      default: "'掷骰子'",
      description: '掷骰按钮文案'
    },
    {
      name: 'rollingText',
      type: 'string',
      required: false,
      default: "'掷骰中...'",
      description: '掷骰进行中的文案'
    },
    {
      name: 'resultPrefix',
      type: 'string',
      required: false,
      default: "'点数:'",
      description: '点数结果前缀'
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
      name: 'auto',
      type: 'boolean',
      required: false,
      default: 'true',
      description: '是否自动燃放，默认 true'
    },
    {
      name: 'hint',
      type: 'string',
      required: false,
      default: "'点击画布燃放烟花'",
      description: '画布操作提示'
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
  FuzzyText: [
    {
      name: 'text',
      type: 'string',
      required: false,
      default: "'FUZZY'",
      description: '显示文字'
    },
    {
      name: 'fontSize',
      type: 'number',
      required: false,
      default: '72',
      description: '字号'
    },
    {
      name: 'fontWeight',
      type: 'number',
      required: false,
      default: '900',
      description: '字重'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#f8fafc'",
      description: '颜色'
    },
    {
      name: 'baseIntensity',
      type: 'number',
      required: false,
      default: '0.18',
      description: '基础抖动强度 0~1'
    },
    {
      name: 'hoverIntensity',
      type: 'number',
      required: false,
      default: '0.5',
      description: '悬停抖动强度 0~1'
    },
    {
      name: 'enableHover',
      type: 'boolean',
      required: false,
      default: 'true',
      description: '是否启用悬停增强'
    },
    {
      name: 'fuzzRange',
      type: 'number',
      required: false,
      default: '30',
      description: '抖动像素范围'
    }
  ],
  GameOfLife: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '560',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '420',
      description: ''
    },
    {
      name: 'cellSize',
      type: 'number',
      required: false,
      default: '14',
      description: '单元格大小'
    },
    {
      name: 'speed',
      type: 'number',
      required: false,
      default: '120',
      description: '演化速度（毫秒/代）'
    },
    {
      name: 'density',
      type: 'number',
      required: false,
      default: '0.28',
      description: '初始存活密度 0~1'
    },
    {
      name: 'aliveColor',
      type: 'string',
      required: false,
      default: "'#a3e635'",
      description: '存活颜色'
    },
    {
      name: 'gridColor',
      type: 'string',
      required: false,
      default: "'rgb(148 163 184 / 14%)'",
      description: '网格线颜色'
    },
    {
      name: 'generation',
      type: 'string',
      required: true,
      default: '',
      description: '控制栏文案'
    },
    {
      name: 'alive',
      type: 'string',
      required: true,
      default: '',
      description: ''
    },
    {
      name: 'pause',
      type: 'string',
      required: true,
      default: '',
      description: ''
    },
    {
      name: 'play',
      type: 'string',
      required: true,
      default: '',
      description: ''
    },
    {
      name: 'randomize',
      type: 'string',
      required: true,
      default: '',
      description: ''
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
  NetworkGraph: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '600',
      description: ''
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '420',
      description: ''
    },
    {
      name: 'nodes',
      type: 'NetworkGraphNode[]',
      required: false,
      default: 'DEFAULT_NODES',
      description: '节点列表'
    },
    {
      name: 'edges',
      type: 'NetworkGraphEdge[]',
      required: false,
      default: 'DEFAULT_EDGES',
      description: '边列表'
    },
    {
      name: 'linkColor',
      type: 'string',
      required: false,
      default: "'rgb(148 163 184 / 35%)'",
      description: '连线颜色'
    },
    {
      name: 'nodeRadius',
      type: 'number',
      required: false,
      default: '20',
      description: '节点半径'
    },
    {
      name: 'hint',
      type: 'string',
      required: false,
      default: "'拖拽节点 · 悬停查看关联'",
      description: '未悬停节点时的操作提示'
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
    },
    {
      name: 'hint',
      type: 'string',
      required: false,
      default: "'移动鼠标或手指与粒子互动'",
      description: '操作提示'
    }
  ],
  PhotoAlbum: [
    {
      name: 'photos',
      type: 'PhotoAlbumItem[]',
      required: true,
      default: '',
      description: '相册照片列表'
    },
    {
      name: 'width',
      type: 'number | string',
      required: false,
      default: '920',
      description: '相册宽度'
    },
    {
      name: 'height',
      type: 'number | string',
      required: false,
      default: '560',
      description: '相册高度'
    },
    {
      name: 'initialIndex',
      type: 'number',
      required: false,
      default: '0',
      description: '初始右页照片索引（摊开为左 index-1 / 右 index；每次翻页翻过一叶两面）'
    },
    {
      name: 'pageTurnDuration',
      type: 'number',
      required: false,
      default: '760',
      description: '单次翻页动画时长（毫秒）'
    },
    {
      name: 'objectFit',
      type: "CSSProperties['objectFit']",
      required: false,
      default: "'cover'",
      description: '照片填充方式'
    },
    {
      name: 'showPageNumber',
      type: 'boolean',
      required: false,
      default: 'true',
      description: '是否显示页码'
    },
    {
      name: 'pageColor',
      type: 'string',
      required: false,
      default: "'#f2ead8'",
      description: '相纸颜色'
    },
    {
      name: 'coverColor',
      type: 'string',
      required: false,
      default: "'#4a3025'",
      description: '封皮颜色'
    },
    {
      name: 'ariaLabel',
      type: 'string',
      required: false,
      default: "'Photo album'",
      description: '相册无障碍名称'
    },
    {
      name: 'labels',
      type: 'PhotoAlbumLabels',
      required: false,
      default: '',
      description: '内置文案'
    },
    {
      name: 'onPageChange',
      type: '(index: number, photo: PhotoAlbumItem) => void',
      required: false,
      default: '',
      description: '当前照片变化回调'
    },
    {
      name: 'className',
      type: 'string',
      required: false,
      default: '',
      description: '自定义类名'
    },
    {
      name: 'style',
      type: 'CSSProperties',
      required: false,
      default: '',
      description: '自定义样式'
    }
  ],
  PhotoClothesline: [
    {
      name: 'photos',
      type: 'PhotoClotheslineItem[]',
      required: true,
      default: '',
      description: '晾绳上的照片列表'
    },
    {
      name: 'width',
      type: 'number | string',
      required: false,
      default: "'100%'",
      description: '组件宽度'
    },
    {
      name: 'height',
      type: 'number | string',
      required: false,
      default: '480',
      description: '组件高度'
    },
    {
      name: 'photoWidth',
      type: 'number',
      required: false,
      default: '150',
      description: '单张照片宽度（px）'
    },
    {
      name: 'photoHeight',
      type: 'number',
      required: false,
      default: '200',
      description: '单张照片高度（px）'
    },
    {
      name: 'photoGap',
      type: 'number',
      required: false,
      default: '46',
      description: '照片间距（px）'
    },
    {
      name: 'ropeTop',
      type: 'number',
      required: false,
      default: '66',
      description: '绳索悬挂高度（px，距顶部）'
    },
    {
      name: 'ropeSag',
      type: 'number',
      required: false,
      default: '26',
      description: '绳索整体垂度（px）'
    },
    {
      name: 'bandLength',
      type: 'number',
      required: false,
      default: '34',
      description: '照片吊带长度（px），越长摆动幅度越大、周期越慢'
    },
    {
      name: 'bandWidth',
      type: 'number',
      required: false,
      default: '5',
      description: '吊带宽度（px）'
    },
    {
      name: 'maxPull',
      type: 'number',
      required: false,
      default: '110',
      description: '照片被拖离静止位的最大距离（px），越小吊带越快绷紧'
    },
    {
      name: 'stiffness',
      type: 'number',
      required: false,
      default: '1',
      description: '主绳刚度 0.1~2，越大被拽下后弹回越快'
    },
    {
      name: 'damping',
      type: 'number',
      required: false,
      default: '0.16',
      description: '阻尼比 0~1，越小摆动越久'
    },
    {
      name: 'tension',
      type: 'number',
      required: false,
      default: '0.35',
      description: '相邻照片之间的绳索牵连强度 0~1'
    },
    {
      name: 'tilt',
      type: 'number',
      required: false,
      default: '5',
      description: '照片随机倾角幅度（度）'
    },
    {
      name: 'ropeColor',
      type: 'string',
      required: false,
      default: "'#8d7a5c'",
      description: '主绳颜色'
    },
    {
      name: 'bandColor',
      type: 'string',
      required: false,
      default: '',
      description: '吊带颜色，默认跟随 ropeColor'
    },
    {
      name: 'pinColor',
      type: 'string',
      required: false,
      default: "'#d8a761'",
      description: '木夹子颜色'
    },
    {
      name: 'frameColor',
      type: 'string',
      required: false,
      default: "'#fffdf7'",
      description: '相纸边框颜色'
    },
    {
      name: 'background',
      type: 'string',
      required: false,
      default: '',
      description: '背景（任意 CSS background 值）'
    },
    {
      name: 'objectFit',
      type: "CSSProperties['objectFit']",
      required: false,
      default: "'cover'",
      description: '照片填充方式'
    },
    {
      name: 'showCaption',
      type: 'boolean',
      required: false,
      default: 'true',
      description: '是否显示照片标题与说明'
    },
    {
      name: 'initialIndex',
      type: 'number',
      required: false,
      default: '0',
      description: '初始居中显示的照片索引'
    },
    {
      name: 'onPhotoClick',
      type: '(index: number, photo: PhotoClotheslineItem) => void',
      required: false,
      default: '',
      description: '点击照片回调'
    },
    {
      name: 'ariaLabel',
      type: 'string',
      required: false,
      default: "'Photo clothesline'",
      description: '无障碍名称'
    },
    {
      name: 'className',
      type: 'string',
      required: false,
      default: '',
      description: '自定义类名'
    },
    {
      name: 'style',
      type: 'CSSProperties',
      required: false,
      default: '',
      description: '自定义样式'
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
    },
    {
      name: 'openedLabel',
      type: 'string',
      required: false,
      default: "'宝箱已开启！'",
      description: '宝箱开启后的标签文字'
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
    },
    {
      name: 'grabbedLabel',
      type: 'string',
      required: false,
      default: "'已抢:'",
      description: '已抢金额标签'
    },
    {
      name: 'endedText',
      type: 'string',
      required: false,
      default: "'红包雨结束'",
      description: '红包雨结束提示'
    },
    {
      name: 'hint',
      type: 'string',
      required: false,
      default: "'点击红包抢夺'",
      description: '操作提示'
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
      name: 'fromColor',
      type: 'string',
      required: false,
      default: "'#52ade3'",
      description: '水面渐变浅端（左上）'
    },
    {
      name: 'toColor',
      type: 'string',
      required: false,
      default: "'#013565'",
      description: '水面渐变深端（右下）'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#a8d8f5'",
      description: '涟漪高光色'
    },
    {
      name: 'waveAmplitude',
      type: 'number',
      required: false,
      default: '1',
      description: '环境波浪强度 0~2，默认 1'
    },
    {
      name: 'waveSpeed',
      type: 'number',
      required: false,
      default: '1',
      description: '环境波浪速度 0~3，默认 1'
    },
    {
      name: 'shimmer',
      type: 'number',
      required: false,
      default: '1',
      description: '波光闪烁强度 0~2，默认 1'
    },
    {
      name: 'reflection',
      type: 'number',
      required: false,
      default: '0.38',
      description: '水面反射强度 0~1，默认 0.38'
    },
    {
      name: 'rippleStrength',
      type: 'number',
      required: false,
      default: '1',
      description: '点击涟漪力度 0~3，默认 1'
    },
    {
      name: 'rippleRadius',
      type: 'number',
      required: false,
      default: '6',
      description: '涟漪落点半径（仿真格点 2~12），默认 6'
    },
    {
      name: 'damping',
      type: 'number',
      required: false,
      default: '0.985',
      description: '涟漪衰减 0.9~0.999，越大越持久，默认 0.985'
    },
    {
      name: 'spread',
      type: 'number',
      required: false,
      default: '0.5',
      description: '涟漪传播速度 0.3~0.7，默认 0.5'
    },
    {
      name: 'interactive',
      type: 'boolean',
      required: false,
      default: 'true',
      description: '是否响应点击/触摸产生涟漪，默认 true'
    },
    {
      name: 'showHint',
      type: 'boolean',
      required: false,
      default: 'true',
      description: '是否显示底部提示，默认 true'
    },
    {
      name: 'hint',
      type: 'string',
      required: false,
      default: "'点击水面产生涟漪'",
      description: '底部提示文案'
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
  RotatingText: [
    {
      name: 'texts',
      type: 'string[]',
      required: false,
      default: 'DEFAULT_TEXTS',
      description: '轮播文案列表'
    },
    {
      name: 'interval',
      type: 'number',
      required: false,
      default: '2200',
      description: '切换间隔（毫秒）'
    },
    {
      name: 'stagger',
      type: 'number',
      required: false,
      default: '40',
      description: '字符错峰延迟（毫秒）'
    },
    {
      name: 'duration',
      type: 'number',
      required: false,
      default: '420',
      description: '单字符动画时长（毫秒）'
    },
    {
      name: 'fontSize',
      type: 'number',
      required: false,
      default: '56',
      description: '字号'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#0f172a'",
      description: '颜色'
    },
    {
      name: 'highlightColor',
      type: 'string',
      required: false,
      default: "'#38bdf8'",
      description: '高亮背景色'
    }
  ],
  SandFall: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '480',
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
      name: 'cellSize',
      type: 'number',
      required: false,
      default: '4',
      description: '像素格大小'
    },
    {
      name: 'colors',
      type: 'string[]',
      required: false,
      default: 'DEFAULT_COLORS',
      description: '沙粒颜色列表（仅支持 #RRGGBB）'
    },
    {
      name: 'spawnRate',
      type: 'number',
      required: false,
      default: '3',
      description: '每帧生成粒子数'
    },
    {
      name: 'hint',
      type: 'string',
      required: false,
      default: "'按住鼠标绘制沙粒'",
      description: '操作提示'
    },
    {
      name: 'clearText',
      type: 'string',
      required: false,
      default: "'Clear'",
      description: '清空按钮文案'
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
      name: 'coverText',
      type: 'string',
      required: false,
      default: "'刮开涂层'",
      description: '涂层上的提示文案'
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
  ShinyText: [
    {
      name: 'text',
      type: 'string',
      required: false,
      default: "'SHINY TEXT'",
      description: '显示文字'
    },
    {
      name: 'speed',
      type: 'number',
      required: false,
      default: '2',
      description: '扫光周期（秒）'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#94a3b8'",
      description: '文字底色'
    },
    {
      name: 'shineColor',
      type: 'string',
      required: false,
      default: "'#ffffff'",
      description: '高光色'
    },
    {
      name: 'fontSize',
      type: 'number',
      required: false,
      default: '64',
      description: '字号'
    },
    {
      name: 'disabled',
      type: 'boolean',
      required: false,
      default: 'false',
      description: '是否暂停动画'
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
    },
    {
      name: 'startText',
      type: 'string',
      required: false,
      default: "'开始'",
      description: '开始按钮文案'
    },
    {
      name: 'spinningText',
      type: 'string',
      required: false,
      default: "'旋转中...'",
      description: '旋转中的按钮文案'
    },
    {
      name: 'jackpotText',
      type: 'string',
      required: false,
      default: "'🎰 大奖！'",
      description: '中奖提示'
    },
    {
      name: 'resultPrefix',
      type: 'string',
      required: false,
      default: "'结果:'",
      description: '普通结果前缀'
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
      description: '烟雾密度 0~1，默认 0.5'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: 'DEFAULT_COLOR',
      description: '烟雾颜色，默认偏冷灰白 `#d2d4d8`'
    },
    {
      name: 'backgroundColor',
      type: 'string | [string, string, string]',
      required: false,
      default: 'DEFAULT_BG',
      description: '背景色：单色会生成轻微渐变，或传 [上, 中, 下]；默认深色夜景'
    },
    {
      name: 'speed',
      type: 'number',
      required: false,
      default: '1',
      description: '运动速度倍率 0~3，默认 1'
    },
    {
      name: 'disperseStrength',
      type: 'number',
      required: false,
      default: '1',
      description: '点击拨开力度 0~3，默认 1'
    },
    {
      name: 'disperseRadius',
      type: 'number',
      required: false,
      default: '1',
      description: '点击拨开范围倍率 0~3，默认 1'
    },
    {
      name: 'interactive',
      type: 'boolean',
      required: false,
      default: 'true',
      description: '是否响应点击/触摸驱散，默认 true'
    },
    {
      name: 'ariaLabel',
      type: 'string',
      required: false,
      default: '',
      description: '画布无障碍标签'
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
  SplitText: [
    {
      name: 'text',
      type: 'string',
      required: false,
      default: "'SPLIT TEXT'",
      description: '显示文字'
    },
    {
      name: 'animation',
      type: "'fadeUp' | 'scale' | 'rotate' | 'blur'",
      required: false,
      default: "'fadeUp'",
      description: '动画类型'
    },
    {
      name: 'stagger',
      type: 'number',
      required: false,
      default: '50',
      description: '字符间隔延迟（毫秒）'
    },
    {
      name: 'duration',
      type: 'number',
      required: false,
      default: '500',
      description: '单字符动画时长（毫秒）'
    },
    {
      name: 'loop',
      type: 'boolean',
      required: false,
      default: 'true',
      description: '是否循环播放'
    },
    {
      name: 'loopPause',
      type: 'number',
      required: false,
      default: '2400',
      description: '循环间歇（毫秒）'
    },
    {
      name: 'fontSize',
      type: 'number',
      required: false,
      default: '56',
      description: '字号'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#f8fafc'",
      description: '颜色'
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
  SpringMass: [
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '560',
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
      name: 'cols',
      type: 'number',
      required: false,
      default: '6',
      description: '横向质点数量'
    },
    {
      name: 'rows',
      type: 'number',
      required: false,
      default: '5',
      description: '纵向质点数量'
    },
    {
      name: 'stiffness',
      type: 'number',
      required: false,
      default: '0.22',
      description: '弹簧刚度 0~1'
    },
    {
      name: 'damping',
      type: 'number',
      required: false,
      default: '0.9',
      description: '速度阻尼 0~1'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#a78bfa'",
      description: '主色'
    },
    {
      name: 'hint',
      type: 'string',
      required: false,
      default: "'拖拽网格质点，观察弹簧回弹'",
      description: '操作提示'
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
  TextMorph: [
    {
      name: 'texts',
      type: 'string[]',
      required: false,
      default: 'DEFAULT_TEXTS',
      description: '轮播文案'
    },
    {
      name: 'interval',
      type: 'number',
      required: false,
      default: '2200',
      description: '切换周期（毫秒）'
    },
    {
      name: 'duration',
      type: 'number',
      required: false,
      default: '680',
      description: '单次 morph 时长（毫秒）'
    },
    {
      name: 'fontSize',
      type: 'number',
      required: false,
      default: '64',
      description: '字号'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#f8fafc'",
      description: '主色'
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
  TrueFocus: [
    {
      name: 'sentence',
      type: 'string',
      required: false,
      default: "'True Focus'",
      description: '句子文案'
    },
    {
      name: 'separator',
      type: 'string',
      required: false,
      default: "' '",
      description: '分词分隔符'
    },
    {
      name: 'manualMode',
      type: 'boolean',
      required: false,
      default: 'false',
      description: '是否仅 hover 聚焦'
    },
    {
      name: 'blurAmount',
      type: 'number',
      required: false,
      default: '5',
      description: '非聚焦词模糊强度（px）'
    },
    {
      name: 'borderColor',
      type: 'string',
      required: false,
      default: "'#22c55e'",
      description: '焦点框颜色'
    },
    {
      name: 'glowColor',
      type: 'string',
      required: false,
      default: "'rgb(34 197 94 / 60%)'",
      description: '焦点光晕颜色'
    },
    {
      name: 'animationDuration',
      type: 'number',
      required: false,
      default: '0.5',
      description: '切换动画时长（秒）'
    },
    {
      name: 'pauseBetweenAnimations',
      type: 'number',
      required: false,
      default: '1',
      description: '自动切换间歇（秒）'
    },
    {
      name: 'fontSize',
      type: 'number',
      required: false,
      default: '48',
      description: '字号'
    },
    {
      name: 'color',
      type: 'string',
      required: false,
      default: "'#f8fafc'",
      description: '文字颜色'
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
      name: 'spinningText',
      type: 'string',
      required: false,
      default: "'抽奖中...'",
      description: '抽奖进行中的按钮文案'
    },
    {
      name: 'resultPrefix',
      type: 'string',
      required: false,
      default: "'恭喜获得：'",
      description: '中奖结果前缀'
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
      type: "'sunny' | 'partlyCloudy' | 'overcast' | 'rain' | 'lightRain' | 'moderateRain' | 'heavyRain' | 'thunderstorm' | 'fog' | 'snow' | 'lightSnow' | 'moderateSnow' | 'heavySnow' | 'sleet' | 'hail' | 'smog' | 'gale'",
      required: false,
      default: "'partlyCloudy'",
      description:
        '天气类型：sunny / partlyCloudy / overcast / rain 雨天 / thunderstorm / fog / snow 雪天 / sleet / hail / smog；雨量用 rainLevel，雪量用 snowLevel，风效用 windLevel'
    },
    {
      name: 'time',
      type: 'string',
      required: false,
      default: "'14:00'",
      description: ''
    },
    {
      name: 'live',
      type: 'boolean',
      required: false,
      default: 'false',
      description:
        '接入 Open-Meteo 实况：自动定位并按真实天气渲染，定位或请求失败时回退到 weather；时刻随当地时钟东升西落'
    },
    {
      name: 'latitude',
      type: 'number',
      required: false,
      default: '',
      description: '纬度（-90 ~ 90）：用于日出日落与昼夜判定；live 未配置时可跳过浏览器定位'
    },
    {
      name: 'longitude',
      type: 'number',
      required: false,
      default: '',
      description: '经度（-180 ~ 180）：与 latitude 同时配置'
    },
    {
      name: 'windLevel',
      type: 'number',
      required: false,
      default: 'DEFAULT_WIND_LEVEL',
      description: '蒲福风级 0~12，默认 3（微风）；live 模式下使用 Open-Meteo 实况风速'
    },
    {
      name: 'rainLevel',
      type: 'number',
      required: false,
      default: 'DEFAULT_RAIN_LEVEL',
      description:
        '雨量档 1~10：1~2 毛毛雨 / 3~4 小雨 / 5~6 中雨 / 7~8 暴雨 / 9~10 特大暴雨，默认 5；rain / thunderstorm / sleet 生效；live 模式下由实况推导'
    },
    {
      name: 'snowLevel',
      type: 'number',
      required: false,
      default: 'DEFAULT_SNOW_LEVEL',
      description:
        '雪量档 1~10：1~2 毛毛雪 / 3~4 小雪 / 5~6 中雪 / 7~8 暴雪 / 9~10 特大暴雪，默认 5；snow / sleet 生效；live 模式下由实况推导'
    },
    {
      name: 'hailLevel',
      type: 'number',
      required: false,
      default: 'DEFAULT_HAIL_LEVEL',
      description: '冰雹强度 1~3：1 细雹 / 2 密雹 / 3 巨雹，默认 2；仅 hail 天气生效；live 模式下由实况推导'
    },
    {
      name: 'fogLevel',
      type: 'number',
      required: false,
      default: 'DEFAULT_FOG_LEVEL',
      description: '雾浓度 1~3：1 薄雾 / 2 中雾 / 3 浓雾，默认 2；仅 fog 天气生效；live 模式下由实况推导'
    },
    {
      name: 'smogLevel',
      type: 'number',
      required: false,
      default: 'DEFAULT_SMOG_LEVEL',
      description: '霾强度 1~3：1 轻霾 / 2 中霾 / 3 重霾，默认 2；仅 smog 天气生效；live 模式下由实况推导'
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
    },
    {
      name: 'ariaLabel',
      type: 'string',
      required: false,
      default: '',
      description: '画布无障碍标签；不传时使用默认中文描述'
    },
    {
      name: 'loadingText',
      type: 'string',
      required: false,
      default: "'天气加载中…'",
      description: '加载状态文案'
    }
  ]
};

export const componentRelatedTypes: ComponentTypesMap = {
  NetworkGraph: [
    {
      name: 'NetworkGraphEdge',
      fields: [
        {
          name: 'source',
          type: 'string',
          required: true,
          default: '',
          description: ''
        },
        {
          name: 'target',
          type: 'string',
          required: true,
          default: '',
          description: ''
        }
      ]
    },
    {
      name: 'NetworkGraphNode',
      fields: [
        {
          name: 'id',
          type: 'string',
          required: true,
          default: '',
          description: ''
        },
        {
          name: 'label',
          type: 'string',
          required: false,
          default: '',
          description: ''
        },
        {
          name: 'color',
          type: 'string',
          required: false,
          default: '',
          description: ''
        }
      ]
    }
  ],
  OrbitalChart: [
    {
      name: 'OrbitalChartItem',
      fields: [
        {
          name: 'label',
          type: 'string',
          required: true,
          default: '',
          description: ''
        },
        {
          name: 'value',
          type: 'number',
          required: true,
          default: '',
          description: ''
        },
        {
          name: 'color',
          type: 'string',
          required: true,
          default: '',
          description: ''
        }
      ]
    }
  ],
  PhotoAlbum: [
    {
      name: 'PhotoAlbumItem',
      fields: [
        {
          name: 'src',
          type: 'string',
          required: true,
          default: '',
          description: '图片地址'
        },
        {
          name: 'alt',
          type: 'string',
          required: false,
          default: '',
          description: '图片替代文本'
        },
        {
          name: 'title',
          type: 'string',
          required: false,
          default: '',
          description: '照片标题'
        },
        {
          name: 'description',
          type: 'string',
          required: false,
          default: '',
          description: '照片说明'
        }
      ]
    },
    {
      name: 'PhotoAlbumLabels',
      fields: [
        {
          name: 'previous',
          type: 'string',
          required: false,
          default: '',
          description: '上一页按钮标签'
        },
        {
          name: 'next',
          type: 'string',
          required: false,
          default: '',
          description: '下一页按钮标签'
        },
        {
          name: 'empty',
          type: 'string',
          required: false,
          default: '',
          description: '空相册提示'
        },
        {
          name: 'flyleafTitle',
          type: 'string',
          required: false,
          default: '',
          description: '首页飞页主标题'
        },
        {
          name: 'flyleafSubtitle',
          type: 'string',
          required: false,
          default: '',
          description: '首页飞页副标题'
        },
        {
          name: 'flyleafEndTitle',
          type: 'string',
          required: false,
          default: '',
          description: '尾页飞页主标题'
        },
        {
          name: 'flyleafEndSubtitle',
          type: 'string',
          required: false,
          default: '',
          description: '尾页飞页副标题'
        }
      ]
    }
  ],
  PhotoClothesline: [
    {
      name: 'PhotoClotheslineItem',
      fields: [
        {
          name: 'src',
          type: 'string',
          required: true,
          default: '',
          description: '图片地址'
        },
        {
          name: 'alt',
          type: 'string',
          required: false,
          default: '',
          description: '图片替代文本'
        },
        {
          name: 'title',
          type: 'string',
          required: false,
          default: '',
          description: '照片标题'
        },
        {
          name: 'description',
          type: 'string',
          required: false,
          default: '',
          description: '照片说明'
        }
      ]
    }
  ],
  Turntable: [
    {
      name: 'TurntablePrize',
      fields: [
        {
          name: 'label',
          type: 'string',
          required: true,
          default: '',
          description: ''
        },
        {
          name: 'color',
          type: 'string',
          required: false,
          default: '',
          description: ''
        }
      ]
    }
  ]
};
