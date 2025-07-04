<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  layout: "geod",
});
import { TransitionRoot } from "@headlessui/vue";
import IcInfo from "~/assets/icons/ic-info.svg";
import IcChart from "~/assets/icons/ic-chart.svg";
import IcRectangleList from "~/assets/icons/ic-rectangle-list.svg";
import IcMapLayerB from "~/assets/icons/ic-map-layer-b.svg";
import IcLocation from "~/assets/icons/ic-location.svg";
import IcMapExtent from "~/assets/icons/ic-map-instance.svg";
import IcZoomIn from "~/assets/icons/ic-plus.svg";
import IcZoomOut from "~/assets/icons/ic-min.svg";
import { useMapData } from "~/utils";
import { storeToRefs } from "pinia";
import bbox from "@turf/bbox";
import type { LngLatBoundsLike } from "maplibre-gl";

const isShowLegend = ref(false);
const featureStore = useFeature();

const { data: mapData } = await useMapData();
const store = useMapRef();
const { map, geolocateRef } = storeToRefs(store);

const currentZoom = ref(map.value?.getZoom().toPrecision(3));

const updateZoomValue = () => {
  currentZoom.value = map.value?.getZoom().toPrecision(3);
};

watchEffect((onCleanup) => {
  map.value?.on("load", () => updateZoomValue());
  map.value?.on("moveend", () => updateZoomValue());

  onCleanup(() => {
    map.value?.off("load", () => updateZoomValue());
    map.value?.off("moveend", () => updateZoomValue());
  });
});
</script>

<template>
  <div class="fixed top-0 left-0 w-screen h-screen flex flex-col items-start">
    <Map></Map>

    <!-- left sidebar -->
    <TransitionRoot
      as="div"
      :show="isShowLegend"
      enter="transition-all duration-300"
      enter-from="-ml-8 opacity-0"
      enter-to="ml-0 opacity-1"
      leave="transition-all duration-300"
      leave-from="ml-0 opacity-1"
      leave-to="-ml-8 opacity-0"
      class="z-10 absolute top-[5.5rem] left-[1.5rem] bg-grey-900 h-fit max-h-[calc(100%-12rem)] w-[15.5rem] rounded-xs transition-all ease-in-out duration-300 overflow-hidden flex flex-col"
    >
      <MapLegend />
    </TransitionRoot>

    <!-- top left button controller -->
    <!-- <div
      :class="
        showTable
          ? 'left-[calc(50vw-0.75rem)]'
          : isShowLayerManagement && isShowLegend
          ? 'left-[36.5rem]'
          : isShowLayerManagement
          ? 'left-[20.5rem]'
          : isShowLegend
          ? 'left-[17.5rem]'
          : 'left-[1.5rem]'
      "
      class="z-10 absolute flex flex-col gap-2 shrink top-[5.5rem] left-6 transition-all ease-in-out duration-300"
    >
      <MapButtonControl
        :onClick="() => (isShowLegend = !isShowLegend)"
        :active="isShowLegend"
      >
        <IcBasemap class="w-5 h-5" :fontControlled="false" />
      </MapButtonControl>
    </div> -->

    <!-- right sidebar -->
    <TransitionRoot
      as="div"
      :show="featureStore.rightSidebar === 'feature'"
      enter="transition-all duration-300"
      enter-from="-mr-8 opacity-0"
      enter-to="mr-0 opacity-100"
      leave="transition-all duration-300"
      leave-from="mr-0 opacity-100"
      leave-to="-mr-8 opacity-0"
      class="z-10 absolute top-[5.5rem] right-[1.5rem] bg-white w-[18.5rem] rounded-lg h-[calc(100%-12rem)] overflow-hidden flex flex-col"
    >
      <MapFeatureDetail />
    </TransitionRoot>

    <!-- top right button controller -->
    <div
      :class="
        ['feature'].includes(featureStore.rightSidebar)
          ? 'right-[20.5rem]'
          : 'right-[1.5rem]'
      "
      class="rounded-lg bg-white/45 z-10 absolute flex flex-col gap-2 shrink top-[5.5rem] right-6 transition-all ease-in-out duration-300"
    >
      <MapButtonControl
        :onClick="
          () => {
            featureStore.setRightSidebar(
              featureStore.rightSidebar === 'feature' ? '' : 'feature'
            );
          }
        "
        :active="featureStore.rightSidebar === 'feature'"
      >
        <IcRectangleList class="w-5 h-5" :fontControlled="false" />
      </MapButtonControl>
    </div>

    <!-- bottom left map -->
    <MapCoordinatesPanel />

    <!-- bottom toolbox -->
    <MapTools />

    <!-- bottom left map controller -->
    <div
      class="z-10 absolute bottom-8 left-6 transition-all ease-in-out duration-300"
    >
      <MapCompass />
    </div>

    <!-- bottom right map controller -->
    <div class="z-10 absolute bottom-8 right-6">
      <div class="flex gap-2 bg-white/45 rounded-lg p-2">
        <button
          @click="
            () => {
              map && map.fitBounds(mapData?.data?.initial_map_view?
              bbox( mapData?.data?.initial_map_view  ) as LngLatBoundsLike:[
                  [95.01, -11.01],
                  [141.02, 6.08],
                ]);
            }
          "
          class="bg-transparent hover:bg-white/50 p-2 rounded-sm"
        >
          <IcMapExtent class="w-5 h-5 text-grey-700" :fontControlled="false" />
        </button>
        <button
          @click="() => map && geolocateRef && geolocateRef.trigger()"
          class="bg-transparent hover:bg-white/50 p-2 rounded-sm"
        >
          <IcLocation class="w-5 h-5 text-grey-700" :fontControlled="false" />
        </button>
        <button
          @click="() => map && map.zoomOut()"
          class="bg-transparent hover:bg-white/50 p-2 rounded-sm"
        >
          <IcZoomOut class="w-5 h-5 text-grey-700" :fontControlled="false" />
        </button>
        <input
          :value="currentZoom"
          disabled
          type="text"
          class="text-xs text-center w-14 p-2 text-grey-800 rounded-sm border border-grey-500 focus:outline-none"
        />
        <button
          @click="() => map && map.zoomIn()"
          class="bg-transparent hover:bg-white/50 p-2 rounded-sm"
        >
          <IcZoomIn class="w-5 h-5 text-grey-700" :fontControlled="false" />
        </button>
      </div>
    </div>
  </div>
</template>
