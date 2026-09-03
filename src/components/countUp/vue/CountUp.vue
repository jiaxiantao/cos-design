<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createCountUp, type CountUpController, type CountUpOptions } from '../core';
import '../style/index.css';

const props = defineProps<CountUpOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: CountUpController | null = null;

const toOptions = (): CountUpOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createCountUp(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-countUp-host" />
</template>
