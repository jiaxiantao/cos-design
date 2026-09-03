<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import {
  createLiquidProgress,
  type LiquidProgressController,
  type LiquidProgressOptions,
} from '../core';
import '../style/index.css';

const props = defineProps<LiquidProgressOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: LiquidProgressController | null = null;

const toOptions = (): LiquidProgressOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createLiquidProgress(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-liquidProgress-host" />
</template>
