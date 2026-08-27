# cos-design · Next.js App Router example

Runnable campaign page using published npm packages:

- full-viewport `WeatherBackground` with `fill` + `NeonText`
- `ScratchCard` → `Fireworks` celebration
- **Server lottery**: `GET /api/draw` → `Turntable.spin(targetIndex)` + Confetti
- **Check-in chain**: `FlipCard` unlock → `NineGrid` draw (`/api/draw?cells=9`) + Confetti

## Run

```bash
cd examples/next-app
pnpm install
pnpm dev
```

Open http://localhost:3000

## Why this shape

| Topic   | Rule                                                            |
| ------- | --------------------------------------------------------------- |
| SSR     | Canvas components load with `next/dynamic(..., { ssr: false })` |
| Size    | `fill` needs a parent with explicit height (`100vh` / fixed px) |
| Density | One hero background + one interaction focal                     |

## Related

- Pattern notes: [docs/examples/next-app-router.md](../../docs/examples/next-app-router.md)
- Playground recipes: https://jiaxiantao.github.io/cos-design/#/recipes
- AI index: https://jiaxiantao.github.io/cos-design/llms.txt
- Context7: `/jiaxiantao/cos-design`
