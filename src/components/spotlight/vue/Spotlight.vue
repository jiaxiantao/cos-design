<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createSpotlight, type SpotlightController, type SpotlightOptions } from '../core';
import '../style/index.css';

const props = defineProps<SpotlightOptions>();
const hostRef = ref<HTMLElement>();
const slotTarget = ref<HTMLElement | null>(null);
let ctrl: SpotlightController | null = null;

/** Teleport owns the slot — never let the engine inject a placeholder. */
const toOptions = (): SpotlightOptions => ({ ...props, defaultContent: undefined });

onMounted(() => {
  if (!hostRef.value) return;
  ctrl = createSpotlight(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-spotlight-host">
    <Teleport v-if="slotTarget" :to="slotTarget">
      <slot>
        <span>{{ defaultContent ?? '隐藏内容' }}</span>
      </slot>
    </Teleport>
  </div>
</template>
