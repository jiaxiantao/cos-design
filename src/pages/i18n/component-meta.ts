/**
 * English title / description / tags for every playground component.
 * zh-CN continues to use `src/pages/config/components.ts` as the source of truth.
 */

import { componentDemos } from '../config/components';
import { type Locale } from './types';

export interface ComponentMetaI18n {
  title: string;
  description: string;
  tags: string[];
}

/**
 * English meta for every component in `componentDemos`.
 * Key set is the source of `ComponentMetaName`; use `assertComponentMetaCoverage()`
 * to verify parity with `components.ts` (array typing widens `name` to `string`).
 */
export const componentMetaEn = {
  WeatherBackground: {
    title: 'Weather Background',
    description:
      'Multiple weather scenes with adjustable rain/snow/fog/hail/smog intensity; optional Open-Meteo live rendering.',
    tags: ['Canvas', 'Effect', 'API']
  },
  RippleWater: {
    title: 'Ripple Water',
    description: 'Realistic water surface; clicks spawn physically spreading ripples.',
    tags: ['WebGL', 'Interactive']
  },
  SmokeFog: {
    title: 'Smoke Fog',
    description: 'Canvas noise fog drifts slowly; click the canvas to disperse it outward.',
    tags: ['Canvas', 'Effect']
  },
  BubbleField: {
    title: 'Bubble Field',
    description: 'Deep-sea bubbles rise from the bottom, merge when close, with underwater lighting.',
    tags: ['Canvas', 'Interactive']
  },
  MatrixRain: {
    title: 'Matrix Rain',
    description: 'Classic Matrix-style digital rain background animation.',
    tags: ['Canvas', 'Effect']
  },
  MeteorRain: {
    title: 'Meteor Rain',
    description: 'Canvas meteor shower background — great for login and campaign pages.',
    tags: ['Canvas', 'Effect']
  },
  ParticleNetwork: {
    title: 'Particle Network',
    description: 'Linked particle network that repels when the mouse approaches.',
    tags: ['Canvas', 'Interactive']
  },
  Aurora: {
    title: 'Aurora',
    description: 'Flowing gradient light bands for a soft, dreamy atmosphere.',
    tags: ['CSS', 'Effect']
  },
  CyberGrid: {
    title: 'Cyber Grid',
    description: 'Tron-style perspective grid that scrolls endlessly.',
    tags: ['Canvas', 'Effect']
  },
  Snowfall: {
    title: 'Snowfall',
    description: 'Falling snow or sakura petals; switch with mode.',
    tags: ['Canvas', 'Effect']
  },
  Starfield: {
    title: '3D Starfield',
    description: 'Depth-flight starfield flythrough effect.',
    tags: ['Canvas', 'Effect']
  },
  Typewriter: {
    title: 'Typewriter',
    description: 'Terminal-style typewriter with multi-copy carousel support.',
    tags: ['CSS', 'Text']
  },
  NeonText: {
    title: 'Neon Text',
    description: 'Cyberpunk neon glowing text.',
    tags: ['CSS', 'Effect']
  },
  GlitchText: {
    title: 'Glitch Text',
    description: 'Cyberpunk glitch flicker text.',
    tags: ['CSS', 'Text']
  },
  ScrambleText: {
    title: 'Scramble Text',
    description: 'Garbled characters decode letter by letter into the target copy.',
    tags: ['CSS', 'Text']
  },
  SplitReveal: {
    title: 'Split Reveal',
    description: 'Each letter pops in from one of four directions.',
    tags: ['CSS', 'Animation']
  },
  WaveText: {
    title: 'Wave Text',
    description: 'Text undulates along a sine wave.',
    tags: ['CSS', 'Animation']
  },
  GradientFlow: {
    title: 'Gradient Flow',
    description: 'Modern effect with a gradient flowing across the text.',
    tags: ['CSS', 'Text']
  },
  BurnAway: {
    title: 'Burn Away',
    description: 'Click to ignite; text burns and peels away.',
    tags: ['Canvas', 'Text']
  },
  BarcodeScan: {
    title: 'Barcode Scan',
    description: 'Scan line plus a glitch-style overlay.',
    tags: ['CSS', 'Effect']
  },
  TextMorph: {
    title: 'Text Morph',
    description: 'Soft blur morph between two copies — great for banner headline rotation.',
    tags: ['CSS', 'Text']
  },
  SplitText: {
    title: 'Split Text',
    description: 'Letter-split entrance with fadeUp / scale / rotate / blur modes.',
    tags: ['CSS', 'Animation']
  },
  ShinyText: {
    title: 'Shiny Text',
    description: 'A highlight sweeps across the text for a metallic sheen.',
    tags: ['CSS', 'Text']
  },
  BlurText: {
    title: 'Blur Text',
    description: 'Text reveals from blur to sharp by word or letter when it enters the viewport.',
    tags: ['CSS', 'Animation']
  },
  CircularText: {
    title: 'Circular Text',
    description: 'Characters form a ring and keep spinning; hover to speed up, slow down, or pause.',
    tags: ['CSS', 'Interactive']
  },
  TrueFocus: {
    title: 'True Focus',
    description: 'Words take turns in sharp focus while others blur, with a four-corner focus frame.',
    tags: ['CSS', 'Animation']
  },
  FuzzyText: {
    title: 'Fuzzy Text',
    description: 'Canvas line-jitter text drawing that intensifies on hover.',
    tags: ['Canvas', 'Text']
  },
  CurvedLoop: {
    title: 'Curved Loop',
    description: 'Text scrolls along an SVG curve; drag to change direction.',
    tags: ['SVG', 'Animation']
  },
  RotatingText: {
    title: 'Rotating Text',
    description: 'Multi-copy carousel with staggered character slide in/out — ideal for keyword titles.',
    tags: ['CSS', 'Text']
  },
  WaveButton: {
    title: 'Wave Button',
    description: 'Interactive button with a water-ripple spread animation.',
    tags: ['CSS', 'Interactive']
  },
  Spotlight: {
    title: 'Spotlight',
    description: 'Cuts a hole in a dark overlay at the mouse to reveal content.',
    tags: ['CSS', 'Interactive']
  },
  MagneticButton: {
    title: 'Magnetic Button',
    description: 'Button magnetically offsets toward the approaching cursor.',
    tags: ['CSS', 'Interactive']
  },
  HolographicCard: {
    title: 'Holographic Card',
    description: '3D card with rainbow reflections when tilted.',
    tags: ['CSS', '3D']
  },
  PhotoAlbum: {
    title: 'Realistic Photo Album',
    description: 'An open 3D album with paper, spine and dynamic shadows; click either page to browse naturally.',
    tags: ['CSS', '3D', 'Interactive']
  },
  ClickSpark: {
    title: 'Click Spark',
    description: 'Lightweight particle sparks burst at the click point.',
    tags: ['Canvas', 'Interactive']
  },
  CursorTrail: {
    title: 'Cursor Trail',
    description: 'Particle light trail follows the mouse.',
    tags: ['Canvas', 'Interactive']
  },
  LiquidGlass: {
    title: 'Liquid Glass',
    description: 'Apple-style frosted glass panel effect.',
    tags: ['CSS', 'Effect']
  },
  Turntable: {
    title: 'Turntable',
    description: 'Interactive prize wheel with customizable rewards.',
    tags: ['Canvas', 'Interactive']
  },
  Confetti: {
    title: 'Confetti',
    description: 'Canvas confetti burst — perfect for win celebrations.',
    tags: ['Canvas', 'Interactive']
  },
  Charge: {
    title: 'Charge',
    description: 'Battery charge animation with controlled mode support.',
    tags: ['CSS', 'Animation']
  },
  ScratchCard: {
    title: 'Scratch Card',
    description: 'Scratch off a Canvas coating to reveal the prize.',
    tags: ['Canvas', 'Interactive']
  },
  SlotMachine: {
    title: 'Slot Machine',
    description: 'Three reels stop and align for a lottery play.',
    tags: ['CSS', 'Interactive']
  },
  DiceRoll: {
    title: 'Dice Roll',
    description: '3D CSS dice tumble to a face value.',
    tags: ['CSS', '3D']
  },
  RedPacketRain: {
    title: 'Red Packet Rain',
    description: 'Red packets fall from above; click to grab them.',
    tags: ['Canvas', 'Interactive']
  },
  ProgressChest: {
    title: 'Progress Chest',
    description: 'Chest opens with an animation when progress fills.',
    tags: ['CSS', 'Animation']
  },
  RadarScan: {
    title: 'Radar Scan',
    description: 'Circular radar HUD with scanning blips.',
    tags: ['Canvas', 'Effect']
  },
  CanvasClock: {
    title: 'Canvas Clock',
    description: 'Analog clock drawn with Canvas.',
    tags: ['Canvas', 'Animation']
  },
  FlipCounter: {
    title: 'Flip Counter',
    description: 'Mechanical flip-board style number display.',
    tags: ['CSS', 'Animation']
  },
  Countdown: {
    title: 'Countdown',
    description: 'Event deadline countdown with an end callback.',
    tags: ['CSS', 'Interactive']
  },
  CountUp: {
    title: 'Count Up',
    description: 'Eased number growth animation for metric cards and ops dashboards.',
    tags: ['CSS', 'Data']
  },
  LiquidProgress: {
    title: 'Liquid Progress',
    description: 'Ring progress filled by a wobbling liquid.',
    tags: ['SVG', 'Animation']
  },
  AudioVisualizer: {
    title: 'Audio Visualizer',
    description: 'Bar waveform that pulses with audio.',
    tags: ['Canvas', 'Audio']
  },
  Speedometer: {
    title: 'Speedometer',
    description: 'Needle arc gauge animation.',
    tags: ['SVG', 'Animation']
  },
  TimelinePulse: {
    title: 'Timeline Pulse',
    description: 'Horizontal timeline with a glowing current node.',
    tags: ['CSS', 'Animation']
  },
  OrbitalChart: {
    title: 'Orbital Chart',
    description: 'Orbiting dots on rings that represent proportions.',
    tags: ['SVG', 'Animation']
  },
  NetworkGraph: {
    title: 'Network Graph',
    description: 'Force-directed network: drag to layout, hover to highlight neighbors.',
    tags: ['Canvas', 'Data']
  },
  NewtonCradle: {
    title: 'Newton Cradle',
    description: 'Classic colliding-ball pendulum animation.',
    tags: ['CSS', 'Physics']
  },
  GravityBalls: {
    title: 'Gravity Balls',
    description: 'Balls collide under gravity inside a container.',
    tags: ['Canvas', 'Physics']
  },
  SandFall: {
    title: 'Sand Fall',
    description: 'Hold and draw sand on the canvas; simulate gravity pile-up.',
    tags: ['Canvas', 'Physics']
  },
  SpringMass: {
    title: 'Spring-Mass Grid',
    description: '2D spring-mass grid with fixed corners; drag a node to watch rebound.',
    tags: ['Canvas', 'Physics']
  },
  DoublePendulum: {
    title: 'Double Pendulum',
    description: 'Chaotic double-pendulum trail showing the butterfly effect.',
    tags: ['Canvas', 'Physics']
  },
  MetaballPool: {
    title: 'Metaball Pool',
    description: 'Soft metaballs merge; the mouse pushes the liquid aside.',
    tags: ['Canvas', 'Physics']
  },
  RopeChain: {
    title: 'Rope Chain',
    description: 'Verlet-integrated rope you can drag and swing.',
    tags: ['Canvas', 'Physics']
  },
  DnaHelix: {
    title: 'DNA Helix',
    description: 'Rotating double-helix structure.',
    tags: ['Canvas', '3D']
  },
  SolarSystem: {
    title: 'Solar System',
    description: 'Planets orbit the sun with a moon around Earth, plus Saturn’s rings.',
    tags: ['Canvas', 'Astronomy']
  },
  LorenzAttractor: {
    title: 'Lorenz Attractor',
    description: '3D chaotic butterfly trail with a slow rotation view.',
    tags: ['Canvas', 'Math']
  },
  MazeGenerator: {
    title: 'Maze Generator',
    description: 'Live DFS maze generation and drawing.',
    tags: ['Canvas', 'Algorithm']
  },
  GameOfLife: {
    title: 'Game of Life',
    description: 'Classic Conway Game of Life with pause, random reset, and click seeding.',
    tags: ['Canvas', 'Algorithm']
  },
  Fireworks: {
    title: 'Fireworks',
    description: 'Canvas fireworks with ref-triggered launches.',
    tags: ['Canvas', 'Interactive']
  },
  ReturnCity: {
    title: 'Return City',
    description: 'Return-portal visual with starfield and light walls.',
    tags: ['CSS', '3D']
  },
  ElectricArc: {
    title: 'Electric Arc',
    description: 'Random lightning connecting two points.',
    tags: ['Canvas', 'Effect']
  },
  PlasmaBall: {
    title: 'Plasma Ball',
    description: 'Electrostatic ball effect; mouse attracts the arcs.',
    tags: ['Canvas', 'Interactive']
  }
} as const satisfies Record<string, ComponentMetaI18n>;

