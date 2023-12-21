<script setup lang="ts">
import IcBasemap from "~/assets/icons/ic-basemap.svg";
import IcMapLayer from "~/assets/icons/ic-map-layer.svg";
import { Motion, Presence } from "motion/vue";
const isShowLayerManagement = ref(false);
const isShowLegend = ref(false);
</script>

<template>
  <div class="fixed top-0 left-0 w-screen h-screen flex flex-col items-start">
    <Map></Map>
    <Presence>
      <Motion
        v-show="isShowLayerManagement"
        :initial="false"
        :animate="{
          opacity: 1,
          x: 0,
          left: '1.5rem',
        }"
        :exit="{ opacity: 0, x: -50 }"
        :transition="{ duration: 0.5, easing: 'ease-in-out' }"
        class="absolute top-[5.5rem] bg-gray-700 h-96 w-[18.5rem] rounded-lg p-3"
      >
        <h2 class="text-white">Layer Management</h2>
      </Motion>
    </Presence>
    <Presence>
      <Motion
        v-show="isShowLegend"
        :initial="false"
        :animate="{
          opacity: 1,
          x: 0,
          left: isShowLayerManagement ? '20.5rem' : '1.5rem',
        }"
        :exit="{ opacity: 0, x: -200 }"
        :transition="{ duration: 0.5 }"
        class="absolute top-[5.5rem] bg-gray-700 h-72 w-[15.5rem] rounded-lg p-3"
      >
        <h2 class="text-white">Legend</h2>
      </Motion>
    </Presence>
    <Motion
      :initial="{ left: '1.5rem' }"
      :animate="{
        left:
          isShowLayerManagement && isShowLegend
            ? '36.5rem'
            : isShowLayerManagement
            ? '20.5rem'
            : isShowLegend
            ? '17.5rem'
            : '1.5rem',
      }"
      :transition="{
        easing: 'ease-in-out',
        duration: 0.5,
      }"
      class="absolute flex flex-col gap-2 shrink top-[5.5rem]"
    >
      <UButton
        @click="isShowLayerManagement = !isShowLayerManagement"
        size="sm"
        class="bg-gray-700 p-2 rounded-lg"
      >
        <div class="p-2 rounded-lg">
          <IcMapLayer class="text-base" />
        </div>
      </UButton>
      <UButton
        @click="isShowLegend = !isShowLegend"
        size="sm"
        class="bg-gray-700 p-2 rounded-lg"
      >
        <div class="p-2 rounded-lg">
          <IcBasemap class="text-base" />
        </div>
      </UButton>
    </Motion>
  </div>
</template>
