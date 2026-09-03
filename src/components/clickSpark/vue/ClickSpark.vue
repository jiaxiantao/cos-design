<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createClickSpark, type ClickSparkController, type ClickSparkOptions } from '../core';
import '../style/index.css';

const props = defineProps<ClickSparkOptions>();
const hostRef = ref<HTMLElement>();
const slotTarget = ref<HTMLElement | null>(null);
let ctrl: ClickSparkController | null = null;

const toOptions = (): ClickSparkOptions => ({ ...props });

onMounted(() => {
  if (!hostRef.value) return;
  ctrl = createClickSpark(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-clickSpark-host">
    <Teleport v-if="slotTarget" :to="slotTarget">
      <slot />
    </Teleport>
  </div>
</template>
