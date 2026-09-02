<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createCharge, type ChargeController, type ChargeOptions } from '../core';
import '../style/index.css';

const props = defineProps<ChargeOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: ChargeController | null = null;

const toOptions = (): ChargeOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createCharge(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-charge-host" />
</template>
