<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createSnowfall, type SnowfallController, type SnowfallOptions } from '../core';
import '../style/index.css';

const props = defineProps<SnowfallOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: SnowfallController | null = null;

const toOptions = (): SnowfallOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createSnowfall(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-snowfall-host" />
</template>
