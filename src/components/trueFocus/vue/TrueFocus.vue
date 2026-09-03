<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createTrueFocus, type TrueFocusController, type TrueFocusOptions } from '../core';
import '../style/index.css';

const props = defineProps<TrueFocusOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: TrueFocusController | null = null;

const toOptions = (): TrueFocusOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createTrueFocus(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-trueFocus-host" />
</template>
