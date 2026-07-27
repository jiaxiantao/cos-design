import { Link } from 'react-router-dom';
import { COMPONENT_CATEGORIES } from '../config/categories';
import { componentDemos } from '../config/components';
import styles from './style/quickstart-page.module.less';

const INSTALL_FULL_SNIPPET = `# 安装全部组件（推荐快速试用）
pnpm add cos-design
# 或 npm install cos-design / yarn add cos-design`;

const INSTALL_SINGLE_SNIPPET = `# 只装需要的组件（体积更小）
pnpm add @cos-design/weather-background
pnpm add @cos-design/fireworks
pnpm add @cos-design/scratch-card`;

const BASIC_SNIPPET = `import { Fireworks, ScrambleText, ScratchCard } from 'cos-design';

export default function Page() {
  return (
    <>
      <ScrambleText text="GRAND OPENING" />
      <ScratchCard prize="🎉 恭喜中奖！" />
      <Fireworks width={800} height={500} />
    </>
  );
}`;

const SINGLE_SNIPPET = `import { WeatherBackground } from '@cos-design/weather-background';
import { Fireworks } from '@cos-design/fireworks';

export default function Page() {
  return (
    <>
      <WeatherBackground weather="thunderstorm" width={800} height={450} />
      <Fireworks width={800} height={500} />
    </>
  );
}`;

const SSR_SNIPPET = `import dynamic from 'next/dynamic';

const Fireworks = dynamic(
  () => import('cos-design').then((m) => m.Fireworks),
  { ssr: false }
);

// 按需包同样适用：
// const WeatherBackground = dynamic(
//   () => import('@cos-design/weather-background').then((m) => m.WeatherBackground),
//   { ssr: false }
// );`;

const IMPERATIVE_SNIPPET = `import { useRef } from 'react';
import { Fireworks, type FireworksHandle } from 'cos-design';

const ref = useRef<FireworksHandle>(null);
// <Fireworks ref={ref} auto={false} />
// ref.current?.launch();`;

const NOTES = [
  {
    title: '无需手动引入 CSS',
    desc: '样式随组件自动注入，安装后即可使用。'
  },
  {
    title: '两种安装方式',
    desc: 'cos-design 一次装齐全部；@cos-design/<kebab-name> 按需安装单个组件。依赖 @cos-design/shared 的组件会自动带上工具包。'
  },
  {
    title: '包名是 kebab-case',
    desc: '源码目录 weatherBackground 对应 npm 包 @cos-design/weather-background（npm 要求新包名全小写）。'
  },
  {
    title: 'Canvas 组件请客户端渲染',
    desc: 'Next.js 等 SSR 框架请用 dynamic(..., { ssr: false })，避免 window / canvas 报错。'
  },
  {
    title: '控制动画密度',
    desc: '建议每页「一个强视觉背景 + 若干局部交互」，避免多个全屏 Canvas 同时运行。'
  },
  {
    title: '明确容器尺寸',
    desc: 'Canvas 组件需传入 width / height，父级也应有可见高度，否则可能渲染为空白。'
  },
  {
    title: '后台自动省电',
    desc: '多数 Canvas 组件在标签页隐藏时会暂停 requestAnimationFrame。'
  },
  {
    title: '麦克风权限',
    desc: 'AudioVisualizer 在 useMic 为 true 时会请求麦克风，需在 HTTPS 下使用并给用户提示。'
  },
  {
    title: '命令式触发',
    desc: 'Fireworks、Confetti 支持 ref 调用 launch / burst，适合按钮触发庆祝效果。'
  },
  {
    title: 'TypeScript 开箱即用',
    desc: '所有组件导出 Props 类型，如 import { Turntable, type TurntableProps } from "cos-design"。'
  }
];

const CATEGORIES = [
  { label: '背景动效', desc: '全屏氛围、粒子场景', examples: 'MatrixRain、Aurora、Starfield' },
  { label: '文字动效', desc: '标题与 Banner 动画', examples: 'Typewriter、NeonText、ScrambleText' },
  { label: '交互玩具', desc: '鼠标/触摸趣味反馈', examples: 'WaveButton、Spotlight、MagneticButton' },
  { label: '游戏营销', desc: '抽奖与活动玩法', examples: 'Turntable、ScratchCard、Charge' },
  { label: '数据装饰', desc: '大屏与时间展示', examples: 'FlipCounter、Countdown、LiquidProgress' },
  { label: '物理模拟', desc: '重力、弹簧、碰撞互动', examples: 'NewtonCradle、SandFall、SpringMass' },
  { label: '科学算法', desc: '天文、混沌与算法可视化', examples: 'SolarSystem、GameOfLife、MazeGenerator' },
  { label: '视觉特效', desc: '烟花、电弧等视觉实验', examples: 'Fireworks、ElectricArc、PlasmaBall' }
];

