# cos-design · Next.js App Router example

Campaign starter for **cos-design 4.0** (React default entry). Inside this monorepo it uses `workspace:*` packages; after the 4.0.0 publish you can also fork with `pnpm add @cos-design/...@^4.0.0`.

## 3-step fork

```bash
# From repo root (recommended in monorepo):
pnpm install
cd examples/next-app
pnpm dev

# Or after 4.0 is on npm, in a standalone copy of this folder:
# pnpm add @cos-design/weather-background@^4.0.0 @cos-design/neon-text@^4.0.0 ...
```

Open http://localhost:3000 → hero → **#campaign** (FlipCard → NineGrid).  
Replace `/api/draw` with your lottery service when you ship.

### Primary flow

`WeatherBackground` `fill` + `NeonText` → `FlipCard` check-in → `NineGrid` (`/api/draw?cells=9`) → `Confetti`

### More patterns (below the fold)

Scratch → Fireworks · Turntable server `spin(targetIndex)`

## Why this shape

| Topic   | Rule                                                            |
| ------- | --------------------------------------------------------------- |
| SSR     | Canvas components load with `next/dynamic(..., { ssr: false })` |
| Size    | `fill` needs a parent with explicit height (`100vh` / fixed px) |
| Density | One hero background + one interaction focal                     |
| Busy    | NineGrid / Turntable expose `aria-busy` while animating         |
| Pointer | Celebration canvases with `auto={false}` do not steal clicks    |

## Related

- 10-minute guide: [docs/campaign-10-minutes.md](../../docs/campaign-10-minutes.md)
- Busy / retry patterns: [docs/campaign-patterns.md](../../docs/campaign-patterns.md)
- Pattern notes: [docs/examples/next-app-router.md](../../docs/examples/next-app-router.md)
- Playground: https://jiaxiantao.github.io/cos-design/
- AI index: https://jiaxiantao.github.io/cos-design/llms.txt
- Context7: `/jiaxiantao/cos-design`
