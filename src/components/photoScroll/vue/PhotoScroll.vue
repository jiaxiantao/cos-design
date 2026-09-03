<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createPhotoScroll, type PhotoScrollController, type PhotoScrollOptions } from '../core';
import '../style/index.css';

const props = defineProps<PhotoScrollOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: PhotoScrollController | null = null;

const toOptions = (): PhotoScrollOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createPhotoScroll(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-photoScroll-host" />
</template>
