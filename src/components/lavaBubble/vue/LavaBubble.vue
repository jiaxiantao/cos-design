<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createLavaBubble, type LavaBubbleController, type LavaBubbleOptions } from '../core';
import '../style/index.css';

const props = defineProps<LavaBubbleOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: LavaBubbleController | null = null;

const toOptions = (): LavaBubbleOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createLavaBubble(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-lavaBubble-host" />
</template>
