import React, { useEffect, useState } from 'react';
import styles from './style/index.module.less';

export interface TypewriterProps {
  /** 轮播文案列表 */
  texts?: string[];
  /** 打字速度（毫秒/字符） */
  speed?: number;
  /** 删除速度（毫秒/字符） */
  deleteSpeed?: number;
  /** 完整展示后的停顿（毫秒） */
  pause?: number;
}

const DEFAULT_TEXTS = ['Hello, cos-design!', '欢迎来到组件库 ✨', 'Build something fun 🚀'];

const Typewriter: React.FC<TypewriterProps> = ({
  texts = DEFAULT_TEXTS,
  speed = 100,
  deleteSpeed = 50,
  pause = 2000
}) => {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex % texts.length];
    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayText === current) {
      timer = setTimeout(() => setIsDeleting(true), pause);
    } else if (isDeleting && displayText === '') {
      timer = setTimeout(() => {
        setIsDeleting(false);
        setTextIndex((i) => (i + 1) % texts.length);
      }, 0);
    } else {
      const next = isDeleting ? current.slice(0, displayText.length - 1) : current.slice(0, displayText.length + 1);
      timer = setTimeout(() => setDisplayText(next), isDeleting ? deleteSpeed : speed);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, textIndex, texts, speed, deleteSpeed, pause]);

  return (
    <div className={styles.typewriter}>
      <div className={styles.terminal}>
        <div className={styles.dots}>
          <span />
          <span />
          <span />
        </div>
        <p className={styles.text}>
          <span className={styles.prompt}>{'>'}</span>
          {displayText}
          <span className={styles.cursor}>|</span>
        </p>
      </div>
    </div>
  );
};

export default Typewriter;