const NAMING_ROWS = [
  { dir: 'weatherBackground', pkg: '@cos-design/weather-background' },
  { dir: 'scratchCard', pkg: '@cos-design/scratch-card' },
  { dir: 'matrixRain', pkg: '@cos-design/matrix-rain' },
  { dir: 'fireworks', pkg: '@cos-design/fireworks' }
];

const QuickstartPage = () => (
  <div className={styles.page}>
    <header className={styles.hero}>
      <p className={styles.eyebrow}>Quick Start</p>
      <h1 className={styles.title}>快速开始</h1>
      <p className={styles.subtitle}>
        几分钟内完成安装与接入。支持一次安装全部，或按组件拆包按需安装。左侧分类浏览全部组件，每页可复制对应示例代码。
      </p>
      <div className={styles.heroActions}>
        <a
          className={styles.primaryBtn}
          href="https://www.npmjs.com/package/cos-design"
          target="_blank"
          rel="noreferrer"
        >
          聚合包 cos-design
        </a>
        <a className={styles.secondaryBtn} href="https://www.npmjs.com/org/cos-design" target="_blank" rel="noreferrer">
          @cos-design 子包
        </a>
      </div>
    </header>

    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>1. 安装</h2>
      <p className={styles.sectionDesc}>要求 React &gt;= 18，Node.js &gt;= 20。任选一种方式：</p>

      <h3 className={styles.subHeading}>方式 A：安装全部组件</h3>
      <p className={styles.sectionDesc}>适合快速试用、多组件同页，API 与以往一致。</p>
      <pre className={styles.code}>
        <code>{INSTALL_FULL_SNIPPET}</code>
      </pre>

      <h3 className={styles.subHeading}>方式 B：按需安装单个组件</h3>
      <p className={styles.sectionDesc}>
        只下载用到的包，减小依赖体积。包名规则：源码目录 camelCase → npm 包 kebab-case。
      </p>
      <pre className={styles.code}>
        <code>{INSTALL_SINGLE_SNIPPET}</code>
      </pre>
      <div className={styles.namingTable}>
        <div className={styles.namingHead}>
          <span>组件目录</span>
          <span>npm 包名</span>
        </div>
        {NAMING_ROWS.map((row) => (
          <div key={row.pkg} className={styles.namingRow}>
            <code>{row.dir}</code>
            <code>{row.pkg}</code>
          </div>
        ))}
      </div>
      <p className={styles.sectionDesc}>
        依赖共享工具的组件会自动安装 <code className={styles.inlineCode}>@cos-design/shared</code>
        ，无需手动添加。各组件页标题旁也可复制对应安装命令。
      </p>
    </section>

    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>2. 基础用法</h2>
      <h3 className={styles.subHeading}>从聚合包导入</h3>
      <p className={styles.sectionDesc}>按需导入组件，无需单独引入样式文件。</p>
      <pre className={styles.code}>
        <code>{BASIC_SNIPPET}</code>
      </pre>
      <h3 className={styles.subHeading}>从子包导入</h3>
      <p className={styles.sectionDesc}>
        安装对应 <code className={styles.inlineCode}>@cos-design/*</code> 后，从该包导入即可。
      </p>
      <pre className={styles.code}>
        <code>{SINGLE_SNIPPET}</code>
      </pre>
    </section>

    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>3. 组件分类</h2>
      <p className={styles.sectionDesc}>
        共 {componentDemos.length} 个组件，按场景分为 {COMPONENT_CATEGORIES.length} 类。点击左侧导航进入演示，或
        <Link to="/" className={styles.inlineLink}>
          返回目录
        </Link>
        浏览全部。
      </p>
      <div className={styles.categoryGrid}>
        {CATEGORIES.map((cat) => (
          <article key={cat.label} className={styles.categoryCard}>
            <h3>{cat.label}</h3>
            <p>{cat.desc}</p>
            <span>{cat.examples}</span>
          </article>
        ))}
      </div>
    </section>

    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>4. 注意事项</h2>
      <ul className={styles.noteList}>
        {NOTES.map((note) => (
          <li key={note.title}>
            <strong>{note.title}</strong>
            <span>{note.desc}</span>
          </li>
        ))}
      </ul>
    </section>

    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>5. 常见模式</h2>
      <h3 className={styles.subHeading}>Next.js 关闭 SSR</h3>
      <pre className={styles.code}>
        <code>{SSR_SNIPPET}</code>
      </pre>
      <h3 className={styles.subHeading}>命令式触发烟花</h3>
      <pre className={styles.code}>
        <code>{IMPERATIVE_SNIPPET}</code>
      </pre>
    </section>

    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>6. 本地开发本仓库</h2>
      <pre className={styles.code}>
        <code>{`git clone https://github.com/jiaxiantao/cos-design.git
cd cos-design && npm run setup && pnpm dev
# 访问 http://localhost:4000`}</code>
      </pre>
    </section>
  </div>
);

export default QuickstartPage;
