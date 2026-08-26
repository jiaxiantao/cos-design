#!/usr/bin/env node
/**
 * 校验 Context7 是否已索引 cos-design，以及文档是否足够新（含 fill / Next 示例）。
 *
 * 用法：
 *   node scripts/verify-context7.mjs
 *   pnpm verify:context7
 */
const LIBRARY_ID = '/jiaxiantao/cos-design';
const SEARCH_URL = `https://context7.com/api/v1/search?query=${encodeURIComponent('cos-design')}`;
const CONTEXT_URL =
  `https://context7.com/api/v2/context?libraryId=${encodeURIComponent(LIBRARY_ID)}` +
  `&query=${encodeURIComponent('WeatherBackground fill Next.js App Router')}`;

const FRESH_MARKERS = ['fill', 'useCanvasBox', 'next-app-router', 'next-app'];

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

function markersIn(text) {
  const lower = String(text).toLowerCase();
  return FRESH_MARKERS.filter((m) => lower.includes(m.toLowerCase()));
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
  const hit = markersIn(blob);
  console.log(`\nFreshness markers in context (${hit.length}/${FRESH_MARKERS.length}):`);
  for (const m of FRESH_MARKERS) {
    console.log(`  ${hit.includes(m) ? '✓' : '✗'} ${m}`);
  }

  if (hit.length === 0) {
    console.log(`
Index looks stale (no fill / Next example snippets).

Fix:
  1. Add GitHub secret CONTEXT7_API_KEY (from https://context7.com/dashboard)
  2. Push a docs change, or manually:
       curl -X POST https://context7.com/api/v1/refresh \\
         -H "Authorization: Bearer $CONTEXT7_API_KEY" \\
         -H "Content-Type: application/json" \\
         -d '{"libraryName":"${LIBRARY_ID}"}'
  3. Re-run: pnpm verify:context7
`);
    process.exit(2);
  }

  console.log('\nContext7 looks healthy for agent discovery.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
