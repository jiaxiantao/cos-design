import { Link } from 'react-router-dom';
import styles from './style/quickstart-page.module.less';

const INSTALL_SNIPPET = `pnpm add cos-design`;

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

const SSR_SNIPPET = `import dynamic from 'next/dynamic';

const Fireworks = dynamic(
  () => import('cos-design').then((m) => m.Fireworks),
  { ssr: false }
);`;

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
  { label: '物理创意', desc: '物理模拟与视觉实验', examples: 'Fireworks、NewtonCradle、MazeGenerator' }
];

const QuickstartPage = () => (
  <div className={styles.page}>
    <header className={styles.hero}>
      <p className={styles.eyebrow}>Quick Start</p>
      <h1 className={styles.title}>快速开始</h1>
      <p className={styles.subtitle}>几分钟内完成安装与接入。左侧分类浏览全部组件，每页可复制对应示例代码。</p>
      <div className={styles.heroActions}>
        <a
          className={styles.primaryBtn}
          href="https://www.npmjs.com/package/cos-design"
          target="_blank"
          rel="noreferrer"
        >
          npm 包
        </a>
      </div>
    </header>

    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>1. 安装</h2>
      <p className={styles.sectionDesc}>要求 React &gt;= 18，Node.js &gt;= 20。</p>
      <pre className={styles.code}>
        <code>{INSTALL_SNIPPET}</code>
      </pre>
    </section>

    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>2. 基础用法</h2>
      <p className={styles.sectionDesc}>按需导入组件，无需单独引入样式文件。</p>
      <pre className={styles.code}>
        <code>{BASIC_SNIPPET}</code>
      </pre>
    </section>

    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>3. 组件分类</h2>
      <p className={styles.sectionDesc}>
        共 49 个组件，按场景分为 6 类。点击左侧导航进入演示，或
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
