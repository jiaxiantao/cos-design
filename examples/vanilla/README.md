# cos-design · Vanilla example

Web Components markup + Core API for imperative celebrations.

## 3-step fork

```bash
# from monorepo root (workspace packages)
pnpm install
cd examples/vanilla
pnpm dev
```

Open http://localhost:5175 → hero → **#campaign**.

### Primary flow

`<cos-weather-background>` + `<cos-neon-text>` → `<cos-flip-card>` → `<cos-nine-grid>` → `createConfetti(...).burst()`

### More patterns

`<cos-scratch-card>` → `createFireworks(...).launch()`

## Notes

| Topic    | Rule                                                         |
| -------- | ------------------------------------------------------------ |
| Elements | `import '@cos-design/<pkg>/element'` then use `<cos-*>` tags |
| Core     | `import { createX } from '@cos-design/<pkg>/core'`           |
| Events   | Elements emit `reveal` / `draw-end` CustomEvents             |

## Related

- Migration: [docs/migration-v4.md](../../docs/migration-v4.md)
- Vue example: [examples/vue-app](../vue-app)
- Next.js example: [examples/next-app](../next-app)
- Playground: https://jiaxiantao.github.io/cos-design/
