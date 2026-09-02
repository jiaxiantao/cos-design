<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createTimelinePulse, type TimelinePulseController, type TimelinePulseOptions } from '../core';
import '../style/index.css';

const props = defineProps<TimelinePulseOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: TimelinePulseController | null = null;

const toOptions = (): TimelinePulseOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createTimelinePulse(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-timelinePulse-host" />
</template>
