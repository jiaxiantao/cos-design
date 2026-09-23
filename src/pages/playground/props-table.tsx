import { useTranslation } from 'react-i18next';
import {
  componentProps,
  componentRelatedTypes,
  type ComponentPropDoc,
  type ComponentTypeDoc,
} from '../config/component-props';
import { useLocale } from '../i18n';
import { localizePropDescription } from '../i18n/prop-descriptions-en';
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

const PropRows = ({
  rows,
  locale,
  empty,
  showDefault,
}: {
  rows: ComponentPropDoc[];
  locale: string;
  empty: string;
  showDefault: boolean;
}) => {
  const { t } = useTranslation();
  const hideCjkDefaults = locale !== 'zh-CN';

  return (
    <>
      {rows.map((prop) => {
        const propName = hideCjkDefaults && hasCjk(prop.name) ? empty : prop.name;
        const description = localizePropDescription(prop.description, locale);

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
            {showDefault ? (
              <td>
                <code className={styles.propDefault}>
                  {formatDefault(prop.default, empty, hideCjkDefaults)}
                </code>
              </td>
            ) : null}
            <td className={styles.propDesc}>{description || empty}</td>
          </tr>
        );
      })}
    </>
  );
};

const RelatedTypes = ({ types }: { types: ComponentTypeDoc[] }) => {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const empty = t('propsTable.empty');

  return (
    <div className={styles.relatedTypes}>
      <div className={styles.header}>
        <h3 className={styles.subTitle}>{t('propsTable.typesTitle')}</h3>
        <span className={styles.count}>{t('propsTable.typesCount', { value: types.length })}</span>
      </div>
      <p className={styles.desc}>{t('propsTable.typesDesc')}</p>
      {types.map((typeDoc) => (
        <div key={typeDoc.name} className={styles.typeBlock}>
          <h4 className={styles.typeName}>
            <code>{typeDoc.name}</code>
          </h4>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('propsTable.colName')}</th>
                  <th>{t('propsTable.colType')}</th>
                  <th>{t('propsTable.colRequired')}</th>
                  <th>{t('propsTable.colDescription')}</th>
                </tr>
              </thead>
              <tbody>
                <PropRows rows={typeDoc.fields} locale={locale} empty={empty} showDefault={false} />
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

const PropsTable = ({ componentName }: PropsTableProps) => {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const propList = componentProps[componentName];
  const relatedTypes = componentRelatedTypes[componentName] ?? [];

  if (!propList?.length) {
    return null;
  }

  const empty = t('propsTable.empty');

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
            <PropRows rows={propList} locale={locale} empty={empty} showDefault />
          </tbody>
        </table>
      </div>
      {relatedTypes.length > 0 ? <RelatedTypes types={relatedTypes} /> : null}
    </section>
  );
};

export default PropsTable;
