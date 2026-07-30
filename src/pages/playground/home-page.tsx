import { Link } from 'react-router-dom';
import { COMPONENT_CATEGORIES } from '../config/categories';
import { componentDemos } from '../config/components';
import cosLogoUrl from '@/assets/icons/cos-logo.svg';
import styles from './style/home-page.module.less';

const FEATURES = [
  {
    title: '开箱即用',
    desc: '安装后直接导入，样式自动注入，完整 TypeScript 类型。'
  },
  {
    title: '按需拆包',
    desc: '可用 cos-design 一次装齐，或按 @cos-design/* 只装需要的组件。'
  },
  {
    title: '场景覆盖全',
    desc: '从背景氛围到营销玩法，从数据大屏到物理与算法可视化。'
  },
  {
    title: '在线可玩',
    desc: '每个组件都有 Live Demo，改 props 即时预览，示例代码可复制。'
  }
];

const SCENARIOS = [
  { title: '营销活动页', desc: '转盘抽奖、刮刮乐、烟花庆祝' },
  { title: '品牌 Landing', desc: '极光背景、霓虹标题、全息卡片' },
  { title: '数据大屏', desc: '翻牌器、倒计时、液态进度' },
  { title: '创意展示', desc: '牛顿摆、迷宫生成、生命游戏' }
];

const HomePage = () => {
  const newCount = componentDemos.filter((item) => item.isNew).length;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        <img className={styles.heroLogo} src={cosLogoUrl} alt="" />
        <p className={styles.eyebrow}>React Visual Effect Library</p>
        <h1 className={styles.title}>为页面加上记忆点</h1>
        <p className={styles.subtitle}>
          <strong>cos-design</strong> 是面向视觉表达的 React
          组件库——专注特效与氛围，给活动页、品牌页与创意展示加趣味与记忆点。
        </p>

        <div className={styles.heroActions}>
          <Link to="/catalog" className={styles.primaryBtn}>
            浏览组件目录
          </Link>
          <Link to="/quickstart" className={styles.secondaryBtn}>
            快速开始
          </Link>
          <a
            className={styles.ghostBtn}
            href="https://www.npmjs.com/package/cos-design"
            target="_blank"
            rel="noreferrer"
          >
            npm 文档
          </a>
        </div>

        <div className={styles.metrics}>
          <div className={styles.metric}>
            <strong>{componentDemos.length}</strong>
            <span>视觉组件</span>
          </div>
          <div className={styles.metric}>
            <strong>{COMPONENT_CATEGORIES.length}</strong>
            <span>场景分类</span>
          </div>
          <div className={styles.metric}>
            <strong>{newCount || '—'}</strong>
            <span>近期新增</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>为什么用 cos-design</h2>
        <div className={styles.featureGrid}>
          {FEATURES.map((item) => (
            <article key={item.title} className={styles.featureCard}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>适合这些场景</h2>
        <div className={styles.scenarioGrid}>
          {SCENARIOS.map((item) => (
            <article key={item.title} className={styles.scenarioCard}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>组件分类</h2>
          <Link to="/catalog" className={styles.sectionLink}>
            查看全部 →
          </Link>
        </div>
        <div className={styles.categoryGrid}>
          {COMPONENT_CATEGORIES.map((cat) => {
            const count = componentDemos.filter((item) => item.category === cat.id).length;
            return (
              <Link key={cat.id} to="/catalog" className={styles.categoryCard}>
                <span className={styles.categoryAccent} style={{ background: cat.accent }} />
                <div className={styles.categoryBody}>
                  <div className={styles.categoryTop}>
                    <h3>{cat.label}</h3>
                    <span>{count}</span>
                  </div>
                  <p>{cat.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.cta}>
        <div>
          <h2>几分钟接入第一个特效</h2>
          <p>安装 cos-design 或按需安装 @cos-design/*，复制示例即可上线。</p>
        </div>
        <div className={styles.ctaActions}>
          <Link to="/quickstart" className={styles.primaryBtn}>
            阅读快速开始
          </Link>
          <Link to="/catalog" className={styles.secondaryBtn}>
            进入组件目录
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
