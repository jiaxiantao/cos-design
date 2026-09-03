import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Fireworks, type FireworksHandle } from '@/components';
import styles from './style/index.module.less';

const FireworksDemo = () => {
  const ref = useRef<FireworksHandle>(null);
  const { t } = useTranslation();

  return (
    <div className={styles.wrap}>
      <Fireworks
        ref={ref}
        auto={false}
        width={800}
        height={500}
        hint={t('demos.componentCopy.fireworksHint')}
      />
      <button type="button" className={styles.trigger} onClick={() => ref.current?.launch()}>
        {t('demos.fireworksLaunch')}
      </button>
    </div>
  );
};

export default FireworksDemo;
