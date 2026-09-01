#!/usr/bin/env node
/**
 * Trigger Context7 refresh for /jiaxiantao/cos-design.
 *
 * Requires CONTEXT7_API_KEY (ctx7sk…) in the environment.
 * After refresh settles (~1–5 min), run: pnpm verify:context7
 */
const LIBRARY_ID = '/jiaxiantao/cos-design';

async function main() {
  const key = process.env.CONTEXT7_API_KEY;
  if (!key) {
    console.error(`CONTEXT7_API_KEY is not set.

1. Create a key at https://context7.com/dashboard
2. Export it locally:
     export CONTEXT7_API_KEY=ctx7sk-...
3. Add GitHub secret CONTEXT7_API_KEY so CI refresh-context7 job can refresh on push.
4. Re-run: pnpm context7:refresh && pnpm verify:context7
`);
    process.exit(1);
  }

  const res = await fetch('https://context7.com/api/v1/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify({ libraryName: LIBRARY_ID })
  });
  const text = await res.text();
  console.log(`HTTP ${res.status}`);
  console.log(text || '(empty body)');
  if (!res.ok) process.exit(1);
  console.log(`\nRefresh requested. Wait a minute, then: pnpm verify:context7`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
