# Vanilla / Web Components — cos-design

Use `/element` for Custom Elements and `/core` for imperative factories.

## Install

```bash
pnpm add @cos-design/fireworks @cos-design/scratch-card
```

## Web Components

```html
<script type="module">
  import '@cos-design/fireworks/element';
</script>
<cos-fireworks auto fill></cos-fireworks>
```

Umbrella: `import 'cos-design/elements'`.

## Core API

```ts
import { createFireworks } from '@cos-design/fireworks/core';

const ctrl = createFireworks(document.getElementById('host')!, {
  auto: false,
  fill: true,
});
ctrl.launch(120);
```

## Runnable example

See [examples/vanilla](../../examples/vanilla) — Elements for lottery UI + Core for Confetti / Fireworks.

## Related

- [migration-v4.md](../migration-v4.md)
- [Vue 3](./vue-app.md)
- [Next.js App Router](./next-app-router.md)
