<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createSlotMachine, type SlotMachineController, type SlotMachineOptions } from '../core';
import '../style/index.css';

const props = defineProps<SlotMachineOptions>();
const emit = defineEmits<{
  'spin-end': [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: SlotMachineController | null = null;

const toOptions = (): SlotMachineOptions => ({
  ...props,
  onSpinEnd: (...args: unknown[]) => emit('spin-end', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createSlotMachine(hostRef.value, toOptions());
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
  spin: (results?: string[]) => ctrl?.spin(results),
  reset: () => ctrl?.reset(),
});
</script>

<template>
  <div ref="hostRef" class="cos-slotMachine-host" />
</template>
