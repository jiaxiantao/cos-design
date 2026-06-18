import { useEffect, useState } from 'react';
import { FlipCounter } from '@/components';
import styles from './style/index.module.less';

const FlipCounterDemo = () => {
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
      <p className={styles.hint}>数值每 2 秒自动递增</p>
    </div>
  );
};

export default FlipCounterDemo;
