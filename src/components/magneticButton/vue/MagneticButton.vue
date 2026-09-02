<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createMagneticButton, type MagneticButtonController, type MagneticButtonOptions } from '../core';
import '../style/index.css';

const props = defineProps<MagneticButtonOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: MagneticButtonController | null = null;

const toOptions = (): MagneticButtonOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createMagneticButton(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-magneticButton-host" />
</template>