/** Union of component names that have English meta. */
export type ComponentMetaName = keyof typeof componentMetaEn;

/** Chinese literals that appear inside zh code examples, mapped to their English form. */
const CODE_EXAMPLE_EN: Record<string, string> = {
  '接入 Open-Meteo 实况：把 live 改为 true': 'Set live to true to use Open-Meteo live weather',
  'text="点我"': 'text="Click me"',
  '<Spotlight>隐藏内容</Spotlight>': '<Spotlight>Hidden content</Spotlight>',
  '<MagneticButton>磁吸我</MagneticButton>': '<MagneticButton>Magnetic button</MagneticButton>',
  'subtitle="全息会员卡"': 'subtitle="Holographic member card"',
  '<ClickSpark>点击任意位置</ClickSpark>': '<ClickSpark>Click anywhere</ClickSpark>',
  '<LiquidGlass>毛玻璃内容</LiquidGlass>': '<LiquidGlass>Frosted glass content</LiquidGlass>',
  "label: '一等奖'": "label: 'First prize'",
  'prize="🎉 恭喜中奖！"': 'prize="🎉 You won!"',
  "['设计','开发','测试','上线']": "['Design','Build','Test','Launch']",
  "title: '在路上', description: '把远方装进相册', alt: '在路上'":
    "title: 'On the Road', description: 'Keeping distant places close', alt: 'On the Road'",
  "title: '山谷晨光', description: '风从群山之间吹来', alt: '山谷晨光'":
    "title: 'Morning Valley', description: 'Wind moving between the mountains', alt: 'Morning Valley'",
  "title: '湖畔', description: '安静得只听见水声', alt: '湖畔'":
    "title: 'By the Lake', description: 'Still enough to hear the water', alt: 'By the Lake'",
  "title: '林间漫步', description: '盛夏留下的绿色记忆', alt: '林间漫步'":
    "title: 'Forest Walk', description: 'A green memory from midsummer', alt: 'Forest Walk'",
  "title: '日落时分', description: '旅程在余晖中继续', alt: '日落时分'":
    "title: 'At Sunset', description: 'The journey continues in the afterglow', alt: 'At Sunset'",
  "title: '山脊之上', description: '云海在脚下翻涌', alt: '山脊之上'":
    "title: 'Above the Ridge', description: 'A sea of clouds rolling below', alt: 'Above the Ridge'",
  "title: '海边午后', description: '浪花一遍遍靠近', alt: '海边午后'":
    "title: 'Afternoon Shore', description: 'Waves returning again and again', alt: 'Afternoon Shore'",
  "title: '雪峰星夜', description: '银河落进沉默的山', alt: '雪峰星夜'":
    "title: 'Snow Peak Night', description: 'The Milky Way over quiet mountains', alt: 'Snow Peak Night'",
  "title: '静湖倒影', description: '天空被完整地接住', alt: '静湖倒影'":
    "title: 'Lake Reflection', description: 'The sky held whole in still water', alt: 'Lake Reflection'",
  "title: '远山薄雾', description: '旅途尚未到尽头', alt: '远山薄雾'":
    "title: 'Misty Horizon', description: 'The road still has farther to go', alt: 'Misty Horizon'",
  'ariaLabel="旅行照片相册"': 'ariaLabel="Travel photo album"',
  "previous: '上一张照片'": "previous: 'Previous photo'",
  "next: '下一张照片'": "next: 'Next photo'",
  "empty: '暂无照片'": "empty: 'No photos'",
  "flyleafTitle: '旅行相册'": "flyleafTitle: 'Photo Album'",
  "flyleafSubtitle: '把远方装进这一页'": "flyleafSubtitle: 'Keeping distant places close'",
  "flyleafEndTitle: '完'": "flyleafEndTitle: 'The End'",
  "flyleafEndSubtitle: '故事暂告一段落'": "flyleafEndSubtitle: 'Thank you for browsing'"
};

