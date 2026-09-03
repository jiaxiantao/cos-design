<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createInkBloom, type InkBloomController, type InkBloomOptions } from '../core';
import '../style/index.css';

const props = defineProps<InkBloomOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: InkBloomController | null = null;

const toOptions = (): InkBloomOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createInkBloom(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-inkBloom-host" />
</template>
