<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createGameOfLife, type GameOfLifeController, type GameOfLifeOptions } from '../core';
import '../style/index.css';

const props = defineProps<GameOfLifeOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: GameOfLifeController | null = null;

const toOptions = (): GameOfLifeOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createGameOfLife(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-gameOfLife-host" />
</template>
