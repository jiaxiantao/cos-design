<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import {
  createProgressChest,
  type ProgressChestController,
  type ProgressChestOptions,
} from '../core';
import '../style/index.css';

const props = defineProps<ProgressChestOptions>();
const emit = defineEmits<{
  open: [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: ProgressChestController | null = null;

const toOptions = (): ProgressChestOptions => ({
  ...props,
  onOpen: (...args: unknown[]) => emit('open', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createProgressChest(hostRef.value, toOptions());
});

watch(
  () => ({ ...props }),
  () => ctrl?.update(toOptions()),
  { deep: true },
);

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({});
</script>

<template>
  <div ref="hostRef" class="cos-progressChest-host" />
</template>
