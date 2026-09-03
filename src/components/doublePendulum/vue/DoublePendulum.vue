<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import {
  createDoublePendulum,
  type DoublePendulumController,
  type DoublePendulumOptions,
} from '../core';
import '../style/index.css';

const props = defineProps<DoublePendulumOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: DoublePendulumController | null = null;

const toOptions = (): DoublePendulumOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createDoublePendulum(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-doublePendulum-host" />
</template>
