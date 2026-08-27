#!/usr/bin/env node
/**
 * 校验 Context7 是否已索引 cos-design，以及文档是否足够新。
 *
 * 用法：
 *   node scripts/verify-context7.mjs
 *   pnpm verify:context7
 *
 * Required markers（至少命中全部）才算健康；
 * Optional markers 仅作提示，不影响退出码。
 */
const LIBRARY_ID = '/jiaxiantao/cos-design';
const SEARCH_URL = `https://context7.com/api/v1/search?query=${encodeURIComponent('cos-design')}`;
const CONTEXT_URL =
  `https://context7.com/api/v2/context?libraryId=${encodeURIComponent(LIBRARY_ID)}` +
  `&query=${encodeURIComponent('WeatherBackground fill Next.js App Router campaign')}`;

/** 必须出现：fill 尺寸能力 + Next 示例路径之一 */
const REQUIRED_MARKERS = ['fill', 'next-app'];
/** 加分项（索引未必抽到） */
const OPTIONAL_MARKERS = ['useCanvasBox', 'next-app-router', 'NineGrid', 'FlipCard'];

async function fetchJson(url) {
  const res = await fetch(url);
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { ok: res.ok, status: res.status, body };
}

function findLibrary(results) {
  if (!Array.isArray(results)) return null;
  return results.find((item) => item?.id === LIBRARY_ID) ?? null;
}

function markersIn(text, markers) {
  const lower = String(text).toLowerCase();
  return markers.filter((m) => lower.includes(m.toLowerCase()));
}

async function main() {
  console.log(`Library ID: ${LIBRARY_ID}\n`);

  const search = await fetchJson(SEARCH_URL);
  if (!search.ok) {
    console.error(`Search failed: HTTP ${search.status}`);
    process.exit(1);
  }

  const lib = findLibrary(search.body?.results ?? search.body);
  if (!lib) {
    console.error(`Not found in Context7 search. Submit at https://context7.com/add-library`);
    process.exit(1);
  }

  console.log('Indexed: yes');
  console.log(`  title: ${lib.title}`);
  console.log(`  state: ${lib.state}`);
  console.log(`  snippets: ${lib.totalSnippets}`);
  console.log(`  lastUpdateDate: ${lib.lastUpdateDate ?? '(unknown)'}`);
  console.log(`  page: https://context7.com${LIBRARY_ID}`);

  const ctx = await fetchJson(CONTEXT_URL);
  if (!ctx.ok) {
    console.error(`\nContext query failed: HTTP ${ctx.status}`);
    console.error(typeof ctx.body === 'string' ? ctx.body : JSON.stringify(ctx.body));
    process.exit(1);
  }

  const blob = typeof ctx.body === 'string' ? ctx.body : JSON.stringify(ctx.body);
  const requiredHit = markersIn(blob, REQUIRED_MARKERS);
  const optionalHit = markersIn(blob, OPTIONAL_MARKERS);

  console.log(`\nRequired markers (${requiredHit.length}/${REQUIRED_MARKERS.length}):`);
  for (const m of REQUIRED_MARKERS) {
    console.log(`  ${requiredHit.includes(m) ? '✓' : '✗'} ${m}`);
  }
  console.log(`Optional markers (${optionalHit.length}/${OPTIONAL_MARKERS.length}):`);
  for (const m of OPTIONAL_MARKERS) {
    console.log(`  ${optionalHit.includes(m) ? '✓' : '·'} ${m}`);
  }

  const missingRequired = REQUIRED_MARKERS.filter((m) => !requiredHit.includes(m));
  if (missingRequired.length) {
    console.log(`
Index looks stale (missing: ${missingRequired.join(', ')}).

Fix:
  1. Add GitHub secret CONTEXT7_API_KEY (from https://context7.com/dashboard)
  2. Wait out Context7 refresh cooldown if you see too-early / user-has-active-task
  3. pnpm context7:refresh && pnpm verify:context7
`);
    process.exit(2);
  }

  console.log('\nContext7 looks healthy for agent discovery.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
