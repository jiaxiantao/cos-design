<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createSmokeFog, type SmokeFogController, type SmokeFogOptions } from '../core';
import '../style/index.css';

const props = defineProps<SmokeFogOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: SmokeFogController | null = null;

const toOptions = (): SmokeFogOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createSmokeFog(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-smokeFog-host" />
</template>
