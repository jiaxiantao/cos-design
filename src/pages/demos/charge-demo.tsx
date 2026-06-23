import { useState } from 'react';
import { Charge } from '@/components';
import styles from './style/index.module.less';

const ChargeDemo = () => {
  const [value, setValue] = useState(50);
  const [autoCharge, setAutoCharge] = useState(false);

  return (
    <div className={styles.chargeDemo}>
      <Charge value={value} autoCharge={autoCharge} onChange={setValue} />
      <div className={styles.chargeControls}>
        <label className={styles.chargeLabel}>
          电量 {value.toFixed(0)}%
          <input
            className={styles.chargeSlider}
            type="range"
            min={0}
            max={100}
            step={1}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />
        </label>
        <label className={styles.chargeToggle}>
          <input type="checkbox" checked={autoCharge} onChange={(e) => setAutoCharge(e.target.checked)} />
          自动充电
        </label>
      </div>
    </div>
  );
};

export default ChargeDemo;
