<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createNeonText, type NeonTextController, type NeonTextOptions } from '../core';
import '../style/index.css';

const props = defineProps<NeonTextOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: NeonTextController | null = null;

const toOptions = (): NeonTextOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createNeonText(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-neonText-host" />
</template>
