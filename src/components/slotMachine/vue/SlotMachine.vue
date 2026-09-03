<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createSlotMachine, type SlotMachineController, type SlotMachineOptions } from '../core';
import '../style/index.css';

const props = defineProps<SlotMachineOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: SlotMachineController | null = null;

const toOptions = (): SlotMachineOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createSlotMachine(hostRef.value, toOptions());
});

watch(() => ({ ...props }), () => ctrl?.update(toOptions()), { deep: true });

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({
  spin: (results?: string[]) => ctrl?.spin(results),
  reset: () => ctrl?.reset()
});
</script>

<template>
  <div ref="hostRef" class="cos-slotMachine-host" />
</template>
