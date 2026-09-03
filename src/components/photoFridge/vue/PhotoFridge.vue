<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createPhotoFridge, type PhotoFridgeController, type PhotoFridgeOptions } from '../core';
import '../style/index.css';

const props = defineProps<PhotoFridgeOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: PhotoFridgeController | null = null;

const toOptions = (): PhotoFridgeOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createPhotoFridge(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-photoFridge-host" />
</template>
