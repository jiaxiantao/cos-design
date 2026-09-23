<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createCursorTrail, type CursorTrailController, type CursorTrailOptions } from '../core';
import '../style/index.css';

const props = defineProps<CursorTrailOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: CursorTrailController | null = null;

const toOptions = (): CursorTrailOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createCursorTrail(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-cursorTrail-host" />
</template>
