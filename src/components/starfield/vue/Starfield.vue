<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createStarfield, type StarfieldController, type StarfieldOptions } from '../core';
import '../style/index.css';

const props = defineProps<StarfieldOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: StarfieldController | null = null;

const toOptions = (): StarfieldOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createStarfield(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-starfield-host" />
</template>
