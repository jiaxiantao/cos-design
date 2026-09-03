import { componentDemos } from '../../config/components';
import {
  assertComponentMetaCoverage,
  componentMetaEn,
  type ComponentMetaI18n,
} from '../component-meta';
import enUS from './en-US';
import zhCN from './zh-CN';

/** zh-CN 组件元数据以 `config/components.ts` 为唯一来源，避免两份文案漂移 */
const componentMetaZh = Object.fromEntries(
  componentDemos.map((item) => [
    item.name,
    {
      title: item.title,
      description: item.description,
      tags: item.tags,
    } satisfies ComponentMetaI18n,
  ]),
);

if (import.meta.env.DEV) {
  assertComponentMetaCoverage(componentDemos);
}

export const resources = {
  'zh-CN': { translation: { ...zhCN, components: componentMetaZh } },
  'en-US': { translation: { ...enUS, components: componentMetaEn } },
};
