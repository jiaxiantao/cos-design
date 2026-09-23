<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch, withDefaults } from 'vue';
import { createFlipCard, type FlipCardController, type FlipCardOptions } from '../core';
import '../style/index.css';

// Keep controlled booleans undefined when omitted — Vue Boolean props otherwise
// become `false`, which locks FlipCard in controlled mode (clicks do nothing).
const props = withDefaults(defineProps<FlipCardOptions>(), {
  flipped: undefined,
  defaultFlipped: undefined,
  disabled: undefined,
});
const emit = defineEmits<{
  reveal: [...args: unknown[]];
  'flip-change': [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: FlipCardController | null = null;

const toOptions = (): FlipCardOptions => {
  const opts: FlipCardOptions = {
    frontTitle: props.frontTitle,
    frontSubtitle: props.frontSubtitle,
    backTitle: props.backTitle,
    backSubtitle: props.backSubtitle,
    onReveal: (...args: unknown[]) => emit('reveal', ...args),
    onFlipChange: (...args: unknown[]) => emit('flip-change', ...args),
  };
  if (props.flipped !== undefined) opts.flipped = props.flipped;
  else opts.flipped = undefined;
  if (props.defaultFlipped !== undefined) opts.defaultFlipped = props.defaultFlipped;
  if (props.disabled !== undefined) opts.disabled = props.disabled;
  return opts;
};

onMounted(() => {
  if (hostRef.value) ctrl = createFlipCard(hostRef.value, toOptions());
});

watch(
  () => optionsFingerprint(props),
  () => ctrl?.update(toOptions()),
);

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({
  flip: () => ctrl?.flip(),
  reset: () => ctrl?.reset(),
});
</script>

<template>
  <div ref="hostRef" class="cos-flipCard-host" />
</template>
