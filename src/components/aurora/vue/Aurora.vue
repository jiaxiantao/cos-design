<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createAurora, type AuroraController, type AuroraOptions } from '../core';
import '../style/index.css';

const props = defineProps<AuroraOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: AuroraController | null = null;

const toOptions = (): AuroraOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createAurora(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-aurora-host" />
</template>
