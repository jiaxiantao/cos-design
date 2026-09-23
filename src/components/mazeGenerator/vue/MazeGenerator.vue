<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import {
  createMazeGenerator,
  type MazeGeneratorController,
  type MazeGeneratorOptions,
} from '../core';
import '../style/index.css';

const props = defineProps<MazeGeneratorOptions>();
const emit = defineEmits<{
  generated: [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: MazeGeneratorController | null = null;

const toOptions = (): MazeGeneratorOptions => ({
  ...props,
  onGenerated: (...args: unknown[]) => emit('generated', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createMazeGenerator(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-mazeGenerator-host" />
</template>
