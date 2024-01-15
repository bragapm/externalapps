<script setup lang="ts">
import { TransitionRoot } from "@headlessui/vue";
import IcBasemap from "~/assets/icons/ic-basemap.svg";
import IcBookmark from "~/assets/icons/ic-bookmark.svg";
import IcChart from "~/assets/icons/ic-chart.svg";
import IcLocation from "~/assets/icons/ic-location.svg";
import IcMapExtent from "~/assets/icons/ic-map-instance.svg";
import IcMapLayer from "~/assets/icons/ic-map-layer.svg";
import IcZoomIn from "~/assets/icons/ic-plus.svg";
import IcZoomOut from "~/assets/icons/ic-min.svg";
import { useMapRef } from "~/stores/use-map-ref";
import { storeToRefs } from "pinia";
import { useTableData } from "~/stores/use-table-data";
const isShowLayerManagement = ref(false);
const isShowLegend = ref(false);
const isShowInformation = ref(false);
const isShowInfospace = ref(false);
const isShowToolbox = ref(true);

const store = useMapRef();
const { map, geolocateRef } = storeToRefs(store);

const storeTableData = useTableData();
const { showTable, fullscreen } = storeToRefs(storeTableData);
</script>

<template>
  <div
    :class="[
      showTable && fullscreen && 'z-50',
      'fixed top-0 left-0 w-screen h-screen flex flex-col items-start',
    ]"
  >
    <Map></Map>

    <!-- left sidebar -->
    <TransitionRoot
      as="div"
      :show="isShowLayerManagement"
      enter="transform transition-all duration-300"
      enter-from="-ml-8 opacity-0"
      enter-to="ml-0 opacity-1"
      leave="transform transition-all duration-300"
      leave-from="ml-0 opacity-1"
      leave-to="-ml-8 opacity-0"
      class="absolute top-[5.5rem] bg-grey-900 w-[18.5rem] rounded-xs left-6 z-10 max-h-[calc(100%-12rem)] overflow-hidden flex flex-col"
    >
      <MapLayerManagement />
    </TransitionRoot>
    <TransitionRoot
      as="div"
      :show="isShowLegend"
      enter="transition-all duration-300"
      enter-from="-ml-8 opacity-0"
      enter-to="ml-0 opacity-1"
      leave="transition-all duration-300"
      leave-from="ml-0 opacity-1"
      leave-to="-ml-8 opacity-0"
      :class="isShowLayerManagement ? 'left-[20.5rem]' : 'left-[1.5rem]'"
      class="absolute top-[5.5rem] bg-grey-900 h-72 w-[15.5rem] rounded-xs p-3 transition-all ease-in-out duration-300"
    >
      <h2 class="text-white">Legend</h2>
    </TransitionRoot>
    <TransitionRoot
      :show="showTable"
      enter="transition-all duration-1000"
      enter-from="-ml-8 opacity-0"
      enter-to="ml-0 opacity-1"
      leave="transition-all duration-1000"
      leave-from="ml-0 opacity-1"
      leave-to="-ml-8 opacity-0"
      :class="[
        !fullscreen
          ? 'w-[calc(50vw-3rem)] h-[calc(100vh-7.5rem)] top-[5.5rem]'
          : 'w-[calc(100vw-3rem)] h-[calc(100vh-3rem)] top-[1.5rem]',
        'absolute z-20 left-[1.5rem] bg-grey-900 h-[calc(100vh-7.5rem)] rounded-xs transition-all ease-in-out duration-300',
      ]"
    >
      <MapLayerManagementTable />
    </TransitionRoot>

    <!-- top left button controller -->
    <div
      :class="
        showTable
          ? 'left-[36.5rem]'
          : isShowLayerManagement && isShowLegend
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
      enter-from="-mr-8 opacity-0"
      enter-to="mr-0 opacity-1"
      leave="transition-all duration-300"
      leave-from="mr-0 opacity-1"
      leave-to="-mr-8 opacity-0"
      class="absolute top-[5.5rem] right-6 bg-grey-900 w-[18.5rem] rounded-xs max-h-[calc(100%-12rem)] overflow-hidden flex flex-col"
    >
      <MapInformation />
    </TransitionRoot>
    <TransitionRoot
      as="div"
      :show="isShowInfospace"
      enter="transition-all duration-300"
      enter-from="-mr-8 opacity-0"
      enter-to="mr-0 opacity-1"
      leave="transition-all duration-300"
      leave-from="mr-0 opacity-1"
      leave-to="-mr-8 opacity-0"
      class="absolute top-[5.5rem] right-6 bg-grey-900 w-[18.5rem] rounded-xs max-h-[calc(100%-12rem)] overflow-hidden flex flex-col"
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

    <!-- bottom left map -->
    <MapCoordinatesPanel />

    <!-- bottom toolbox -->
    <MapToolbox />

    <!-- bottom left map controller -->
    <MapCompass />

    <!-- bottom right map controller -->
    <div class="absolute bottom-8 right-6">
      <div class="flex gap-2 bg-black/30 rounded-xs p-2">
        <button
          @click="
            () =>
              map &&
              map.fitBounds([
                [107.58429682785311, -6.932061881071363],
                [107.63532317215248, -6.897425484108055],
              ])
          "
          class="bg-transparent hover:bg-black p-2 rounded-xs"
        >
          <IcMapExtent class="w-5 h-5 text-white" :fontControlled="false" />
        </button>
        <button
          @click="() => map && geolocateRef && geolocateRef.trigger()"
          class="bg-transparent hover:bg-black p-2 rounded-xs"
        >
          <IcLocation class="w-5 h-5 text-white" :fontControlled="false" />
        </button>
        <button
          @click="() => map && map.zoomOut()"
          class="bg-transparent hover:bg-black p-2 rounded-xs"
        >
          <IcZoomOut class="w-5 h-5 text-white" :fontControlled="false" />
        </button>
        <button
          @click="() => map && map.zoomIn()"
          class="bg-transparent hover:bg-black p-2 rounded-xs"
        >
          <IcZoomIn class="w-5 h-5 text-white" :fontControlled="false" />
        </button>
      </div>
    </div>
  </div>
</template>
