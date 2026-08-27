# cos-design · Next.js App Router example

Forkable campaign starter using published npm packages:

1. **Primary flow**: full-viewport `WeatherBackground` `fill` + `NeonText` → `FlipCard` check-in → `NineGrid` draw (`/api/draw?cells=9`) → `Confetti`
2. **More patterns**: Scratch → Fireworks; Turntable server `spin(targetIndex)`

## Run

```bash
cd examples/next-app
pnpm install
pnpm dev
```

Open http://localhost:3000 — start at the hero, jump to **#campaign** for the check-in chain.

## Why this shape

| Topic   | Rule                                                            |
| ------- | --------------------------------------------------------------- |
| SSR     | Canvas components load with `next/dynamic(..., { ssr: false })` |
| Size    | `fill` needs a parent with explicit height (`100vh` / fixed px) |
| Density | One hero background + one interaction focal                     |
| Busy    | NineGrid / Turntable expose `aria-busy` while animating         |

## Related

- 10-minute guide: [docs/campaign-10-minutes.md](../../docs/campaign-10-minutes.md)
- Busy / retry patterns: [docs/campaign-patterns.md](../../docs/campaign-patterns.md)
- Pattern notes: [docs/examples/next-app-router.md](../../docs/examples/next-app-router.md)
- Playground recipes: https://jiaxiantao.github.io/cos-design/#/recipes
- AI index: https://jiaxiantao.github.io/cos-design/llms.txt
- Context7: `/jiaxiantao/cos-design`
