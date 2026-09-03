import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { COMPONENT_CATEGORIES } from '../config/categories';
import { componentDemos } from '../config/components';
import { localizeCodeExample } from './component-meta';
import { normalizeLocale } from './types';

/** 分类元数据（label / description）走 i18n，颜色等视觉配置仍来自 config */
export const useLocalizedCategories = () => {
  const { t } = useTranslation();

  return useMemo(
    () =>
      COMPONENT_CATEGORIES.map((category) => ({
        ...category,
        label: t(`categories.${category.id}.label`),
        description: t(`categories.${category.id}.description`),
      })),
    [t],
  );
};

/** 组件标题、描述、标签与示例代码中的中文文案按语言切换 */
export const useLocalizedComponentDemos = () => {
  const { t, i18n } = useTranslation();
  const locale = normalizeLocale(i18n.language);

  return useMemo(
    () =>
      componentDemos.map((item) => ({
        ...item,
        title: t(`components.${item.name}.title`, { defaultValue: item.title }),
        description: t(`components.${item.name}.description`, { defaultValue: item.description }),
        tags: t(`components.${item.name}.tags`, {
          returnObjects: true,
          defaultValue: item.tags,
        }) as string[],
        codeExample: localizeCodeExample(item.codeExample, locale, item.name),
      })),
    [locale, t],
  );
};

/** 背景类组件预览上的示例文案，未单独配置时回落到通用文案 */
export const useBackgroundDemoCopy = (componentName: string) => {
  const { t } = useTranslation();

  return {
    headline: t(`backgroundDemo.headlines.${componentName}`, {
      defaultValue: t('backgroundDemo.defaultHeadline'),
    }),
    subtitle: t(`backgroundDemo.subtitles.${componentName}`, {
      defaultValue: t('backgroundDemo.defaultSubtitle'),
    }),
  };
};
