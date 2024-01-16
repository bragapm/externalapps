<script lang="ts" setup>
import IcEye from "~/assets/icons/ic-eye.svg";
import IcPaint from "~/assets/icons/ic-paint.svg";
import { TransitionRoot } from "@headlessui/vue";

const props = defineProps<{
  layerLabel: string;
  layerType: string;
}>();

const isShowStyling = ref(false);
</script>

<template>
  <div class="transition-all ease-in-out duration-300">
    <div
      :class="[
        isShowStyling
          ? 'bg-grey-700'
          : 'bg-transparent hover:ring-1 hover:ring-grey-500',
        'rounded-xxs p-2 flex justify-between items-center gap-2 w-full ',
      ]"
    >
      <div class="text-white w-8/12">
        <p class="truncate">
          {{ layerLabel }}
        </p>
        <p class="truncate">{{ layerType }}</p>
      </div>
      <div class="flex gap-2 items-center justify-end w-4/12">
        <button @click="isShowStyling = !isShowStyling">
          <IcPaint
            :class="[
              isShowStyling ? 'text-brand-500' : 'text-white',
              'w-3 h-3',
            ]"
            :fontControlled="false"
          />
        </button>
        <IcEye class="text-white w-3 h-3" :fontControlled="false" />
        <MapManagementMenu />
      </div>
    </div>
    <TransitionRoot
      :show="isShowStyling"
      enter="transition duration-500 ease-in-out"
      enterFrom="transform max-h-0 opacity-0"
      enterTo="transform max-h-96 opacity-100"
      leave="transition duration-500 ease-in-out"
      leaveFrom="transform max-h-96 opacity-100"
      leaveTo="transform max-h-0 opacity-0"
      class="transition-all duration-500 ease-in-out"
    >
      <MapManagementStyling />
    </TransitionRoot>
  </div>
</template>
