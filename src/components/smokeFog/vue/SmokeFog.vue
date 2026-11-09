<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, withDefaults } from 'vue';
import { createSmokeFog, type SmokeFogController, type SmokeFogOptions } from '../core';
import '../style/index.css';

const props = withDefaults(defineProps<SmokeFogOptions>(), {
  interactive: true,
});
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: SmokeFogController | null = null;

const toOptions = (): SmokeFogOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createSmokeFog(hostRef.value, toOptions());
});

watch(() => ({ ...props }), () => ctrl?.update(toOptions()), { deep: true });

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({});
</script>

<template>
  <div ref="hostRef" class="cos-smokeFog-host" />
</template>
