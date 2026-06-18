import { useRef } from 'react';
import { Fireworks, type FireworksHandle } from '@/components';
import styles from './style/index.module.less';

const FireworksDemo = () => {
  const ref = useRef<FireworksHandle>(null);

  return (
    <div className={styles.wrap}>
      <Fireworks ref={ref} auto={false} width={800} height={500} />
      <button type="button" className={styles.trigger} onClick={() => ref.current?.launch()}>
        手动燃放
      </button>
    </div>
  );
};

export default FireworksDemo;
