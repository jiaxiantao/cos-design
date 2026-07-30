import { useState } from 'react';
import cosLogo from '@/assets/icons/cos-logo-light.svg';
import { DEFAULT_BACKGROUND_HEADLINE } from './background-demo-headlines';
import styles from './style/background-demo-content.module.less';

export interface BackgroundDemoContentProps {
  /** 主标题 */
  headline?: string;
  /** 副标题（预留，当前布局不展示） */
  subtitle?: string;
}

const BackgroundDemoContent = ({ headline = DEFAULT_BACKGROUND_HEADLINE }: BackgroundDemoContentProps) => {
  const [showContent, setShowContent] = useState(true);

  return (
    <div className={styles.root}>
      <div className={styles.switchWrap}>
        <button
          type="button"
          className={styles.switchTrack}
          role="switch"
          aria-checked={showContent}
          aria-label="示例文案"
          data-checked={showContent}
          onClick={() => setShowContent((v) => !v)}
        >
          <span className={styles.switchLabel}>示例文案</span>
          <span className={styles.switchToggle}>
            <span className={styles.switchKnob} />
          </span>
        </button>
      </div>

      {showContent ? (
        <>
          <div className={styles.nav}>
            <div className={styles.navBar}>
              <div className={styles.navBrand}>
                <img src={cosLogo} alt="" className={styles.logo} />
                <span className={styles.brandName}>COS Design</span>
              </div>
              <div className={styles.navLinks}>
                {['组件', '文档'].map((item) => (
                  <span key={item} className={styles.navLink}>
                    {item}
                  </span>
                ))}
                <span className={styles.signUp}>开始使用</span>
              </div>
              <span className={styles.menuIcon} aria-hidden>
                ☰
              </span>
            </div>
          </div>

          <div className={styles.hero}>
            <div className={styles.tag}>
              <span className={styles.tagAccent} aria-hidden />
              <span className={styles.tagLabel}>NEW</span>
              <span className={styles.tagDivider} aria-hidden />
              <span className={styles.tagText}>背景动效已上线</span>
            </div>
            <h2 className={styles.headline}>{headline}</h2>
            <div className={styles.actions}>
              <span className={styles.primaryBtn}>立即体验</span>
              <span className={styles.secondaryBtn}>了解更多</span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default BackgroundDemoContent;
