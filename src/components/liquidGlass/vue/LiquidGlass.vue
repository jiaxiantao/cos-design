<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createLiquidGlass, type LiquidGlassController, type LiquidGlassOptions } from '../core';
import '../style/index.css';

const props = defineProps<LiquidGlassOptions>();
const hostRef = ref<HTMLElement>();
const slotTarget = ref<HTMLElement | null>(null);
let ctrl: LiquidGlassController | null = null;

/** Teleport owns the slot — never let the engine inject a placeholder. */
const toOptions = (): LiquidGlassOptions => ({ ...props, defaultContent: undefined });

onMounted(() => {
  if (!hostRef.value) return;
  ctrl = createLiquidGlass(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-liquidGlass-host">
    <Teleport v-if="slotTarget" :to="slotTarget">
      <slot>
        <span>{{ defaultContent ?? '液态玻璃面板' }}</span>
      </slot>
    </Teleport>
  </div>
</template>
