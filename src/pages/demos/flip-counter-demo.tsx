import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlipCounter } from '@/components';
import styles from './style/index.module.less';

const FlipCounterDemo = () => {
  const { t } = useTranslation();
  const [value, setValue] = useState(1024);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setValue((v) => v + Math.floor(Math.random() * 9) + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.wrap}>
      <FlipCounter value={value} digits={5} color="#38bdf8" />
      <p className={styles.hint}>{t('demos.flipCounterHint')}</p>
    </div>
  );
};

export default FlipCounterDemo;
