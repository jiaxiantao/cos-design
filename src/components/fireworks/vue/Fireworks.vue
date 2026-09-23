<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch, withDefaults } from 'vue';
import { createFireworks, type FireworksController, type FireworksOptions } from '../core';
import '../style/index.css';

// interactive stays undefined when omitted so Core can use `interactive ?? auto`.
const props = withDefaults(defineProps<FireworksOptions>(), {
  auto: true,
  interactive: undefined,
});
const emit = defineEmits<{
  complete: [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: FireworksController | null = null;

const toOptions = (): FireworksOptions => ({
  ...props,
  onComplete: (...args: unknown[]) => emit('complete', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createFireworks(hostRef.value, toOptions());
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
  launch: (x?: number) => ctrl?.launch(x),
});
</script>

<template>
  <div ref="hostRef" class="cos-fireworks-host" />
</template>