const CODE_EXAMPLE_PROPS_EN: Partial<Record<ComponentMetaName, string[]>> = {
  WeatherBackground: ['ariaLabel="Weather background"', 'loadingText="Loading weather…"'],
  RippleWater: ['hint="Click the water to create ripples"'],
  SmokeFog: ['ariaLabel="Smoke background; click to disperse"'],
  MatrixRain: ['subtitle="Digital rain effect"'],
  ParticleNetwork: ['hint="Move the pointer or touch to interact with particles"'],
  BurnAway: ['completedText="Gone."'],
  CursorTrail: ['hint="Move the pointer to see the particle trail"'],
  Turntable: ['buttonText="Spin"', 'spinningText="Spinning..."', 'resultPrefix="You won: "'],
  Confetti: ['hint="Click the canvas to burst again"'],
  ScratchCard: ['coverText="Scratch to reveal"'],
  SlotMachine: [
    'startText="Start"',
    'spinningText="Spinning..."',
    'jackpotText="🎰 Jackpot!"',
    'resultPrefix="Result:"'
  ],
  DiceRoll: ['rollText="Roll dice"', 'rollingText="Rolling..."', 'resultPrefix="Result:"'],
  RedPacketRain: [
    'grabbedLabel="Collected:"',
    'endedText="Red packet rain ended"',
    'hint="Click red packets to collect them"'
  ],
  ProgressChest: ['label="Auto-filling chest"', 'openedLabel="Chest opened!"'],
  Countdown: [
    "labels={{ days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' }}",
    'invalidText="Invalid target time"',
    'endedText="Time\'s up!"'
  ],
  NetworkGraph: ['hint="Drag nodes · Hover to view connections"'],
  SandFall: ['hint="Hold the pointer to draw sand"', 'clearText="Clear"'],
  SpringMass: ['hint="Drag grid nodes to see the springs rebound"'],
  GameOfLife: [
    "labels={{ generation: 'Generation', alive: 'alive', pause: 'Pause', play: 'Play', randomize: 'Randomize' }}"
  ],
  Fireworks: ['hint="Click the canvas to launch fireworks"']
};

