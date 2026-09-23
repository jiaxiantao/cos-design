<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createBarcodeScan, type BarcodeScanController, type BarcodeScanOptions } from '../core';
import '../style/index.css';

const props = defineProps<BarcodeScanOptions>();
const hostRef = ref<HTMLElement>();
const slotTarget = ref<HTMLElement | null>(null);
let ctrl: BarcodeScanController | null = null;

/** Teleport owns the slot — never let the engine inject a placeholder. */
const toOptions = (): BarcodeScanOptions => ({ ...props, defaultContent: undefined });

onMounted(() => {
  if (!hostRef.value) return;
  ctrl = createBarcodeScan(hostRef.value, toOptions());
  slotTarget.value = ctrl.getSlot?.() ?? null;
});

watch(
  () => optionsFingerprint(props),
  () => ctrl?.update(toOptions()),
);

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
  slotTarget.value = null;
});

defineExpose({
  getSlot: () => ctrl?.getSlot?.(),
});
</script>

<template>
  <div ref="hostRef" class="cos-barcodeScan-host">
    <Teleport v-if="slotTarget" :to="slotTarget">
      <slot>
        <span>{{ defaultContent ?? 'SCAN ME' }}</span>
      </slot>
    </Teleport>
  </div>
</template>
