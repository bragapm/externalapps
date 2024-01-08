<script setup lang="ts">
import { TransitionRoot } from "@headlessui/vue";
import IcBasemap from "~/assets/icons/ic-basemap.svg";
import IcBookmark from "~/assets/icons/ic-bookmark.svg";
import IcChart from "~/assets/icons/ic-chart.svg";
import IcMapLayer from "~/assets/icons/ic-map-layer.svg";
const isShowLayerManagement = ref(false);
const isShowLegend = ref(false);
const isShowInformation = ref(false);
const isShowInfospace = ref(false);
// const isShowToolbox = ref(true);
</script>

<template>
  <div class="fixed top-0 left-0 w-screen h-screen flex flex-col items-start">
    <Map></Map>

    <!-- left sidebar -->
    <TransitionRoot
      as="div"
      :show="isShowLayerManagement"
      enter="transition-all duration-300"
      enter-from="-left-10 opacity-0"
      enter-to="left-0 opacity-1"
      leave="transition-all duration-300"
      leave-from="left-0 opacity-1"
      leave-to="-left-10 opacity-0"
      class="absolute top-[5.5rem] bg-gray-700 w-[18.5rem] rounded-xs p-3 max-h-screen left-6"
    >
      <!-- <MapLayerManagement /> -->
      <h2 class="text-white">Map Layer Management</h2>
    </TransitionRoot>
    <TransitionRoot
      as="div"
      :show="isShowLegend"
      enter="transition-all duration-300"
      enter-from="-left-10 opacity-0"
      enter-to="left-0 opacity-1"
      leave="transition-all duration-300"
      leave-from="left-0 opacity-1"
      leave-to="-left-10 opacity-0"
      :class="isShowLayerManagement ? 'left-[20.5rem]' : 'left-[1.5rem]'"
      class="absolute top-[5.5rem] bg-gray-700 h-72 w-[15.5rem] rounded-xs p-3 transition-all ease-in-out duration-300"
    >
      <h2 class="text-white">Legend</h2>
    </TransitionRoot>

    <!-- top left button controller -->
    <div
      :class="
        isShowLayerManagement && isShowLegend
          ? 'left-[36.5rem]'
          : isShowLayerManagement
          ? 'left-[20.5rem]'
          : isShowLegend
          ? 'left-[17.5rem]'
          : 'left-[1.5rem]'
      "
      class="absolute flex flex-col gap-2 shrink top-[5.5rem] left-6 transition-all ease-in-out duration-300"
    >
      <MapButtonControl
        :onClick="() => (isShowLayerManagement = !isShowLayerManagement)"
        :active="isShowLayerManagement"
      >
        <IcMapLayer class="w-5 h-5" :fontControlled="false" />
      </MapButtonControl>
      <MapButtonControl
        :onClick="() => (isShowLegend = !isShowLegend)"
        :active="isShowLegend"
      >
        <IcBasemap class="w-5 h-5" :fontControlled="false" />
      </MapButtonControl>
    </div>

    <!-- right sidebar -->
    <TransitionRoot
      as="div"
      :show="isShowInformation"
      enter="transition-all duration-300"
      enter-from="-right-10 opacity-0"
      enter-to="right-0 opacity-1"
      leave="transition-all duration-300"
      leave-from="right-0 opacity-1"
      leave-to="-right-10 opacity-0"
      class="absolute top-[5.5rem] right-6 bg-gray-700 w-[18.5rem] rounded-xs max-h-[calc(100%-12rem)] overflow-hidden flex flex-col"
    >
      <MapInformation />
    </TransitionRoot>
    <TransitionRoot
      as="div"
      :show="isShowInfospace"
      enter="transition-all duration-300"
      enter-from="-right-10 opacity-0"
      enter-to="right-0 opacity-1"
      leave="transition-all duration-300"
      leave-from="right-0 opacity-1"
      leave-to="-right-10 opacity-0"
      class="absolute top-[5.5rem] right-6 bg-gray-700 w-[18.5rem] rounded-xs max-h-[calc(100%-12rem)] overflow-hidden flex flex-col"
    >
      <MapInfospace />
    </TransitionRoot>

    <!-- top right button controller -->
    <div
      :class="
        isShowInformation || isShowInfospace
          ? 'right-[20.5rem]'
          : 'right-[1.5rem]'
      "
      class="absolute flex flex-col gap-2 shrink top-[5.5rem] right-6 transition-all ease-in-out duration-300"
    >
      <MapButtonControl
        :onClick="
          () => {
            isShowInformation = !isShowInformation;
            isShowInfospace = false;
          }
        "
        :active="isShowInformation"
      >
        <IcBookmark class="w-5 h-5" :fontControlled="false" />
      </MapButtonControl>
      <MapButtonControl
        :onClick="
          () => {
            isShowInfospace = !isShowInfospace;
            isShowInformation = false;
          }
        "
        :active="isShowInfospace"
      >
        <IcChart class="w-5 h-5" :fontControlled="false" />
      </MapButtonControl>
    </div>

    <!-- bottom toolbox -->
    <!-- <div
      class="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 rounded-xs p-2 space-x-2"
    >
      <MapToolbox />
    </div> -->
  </div>
</template>
