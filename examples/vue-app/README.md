# cos-design · Vue 3 example

Forkable campaign starter using `@cos-design/*/vue` subpaths.

## 3-step fork

```bash
# from monorepo root (workspace packages)
pnpm install
cd examples/vue-app
pnpm dev
```

Open http://localhost:5174 → hero → **#campaign** (FlipCard → NineGrid → Confetti).

### Primary flow

`WeatherBackground` `fill` + `NeonText` → `FlipCard` check-in → `NineGrid` → `Confetti`

### More patterns

Scratch → Fireworks

## Notes

| Topic     | Rule                                                                 |
| --------- | -------------------------------------------------------------------- |
| Import    | `from '@cos-design/<pkg>/vue'`                                       |
| Size      | `fill` needs parent with explicit height                             |
| Callbacks | Prefer Vue events (`@reveal`, `@draw-end`, `@spin-end`, `@complete`) |

## Related

- Migration: [docs/migration-v4.md](../../docs/migration-v4.md)
- Next.js example: [examples/next-app](../next-app)
- Vanilla example: [examples/vanilla](../vanilla)
- Playground: https://jiaxiantao.github.io/cos-design/
