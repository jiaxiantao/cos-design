<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createShinyText, type ShinyTextController, type ShinyTextOptions } from '../core';
import '../style/index.css';

const props = defineProps<ShinyTextOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: ShinyTextController | null = null;

const toOptions = (): ShinyTextOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createShinyText(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-shinyText-host" />
</template>
