# Migrating to cos-design 4.0

cos-design **4.0** keeps the same npm package names and React default import paths, while adding **Vue 3**, **framework-agnostic Core APIs**, and **Web Components** via subpath exports.

## Who needs to change code?

| Consumer                                                         | Action                                               |
| ---------------------------------------------------------------- | ---------------------------------------------------- |
| React apps using `cos-design` or `@cos-design/*` default imports | **Usually none** — props / refs stay the same        |
| Apps importing React hooks from `@cos-design/shared`             | Import from `@cos-design/shared/react`               |
| CSS overrides targeting hashed LESS module classes               | Switch to public `cos-*` class names / CSS variables |
| Vue / vanilla / Web Component users                              | Use new subpaths (below)                             |

## Install

```bash
pnpm add cos-design
# or per component
pnpm add @cos-design/fireworks
```

Peers (all optional except the framework you use):

- React >= 18
- Vue >= 3.4
- `three` only when using Three.js components (e.g. PhotoLantern)

## Import paths (package names unchanged)

### React (default — same as v3)

```tsx
import { Fireworks, ScratchCard } from 'cos-design';
import { Fireworks } from '@cos-design/fireworks';
```

### Vue 3

```vue
<script setup lang="ts">
import { Fireworks } from 'cos-design/vue';
// or
import { Fireworks } from '@cos-design/fireworks/vue';
</script>

<template>
  <Fireworks :width="800" :height="500" />
</template>
```

### Core (vanilla / any framework)

```ts
import { createFireworks } from 'cos-design/core';
// or
import { createFireworks } from '@cos-design/fireworks/core';

const fw = createFireworks(document.getElementById('app')!, { auto: true });
fw.launch();
fw.destroy();
```

### Web Components

```html
<script type="module">
  import 'cos-design/elements';
  // or per component:
  import '@cos-design/fireworks/element';
</script>

<cos-fireworks auto interactive fill></cos-fireworks>
```

Tag names: `cos-{kebab-case}` (e.g. `weatherBackground` → `<cos-weather-background>`).

## Breaking changes

### 1. `@cos-design/shared` default entry is framework-free

React hooks moved to a subpath:

```ts
// v3
import { useElementSize, useCanvasBox } from '@cos-design/shared';

// v4
import { useElementSize, useCanvasBox } from '@cos-design/shared/react';
// pure helpers still from default:
import { clamp, bindVisibilityPause } from '@cos-design/shared';
```

Library consumers who never imported shared hooks are unaffected.

### 2. CSS class names are stable prefixes

v3 used CSS Modules hashes (`cos-[local]-[hash]`).  
v4 ships shared `style/index.css` with stable classes such as `.cos-fireworks`, `.cos-fireworks__canvas`.

If you overrode hashed class names, update selectors to the public `cos-*` classes or CSS variables documented per component.

### 3. Major version bump

All packages publish as **4.0.0** (aligned). Semver major — upgrade when ready.

## Unchanged for React users

- Default import paths (`cos-design`, `@cos-design/fireworks`, …)
- Component prop names and imperative handles (`ref.spin()`, `ref.launch()`, …)
- Auto-injected styles (no manual CSS import required)
- Next.js canvas rule: `dynamic(..., { ssr: false })`

## Architecture (brief)

Each component has:

```
core/     → createX(container, options)  (framework-agnostic)
react/    → thin React adapter
vue/      → thin Vue SFC adapter
element/  → Custom Element (<cos-*>)
style/    → shared CSS
```

See [docs/rfc-v4-multi-framework.md](./rfc-v4-multi-framework.md) for the full design.

## Verification

```bash
pnpm verify:v4-matrix   # 91 components × 4 entries
pnpm build
pnpm test:smoke
```
