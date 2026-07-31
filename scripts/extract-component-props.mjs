/**
 * 从组件源码 *Props 接口与 JSDoc 提取配置参数文档。
 * 运行: pnpm extract-props
 *
 * 支持：
 * - Props 写在 index.tsx
 * - Props 写在同目录 types.ts（如 WeatherBackground）
 * - Props 引用的自定义 interface（如 PhotoAlbumItem）一并输出到 componentRelatedTypes
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const componentsDir = path.join(root, 'src/components');
const outFile = path.join(root, 'src/pages/config/component-props.ts');

/** 收集文件内导出的字符串联合类型别名，如 export type WeatherType = 'sunny' | ... */
const parseTypeAliases = (content) => {
  const aliases = {};
  const re = /export type (\w+)\s*=\s*([\s\S]*?);/g;
  let m;
  while ((m = re.exec(content))) {
    const values = m[2].match(/'[^']*'/g);
    if (values && values.length > 1) aliases[m[1]] = values.join(' | ');
  }
  return aliases;
};

/** 解析 interface 字段（含单行 JSDoc） */
const parseInterfaceFields = (body) => {
  const fields = [];
  const lines = body.split('\n');
  let pendingDoc = '';
  for (const line of lines) {
    const docMatch = line.match(/^\s*\/\*\*\s*(.+?)\s*\*\/\s*$/);
    if (docMatch) {
      pendingDoc = docMatch[1];
      continue;
    }

    const propMatch = line.match(/^\s*(\w+)(\?)?:\s*(.+);\s*$/);
    if (!propMatch) continue;

    const [, name, optional, type] = propMatch;
    fields.push({
      name,
      type: type.trim(),
      required: !optional,
      default: '',
      description: pendingDoc
    });
    pendingDoc = '';
  }
  return fields;
};

const parsePropsInterface = (content) => {
  const ifaceMatch = content.match(/export interface (\w+Props)(?:\s+extends\s+[^{]+)?\s*\{([\s\S]*?)\n\}/);
  if (!ifaceMatch) return null;

  const componentName = ifaceMatch[1].replace(/Props$/, '');
  const props = parseInterfaceFields(ifaceMatch[2]);
  return { componentName, props };
};

/** 解析文件内除 *Props 外的导出 interface，供自定义类型说明使用 */
const parseExportedInterfaces = (content) => {
  const interfaces = {};
  const re = /export interface (\w+)(?:\s+extends\s+[^{]+)?\s*\{([\s\S]*?)\n\}/g;
  let m;
  while ((m = re.exec(content))) {
    const name = m[1];
    if (name.endsWith('Props')) continue;
    interfaces[name] = parseInterfaceFields(m[2]);
  }
  return interfaces;
};

/** 收集 Props 类型字符串里引用到的自定义 interface */
const collectRelatedTypes = (props, allInterfaces) => {
  const related = [];
  for (const [typeName, fields] of Object.entries(allInterfaces)) {
    if (!fields.length) continue;
    const used = props.some((prop) => new RegExp(`\\b${typeName}\\b`).test(prop.type));
    if (used) related.push({ name: typeName, fields });
  }
  return related.sort((a, b) => a.name.localeCompare(b.name));
};

const applyDefaults = (props, destructureBody) => {
  for (const prop of props) {
    const m = destructureBody.match(new RegExp(`\\b${prop.name}\\s*=\\s*([^,}\\n]+)`));
    if (m) prop.default = m[1].trim();
  }
};

const applyDefaultsFromIndex = (props, componentName, indexContent) => {
  const destructureMatch =
    indexContent.match(new RegExp(`const ${componentName}[\\s\\S]*?=\\s*\\(\\{([\\s\\S]*?)\\}\\s*[,)]`)) ||
    indexContent.match(new RegExp(`const \\{([\\s\\S]*?)\\}\\s*=\\s*props`));
  if (destructureMatch?.[1]) applyDefaults(props, destructureMatch[1]);
};

const applyAliases = (props, ...contents) => {
  const aliases = Object.assign({}, ...contents.map(parseTypeAliases));
  for (const prop of props) {
    if (aliases[prop.type]) prop.type = aliases[prop.type];
  }
};

/** 解析组件目录：优先 index.tsx 的 interface，否则读 types.ts */
const extractComponentProps = (dirPath) => {
  const indexPath = path.join(dirPath, 'index.tsx');
  if (!fs.existsSync(indexPath)) return null;

  const indexContent = fs.readFileSync(indexPath, 'utf8');
  let parsed = parsePropsInterface(indexContent);
  let typesContent = '';

  if (!parsed) {
    const typesPath = path.join(dirPath, 'types.ts');
    if (!fs.existsSync(typesPath)) return null;
    typesContent = fs.readFileSync(typesPath, 'utf8');
    parsed = parsePropsInterface(typesContent);
    if (!parsed) return null;
  }

  const { componentName, props } = parsed;
  if (!props.length) return null;

  applyDefaultsFromIndex(props, componentName, indexContent);
  if (!typesContent) {
    const typesPath = path.join(dirPath, 'types.ts');
    if (fs.existsSync(typesPath)) typesContent = fs.readFileSync(typesPath, 'utf8');
  }
  applyAliases(props, indexContent, typesContent);

  const allInterfaces = {
    ...parseExportedInterfaces(indexContent),
    ...parseExportedInterfaces(typesContent)
  };
  const relatedTypes = collectRelatedTypes(props, allInterfaces);

  return { componentName, props, relatedTypes };
};

const dirs = fs
  .readdirSync(componentsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== '_shared');

const result = {};
const relatedResult = {};

for (const dir of dirs) {
  const extracted = extractComponentProps(path.join(componentsDir, dir.name));
  if (!extracted) continue;
  result[extracted.componentName] = extracted.props;
  if (extracted.relatedTypes.length) {
    relatedResult[extracted.componentName] = extracted.relatedTypes;
  }
}

if (result.WaveButton) {
  result.WaveButton.push({
    name: '…原生 button 属性',
    type: 'ButtonHTMLAttributes',
    required: false,
    default: '',
    description: '继承 onClick、disabled、type、aria-* 等（children 由 text 代替）'
  });
}

const header = `// 此文件由 scripts/extract-component-props.mjs 自动生成，请勿手动编辑
// 运行 pnpm extract-props 更新

export interface ComponentPropDoc {
  name: string;
  type: string;
  required: boolean;
  default: string;
  description: string;
}

export interface ComponentTypeDoc {
  name: string;
  fields: ComponentPropDoc[];
}

export type ComponentPropsMap = Record<string, ComponentPropDoc[]>;
export type ComponentTypesMap = Record<string, ComponentTypeDoc[]>;

export const componentProps: ComponentPropsMap = `;

const footer = `;

export const componentRelatedTypes: ComponentTypesMap = ${JSON.stringify(relatedResult, null, 2)};
`;

fs.writeFileSync(outFile, `${header}${JSON.stringify(result, null, 2)}${footer}\n`);
execFileSync('npx', ['--yes', 'prettier', '--write', outFile], { cwd: root, stdio: 'ignore' });
console.log(
  `Wrote ${Object.keys(result).length} components (${Object.keys(relatedResult).length} with related types) to ${path.relative(root, outFile)}`
);
