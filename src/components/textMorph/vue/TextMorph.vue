<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createTextMorph, type TextMorphController, type TextMorphOptions } from '../core';
import '../style/index.css';

const props = defineProps<TextMorphOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: TextMorphController | null = null;

const toOptions = (): TextMorphOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createTextMorph(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-textMorph-host" />
</template>
