<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch, withDefaults } from 'vue';
import { createInkBloom, type InkBloomController, type InkBloomOptions } from '../core';
import '../style/index.css';

const props = withDefaults(defineProps<InkBloomOptions>(), {
  interactive: true,
});
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: InkBloomController | null = null;

const toOptions = (): InkBloomOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createInkBloom(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-inkBloom-host" />
</template>
