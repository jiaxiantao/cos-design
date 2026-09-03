<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createReturnCity, type ReturnCityController, type ReturnCityOptions } from '../core';
import '../style/index.css';

const props = defineProps<ReturnCityOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: ReturnCityController | null = null;

const toOptions = (): ReturnCityOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createReturnCity(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-returnCity-host" />
</template>
