<script lang="ts" setup>
import IcPaint from "~/assets/icons/ic-paint.svg";

const rangeValue = ref(50);
</script>

<template>
  <div class="bg-grey-800 rounded-xxs mt-1 divide-y-[1px] divide-grey-700">
    <div class="p-2 flex items-center gap-[6px]">
      <IcPaint class="w-3 h-3 text-grey-400" :fontControlled="false" />
      <p class="text-grey-50 text-2xs font-medium">Styling</p>
    </div>
    <div class="p-2 space-y-2">
      <div class="flex justify-between items-center text-2xs">
        <p class="text-grey-200">Opacity</p>
        <p class="text-grey-400">Styling</p>
      </div>
      <div class="flex items-center justify-between gap-2">
        <URange
          v-model="rangeValue"
          name="range"
          size="sm"
          color="primary"
          :ui="{
            background: 'bg-grey-800',
            thumb: {
              background:
                '[&::-webkit-slider-thumb]:bg-grey-400 [&::-webkit-slider-thumb]:dark:bg-gray-400',
              ring: '[&::-webkit-slider-thumb]:ring-0 [&::-webkit-slider-thumb]:ring-current',
            },
            track: {
              background:
                '[&::-webkit-slider-runnable-track]:bg-gray-700 [&::-moz-range-track]:bg-gray-700 [&::-webkit-slider-runnable-track]:dark:bg-gray-700 [&::-moz-range-track]:dark:bg-gray-700',
            },
          }"
        />
        <div
          class="w-10 text-center p-1 text-2xs text-grey-200 font-medium rounded-xxs border border-grey-600 bg-grey-700"
        >
          {{ rangeValue }}%
        </div>
      </div>
    </div>
    <div class="p-2 space-y-2">
      <div class="flex justify-between items-center text-2xs">
        <p class="text-grey-200">Fill Color</p>
        <p class="text-grey-400">Styling</p>
      </div>
    </div>
    <div class="p-2 space-y-2">
      <div class="flex justify-between items-center text-2xs">
        <p class="text-grey-200">Stroke</p>
        <p class="text-grey-400">Styling</p>
      </div>
    </div>
  </div>
</template>
