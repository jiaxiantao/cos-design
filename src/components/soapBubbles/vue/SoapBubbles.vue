<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createSoapBubbles, type SoapBubblesController, type SoapBubblesOptions } from '../core';
import '../style/index.css';

const props = defineProps<SoapBubblesOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: SoapBubblesController | null = null;

const toOptions = (): SoapBubblesOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createSoapBubbles(hostRef.value, toOptions());
});

watch(() => ({ ...props }), () => ctrl?.update(toOptions()), { deep: true });

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({

});
</script>

<template>
  <div ref="hostRef" class="cos-soapBubbles-host" />
</template>
