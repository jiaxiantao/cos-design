<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch, withDefaults } from 'vue';
import { createCurvedLoop, type CurvedLoopController, type CurvedLoopOptions } from '../core';
import '../style/index.css';

const props = withDefaults(defineProps<CurvedLoopOptions>(), {
  interactive: true,
});
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: CurvedLoopController | null = null;

const toOptions = (): CurvedLoopOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createCurvedLoop(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-curvedLoop-host" />
</template>
