<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createMagneticButton, type MagneticButtonController, type MagneticButtonOptions } from '../core';
import '../style/index.css';

const props = defineProps<MagneticButtonOptions>();
const hostRef = ref<HTMLElement>();
const slotTarget = ref<HTMLElement | null>(null);
let ctrl: MagneticButtonController | null = null;

const toOptions = (): MagneticButtonOptions => ({ ...props });

onMounted(() => {
  if (!hostRef.value) return;
  ctrl = createMagneticButton(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-magneticButton-host">
    <Teleport v-if="slotTarget" :to="slotTarget">
      <slot />
    </Teleport>
  </div>
</template>
