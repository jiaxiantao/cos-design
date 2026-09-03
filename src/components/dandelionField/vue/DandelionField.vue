<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import {
  createDandelionField,
  type DandelionFieldController,
  type DandelionFieldOptions,
} from '../core';
import '../style/index.css';

const props = defineProps<DandelionFieldOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: DandelionFieldController | null = null;

const toOptions = (): DandelionFieldOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createDandelionField(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-dandelionField-host" />
</template>
