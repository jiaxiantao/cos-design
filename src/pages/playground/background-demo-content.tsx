import cosLogo from '@/assets/icons/cos-logo-champagne.svg';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './style/background-demo-content.module.less';

export interface BackgroundDemoContentProps {
  /** 主标题 */
  headline?: string;
  /** 副标题（预留，当前布局不展示） */
  subtitle?: string;
}

const BackgroundDemoContent = ({ headline }: BackgroundDemoContentProps) => {
  const { t } = useTranslation();
  const [showContent, setShowContent] = useState(true);
  const resolvedHeadline = headline ?? t('backgroundDemo.defaultHeadline');

  return (
    <div className={styles.root}>
      <div className={styles.switchWrap}>
        <button
          type="button"
          className={styles.switchTrack}
          role="switch"
          aria-checked={showContent}
          aria-label={t('backgroundDemo.switchLabel')}
          data-checked={showContent}
          onClick={() => setShowContent((v) => !v)}
        >
          <span className={styles.switchLabel}>{t('backgroundDemo.switchLabel')}</span>
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
                {['navComponents', 'navDocs'].map((key) => (
                  <span key={key} className={styles.navLink}>
                    {t(`backgroundDemo.${key}`)}
                  </span>
                ))}
                <span className={styles.signUp}>{t('backgroundDemo.signUp')}</span>
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
              <span className={styles.tagText}>{t('backgroundDemo.tagText')}</span>
            </div>
            <h2 className={styles.headline}>{resolvedHeadline}</h2>
            <div className={styles.actions}>
              <span className={styles.primaryBtn}>{t('backgroundDemo.primaryCta')}</span>
              <span className={styles.secondaryBtn}>{t('backgroundDemo.secondaryCta')}</span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default BackgroundDemoContent;
