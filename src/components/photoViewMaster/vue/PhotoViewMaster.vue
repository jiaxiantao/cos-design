<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createPhotoViewMaster, type PhotoViewMasterController, type PhotoViewMasterOptions } from '../core';
import '../style/index.css';

const props = defineProps<PhotoViewMasterOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: PhotoViewMasterController | null = null;

const toOptions = (): PhotoViewMasterOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createPhotoViewMaster(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-photoViewMaster-host" />
</template>
