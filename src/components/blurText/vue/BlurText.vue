<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createBlurText, type BlurTextController, type BlurTextOptions } from '../core';
import '../style/index.css';

const props = defineProps<BlurTextOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: BlurTextController | null = null;

const toOptions = (): BlurTextOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createBlurText(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-blurText-host" />
</template>
