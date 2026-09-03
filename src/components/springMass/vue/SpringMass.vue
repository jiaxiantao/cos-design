<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createSpringMass, type SpringMassController, type SpringMassOptions } from '../core';
import '../style/index.css';

const props = defineProps<SpringMassOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: SpringMassController | null = null;

const toOptions = (): SpringMassOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createSpringMass(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-springMass-host" />
</template>
