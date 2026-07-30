import React, { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import styles from './style/fill-stage.module.less';

interface Size {
  width: number;
  height: number;
}

interface FillStageProps {
  children?: ReactNode;
  overlay?: ReactNode;
}

/**
 * 按父容器实际尺寸，向子组件注入 width / height（覆盖示例里的固定画布尺寸）。
 */
const FillStage = ({ children, overlay }: FillStageProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;

    const update = () => {
      // 优先用父级宽度，避免 flex 居中时自身被内容宽度（如默认 800）回缩
      const width = Math.max(1, Math.floor(parent?.clientWidth || el.clientWidth));
      const height = Math.max(1, Math.floor(el.clientHeight));
      setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (parent) ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  const child = React.Children.toArray(children).find((node): node is ReactElement => React.isValidElement(node));

  return (
    <div ref={ref} className={styles.fillStage}>
      {child && size.width > 0
        ? React.cloneElement(child as ReactElement<Record<string, unknown>>, {
            width: size.width,
            height: size.height
          })
        : null}
      {overlay}
    </div>
  );
};

export default FillStage;
