import { useTranslation } from 'react-i18next';
import { componentProps, type ComponentPropDoc } from '../config/component-props';
import { useLocale } from '../i18n';
import styles from './style/props-table.module.less';

interface PropsTableProps {
  componentName: string;
}

const hasCjk = (value: string) => /[\u4e00-\u9fff]/.test(value);

const formatDefault = (value: string, emptyLabel: string, hideCjk: boolean) => {
  if (!value || (hideCjk && hasCjk(value))) return emptyLabel;
  if (value.length > 48) return `${value.slice(0, 45)}…`;
  return value;
};

/** 字符串联合类型拆分为标签展示，其余类型原样输出 */
const TypeCell = ({ type }: { type: string }) => {
  const parts = type.split(' | ');
  const isStringUnion = parts.length > 2 && parts.every((p) => /^'.*'$/.test(p.trim()));

  if (!isStringUnion) {
    return <code className={styles.propType}>{type}</code>;
  }

  return (
    <span className={styles.typeUnion}>
      {parts.map((part) => (
        <code key={part} className={styles.typeTag}>
          {part.trim().replace(/^'|'$/g, '')}
        </code>
      ))}
    </span>
  );
};

const PropsTable = ({ componentName }: PropsTableProps) => {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const propList = componentProps[componentName];

  if (!propList?.length) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('propsTable.title')}</h2>
        <span className={styles.count}>{t('propsTable.count', { value: propList.length })}</span>
      </div>
      <p className={styles.desc}>{t('propsTable.desc')}</p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('propsTable.colName')}</th>
              <th>{t('propsTable.colType')}</th>
              <th>{t('propsTable.colRequired')}</th>
              <th>{t('propsTable.colDefault')}</th>
              <th>{t('propsTable.colDescription')}</th>
            </tr>
          </thead>
          <tbody>
            {propList.map((prop: ComponentPropDoc) => {
              const hideCjk = locale !== 'zh-CN';
              const empty = t('propsTable.empty');
              // extract-props 目前只产出中文说明和默认值文案；英文模式先隐藏 CJK，避免串语言
              const propName = hideCjk && hasCjk(prop.name) ? empty : prop.name;
              const description = hideCjk ? '' : prop.description;

              return (
                <tr key={prop.name}>
                  <td>
                    <code className={styles.propName}>{propName}</code>
                  </td>
                  <td className={styles.typeCell}>
                    <TypeCell type={prop.type} />
                  </td>
                  <td>
                    <span className={prop.required ? styles.required : styles.optional}>
                      {prop.required ? t('propsTable.requiredYes') : t('propsTable.requiredNo')}
                    </span>
                  </td>
                  <td>
                    <code className={styles.propDefault}>{formatDefault(prop.default, empty, hideCjk)}</code>
                  </td>
                  <td className={styles.propDesc}>{description || empty}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PropsTable;
