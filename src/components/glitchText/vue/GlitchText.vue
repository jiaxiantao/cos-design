<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createGlitchText, type GlitchTextController, type GlitchTextOptions } from '../core';
import '../style/index.css';

const props = defineProps<GlitchTextOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: GlitchTextController | null = null;

const toOptions = (): GlitchTextOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createGlitchText(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-glitchText-host" />
</template>
