<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createBurnAway, type BurnAwayController, type BurnAwayOptions } from '../core';
import '../style/index.css';

const props = defineProps<BurnAwayOptions>();
const emit = defineEmits<{
  complete: [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: BurnAwayController | null = null;

const toOptions = (): BurnAwayOptions => ({
  ...props,
  onComplete: (...args: unknown[]) => emit('complete', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createBurnAway(hostRef.value, toOptions());
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
  ignite: () => ctrl?.ignite(),
});
</script>

<template>
  <div ref="hostRef" class="cos-burnAway-host" />
</template>
