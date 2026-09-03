<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createCharge, type ChargeController, type ChargeOptions } from '../core';
import '../style/index.css';

const props = defineProps<ChargeOptions>();
const emit = defineEmits<{
  change: [...args: unknown[]];
  complete: [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: ChargeController | null = null;

const toOptions = (): ChargeOptions => ({
  ...props,
  onChange: (...args: unknown[]) => emit('change', ...args),
  onComplete: (...args: unknown[]) => emit('complete', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createCharge(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-charge-host" />
</template>
