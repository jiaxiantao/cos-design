<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createBubbleField, type BubbleFieldController, type BubbleFieldOptions } from '../core';
import '../style/index.css';

const props = defineProps<BubbleFieldOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: BubbleFieldController | null = null;

const toOptions = (): BubbleFieldOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createBubbleField(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-bubbleField-host" />
</template>
