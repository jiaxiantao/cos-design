# Campaign interaction patterns — cos-design

Conventions for lottery / check-in flows so pages stay reliable under double-taps, retries, and background tabs.

## Busy / anti double-draw

| Component     | Busy signal                                             | Rule                                              |
| ------------- | ------------------------------------------------------- | ------------------------------------------------- |
| `Turntable`   | `disabled` + `aria-busy` while spinning; `spinningText` | Ignore extra `spin()` until finished              |
| `SlotMachine` | same                                                    | Ignore extra `spin()` until finished              |
| `NineGrid`    | same (`spinningText`)                                   | Ignore extra `draw()` until finished              |
| `FlipCard`    | stops accepting clicks after reveal (unless `reset()`)  | One reveal per cycle                              |
| `ScratchCard` | cover already cleared                                   | Use `reset()` only for a deliberate second chance |

Do **not** fire a second server lottery request while the local animation is busy. Fetch `targetIndex` / `targetResults` **before** calling `spin()` / `draw()`, or pass them as props and let the first user gesture start the animation once.

## Retry after a finished draw

```tsx
turntableRef.current?.reset(); // clears result copy; safe only when not spinning
nineGridRef.current?.reset(); // clears highlight / winner
flipCardRef.current?.reset(); // returns to front face
```

Gate retries in your product logic (remaining draws, login, etc.) — components only prevent overlapping animations.

## Server draw

```tsx
const res = await fetch('/api/draw?cells=9');
const { targetIndex } = await res.json();
// Option A: prop
<NineGrid targetIndex={targetIndex} />;
// Option B: imperative after fetch
nineGridRef.current?.draw(targetIndex);
```

On fetch failure, either keep the button disabled with an error status, or fall back to a local random draw and log it — never leave the UI in a half-busy state.

## Visibility pause + reduced motion

Canvas loops that use `@cos-design/shared` `bindVisibilityPause` stop `requestAnimationFrame` when the tab is hidden. CSS backgrounds such as `Aurora` pause `animation-play-state` the same way.

When `prefers-reduced-motion: reduce`, key backgrounds freeze to a static frame instead of looping.

## Density

One strong `fill` background + one interaction focal (draw / scratch / flip). Stacking multiple full-screen canvases drains battery and fights for attention.

## Related

- 10-minute English guide: [campaign-10-minutes.md](./campaign-10-minutes.md)
- Runnable Next app: [examples/next-app](../examples/next-app)
- Playground recipes (copyable snippets): https://jiaxiantao.github.io/cos-design/#/recipes
