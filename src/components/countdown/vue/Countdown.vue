<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createCountdown, type CountdownController, type CountdownOptions } from '../core';
import '../style/index.css';

const props = defineProps<CountdownOptions>();
const emit = defineEmits<{
  end: [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: CountdownController | null = null;

const toOptions = (): CountdownOptions => ({
  ...props,
  onEnd: (...args: unknown[]) => emit('end', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createCountdown(hostRef.value, toOptions());
});

watch(
  () => optionsFingerprint(props),
  () => ctrl?.update(toOptions()),
);

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({});
</script>

<template>
  <div ref="hostRef" class="cos-countdown-host" />
</template>
