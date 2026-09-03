<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import {
  createHolographicCard,
  type HolographicCardController,
  type HolographicCardOptions,
} from '../core';
import '../style/index.css';

const props = defineProps<HolographicCardOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: HolographicCardController | null = null;

const toOptions = (): HolographicCardOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createHolographicCard(hostRef.value, toOptions());
});

watch(
  () => ({ ...props }),
  () => ctrl?.update(toOptions()),
  { deep: true },
);

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({});
</script>

<template>
  <div ref="hostRef" class="cos-holographicCard-host" />
</template>
