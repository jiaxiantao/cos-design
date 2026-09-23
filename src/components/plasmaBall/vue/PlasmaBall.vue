<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createPlasmaBall, type PlasmaBallController, type PlasmaBallOptions } from '../core';
import '../style/index.css';

const props = defineProps<PlasmaBallOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: PlasmaBallController | null = null;

const toOptions = (): PlasmaBallOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createPlasmaBall(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-plasmaBall-host" />
</template>
