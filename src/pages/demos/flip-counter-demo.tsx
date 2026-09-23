import { useTranslation } from 'react-i18next';
import { FlipCounter } from '@/components';
import styles from './style/index.module.less';

const FlipCounterDemo = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.wrap}>
      <FlipCounter value={1024} digits={5} color="#38bdf8" auto />
      <p className={styles.hint}>{t('demos.flipCounterHint')}</p>
    </div>
  );
};

export default FlipCounterDemo;
