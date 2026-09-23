<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createTurntable, type TurntableController, type TurntableOptions } from '../core';
import '../style/index.css';

const props = defineProps<TurntableOptions>();
const emit = defineEmits<{
  'spin-end': [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: TurntableController | null = null;

const toOptions = (): TurntableOptions => ({
  ...props,
  onSpinEnd: (...args: unknown[]) => emit('spin-end', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createTurntable(hostRef.value, toOptions());
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
  spin: (targetIndex?: number) => ctrl?.spin(targetIndex),
  reset: () => ctrl?.reset(),
});
</script>

<template>
  <div ref="hostRef" class="cos-turntable-host" />
</template>
