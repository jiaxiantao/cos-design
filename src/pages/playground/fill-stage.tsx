import React, { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import styles from './style/fill-stage.module.less';

/** Fixed playground stage height — never derive height from children (avoids grow loops). */
export const FILL_STAGE_HEIGHT = 480;

interface Size {
  width: number;
  height: number;
}

interface FillStageProps {
  children?: ReactNode;
  overlay?: ReactNode;
}

/**
 * 固定高度舞台：宽度跟父级，高度恒为 FILL_STAGE_HEIGHT。
 * 向子组件注入 width / height（像素），子组件应使用显式尺寸而非 fill 百分比。
 */
const FillStage = ({ children, overlay }: FillStageProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: FILL_STAGE_HEIGHT });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;

    const update = () => {
      const width = Math.max(1, Math.floor(parent?.clientWidth || el.clientWidth));
      setSize((prev) =>
        prev.width === width && prev.height === FILL_STAGE_HEIGHT
          ? prev
          : { width, height: FILL_STAGE_HEIGHT },
      );
    };

    update();
    const ro = new ResizeObserver(update);
    // Only observe the parent for width — never self, or child-driven height feeds back.
    if (parent) ro.observe(parent);
    else ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const child = React.Children.toArray(children).find((node): node is ReactElement =>
    React.isValidElement(node),
  );

  return (
    <div ref={ref} className={styles.fillStage} style={{ height: FILL_STAGE_HEIGHT }}>
      {child && size.width > 0
        ? React.cloneElement(child as ReactElement<Record<string, unknown>>, {
            width: size.width,
            height: size.height,
            fill: false,
          })
        : null}
      {overlay}
    </div>
  );
};

export default FillStage;
