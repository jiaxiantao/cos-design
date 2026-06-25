import { componentProps, type ComponentPropDoc } from '../config/component-props';
import styles from './style/props-table.module.less';

interface PropsTableProps {
  componentName: string;
}

const formatDefault = (value: string) => {
  if (!value) return '—';
  if (value.length > 48) return `${value.slice(0, 45)}…`;
  return value;
};

const PropsTable = ({ componentName }: PropsTableProps) => {
  const propList = componentProps[componentName];

  if (!propList?.length) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>配置参数</h2>
        <span className={styles.count}>{propList.length} 项</span>
      </div>
      <p className={styles.desc}>以下为组件 Props，可在下方「编辑代码」中直接调整并实时预览。</p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>参数</th>
              <th>类型</th>
              <th>必填</th>
              <th>默认值</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            {propList.map((prop: ComponentPropDoc) => (
              <tr key={prop.name}>
                <td>
                  <code className={styles.propName}>{prop.name}</code>
                </td>
                <td>
                  <code className={styles.propType}>{prop.type}</code>
                </td>
                <td>
                  <span className={prop.required ? styles.required : styles.optional}>
                    {prop.required ? '是' : '否'}
                  </span>
                </td>
                <td>
                  <code className={styles.propDefault}>{formatDefault(prop.default)}</code>
                </td>
                <td className={styles.propDesc}>{prop.description || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PropsTable;
