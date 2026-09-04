<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch, withDefaults } from 'vue';
import { createSoapBubbles, type SoapBubblesController, type SoapBubblesOptions } from '../core';
import '../style/index.css';

const props = withDefaults(defineProps<SoapBubblesOptions>(), {
  interactive: true,
});
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: SoapBubblesController | null = null;

const toOptions = (): SoapBubblesOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createSoapBubbles(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-soapBubbles-host" />
</template>