const appendJsxProps = (code: string, props: string[]) => code.replace(/\s*\/>\s*$/, `\n  ${props.join('\n  ')}\n/>`);

/** Translate the Chinese copy embedded in a demo code example. */
export function localizeCodeExample(code: string, locale: Locale, componentName?: string): string {
  if (locale === 'zh-CN') return code;
  const translated = Object.entries(CODE_EXAMPLE_EN).reduce((acc, [zh, en]) => acc.replaceAll(zh, en), code);
  const props = componentName ? CODE_EXAMPLE_PROPS_EN[componentName as ComponentMetaName] : undefined;
  return props ? appendJsxProps(translated, props) : translated;
}

/**
 * Verify English meta covers every entry in `componentDemos` (and has no extras).
 * Call from tests / CI — `componentDemos` is typed as `ComponentDemoItem[]`, so names widen to `string`.
 */
export function assertComponentMetaCoverage(demos: ReadonlyArray<{ name: string }> = componentDemos): void {
  const metaNames = new Set(Object.keys(componentMetaEn));
  const demoNames = new Set(demos.map((d) => d.name));
  const missing = [...demoNames].filter((n) => !metaNames.has(n));
  const extras = [...metaNames].filter((n) => !demoNames.has(n));
  if (missing.length > 0 || extras.length > 0) {
    throw new Error(`componentMetaEn coverage mismatch. missing=[${missing.join(', ')}] extras=[${extras.join(', ')}]`);
  }
}
