/**
 * 从组件源码 *Props 接口与 JSDoc 提取配置参数文档。
 * 运行: pnpm extract-props
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

const parsePropsFromFile = (content, componentName) => {
  const ifaceMatch = content.match(/export interface (\w+Props)(?:\s+extends\s+[^{]+)?\s*\{([\s\S]*?)\n\}/);
  if (!ifaceMatch) return [];

  const body = ifaceMatch[2];
  const props = [];
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
    props.push({
      name,
      type: type.trim(),
      required: !optional,
      default: '',
      description: pendingDoc
    });
    pendingDoc = '';
  }

  const destructureMatch =
    content.match(new RegExp(`const ${componentName}[\\s\\S]*?=\\s*\\(\\{([\\s\\S]*?)\\}\\s*[,)]`)) ||
    content.match(new RegExp(`const \\{([\\s\\S]*?)\\}\\s*=\\s*props`));

  if (destructureMatch?.[1]) {
    applyDefaults(props, destructureMatch[1]);
  }

  const aliases = parseTypeAliases(content);
  for (const prop of props) {
    if (aliases[prop.type]) prop.type = aliases[prop.type];
  }

  return props;
};

const applyDefaults = (props, destructureBody) => {
  for (const prop of props) {
    const m = destructureBody.match(new RegExp(`\\b${prop.name}\\s*=\\s*([^,}\\n]+)`));
    if (m) prop.default = m[1].trim();
  }
};

const dirs = fs
  .readdirSync(componentsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== '_shared');

const result = {};

for (const dir of dirs) {
  const indexPath = path.join(componentsDir, dir.name, 'index.tsx');
  if (!fs.existsSync(indexPath)) continue;

  const content = fs.readFileSync(indexPath, 'utf8');
  const exportMatch = content.match(/export interface (\w+Props)/);
  if (!exportMatch) continue;

  const componentName = exportMatch[1].replace(/Props$/, '');
  const props = parsePropsFromFile(content, componentName);
  if (props.length) result[componentName] = props;
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

export type ComponentPropsMap = Record<string, ComponentPropDoc[]>;

export const componentProps: ComponentPropsMap = `;

fs.writeFileSync(outFile, `${header}${JSON.stringify(result, null, 2)};\n`);
execFileSync('npx', ['--yes', 'prettier', '--write', outFile], { cwd: root, stdio: 'ignore' });
console.log(`Wrote ${Object.keys(result).length} components to ${path.relative(root, outFile)}`);
