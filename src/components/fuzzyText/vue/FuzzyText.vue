<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createFuzzyText, type FuzzyTextController, type FuzzyTextOptions } from '../core';
import '../style/index.css';

const props = defineProps<FuzzyTextOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: FuzzyTextController | null = null;

const toOptions = (): FuzzyTextOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createFuzzyText(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-fuzzyText-host" />
</template>
