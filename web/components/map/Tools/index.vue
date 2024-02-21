<script setup lang="ts">
import { TransitionRoot } from "@headlessui/vue";
import { MenuItem } from "@headlessui/vue";
import IcArrowFat from "~/assets/icons/ic-arrow-fat.svg";
import IcChart from "~/assets/icons/ic-chart.svg";
import IcDrawFree from "~/assets/icons/ic-draw-free.svg";
import IcDrawSquare from "~/assets/icons/ic-draw-square.svg";
import IcMapFlat from "~/assets/icons/ic-map-flat.svg";
import IcRoute from "~/assets/icons/ic-route.svg";
import IcRuler from "~/assets/icons/ic-ruler.svg";
import IcRulerCorner from "~/assets/icons/ic-ruler-corner.svg";
import IcSearch from "~/assets/icons/ic-search.svg";
import IcTools from "~/assets/icons/ic-tools.svg";
import { storeToRefs } from "pinia";

const showTools = ref(true);
const showIsochroneCard = ref(false);
const store = useTableData();
const { showTable } = storeToRefs(store);

const toolsStore = useMapTools();
const { toggleExpandTools } = toolsStore;
const { expandTools } = storeToRefs(toolsStore);
</script>

<template>
  <TransitionRoot
    as="div"
    :show="!showTable && showTools"
    enter="transition-all duration-300"
    enter-from="-mb-6 opacity-0"
    enter-to="mb-0 opacity-1"
    leave="transition-all duration-300"
    leave-from="mb-0 opacity-1"
    leave-to="-mb-6 opacity-0"
    class="z-10 absolute bottom-8 left-1/2 -translate-x-1/2 rounded-xs transition-all duration-1000 ease-in-out"
  >
    <div
      class="flex gap-2 bg-grey-900 ring-1 ring-grey-700 rounded-xs p-2 transition-all duration-1000 ease-in-out"
    >
      <MapToolsDropdown
        :triggerLabel="'Analytic Tools'"
        :triggerIcon="IcChart"
        :itemLabel="'Analytic Tools'"
        :itemDescription="'Geospatial Analytic Tools to draw Insights from the Map.'"
        :items="[
          {
            id: 'advanced_insight',
            label: 'Advanced Insight',
            icon: IcTools,
            action: () => console.log('advanced_insight'),
          },
          {
            id: 'isochrone',
            label: 'Isochrone',
            icon: IcDrawFree,
            action: () => {
              showIsochroneCard = true;
              showTools = false;
            },
          },
          {
            id: 'buffer_area',
            label: 'Buffer Area',
            icon: IcDrawSquare,
            action: () => console.log('buffer_area'),
          },
          {
            id: 'route_finder',
            label: 'Route Finder',
            icon: IcRoute,
            action: () => console.log('route_finder'),
          },
        ]"
      ></MapToolsDropdown>
      <MapToolsDropdown
        :triggerLabel="'Advanced Search'"
        :triggerIcon="IcSearch"
        :items="[
          {
            id: 'find_coordinate',
            label: 'Find Coordinate',
            icon: IcDrawFree,
          },
          {
            id: 'administrative_area',
            label: 'Administration Area',
            icon: IcDrawSquare,
          },
          {
            id: 'building_number',
            label: 'Building Number',
            icon: IcRoute,
          },
        ]"
      ></MapToolsDropdown>
      <div class="border-l border-grey-700 h-8"></div>
      <MapToolsDropdown
        :triggerIcon="IcRuler"
        :itemLabel="'Measurement'"
        :itemDescription="'Draw on Map and add to layer'"
        :items="[
          {
            id: 'distance',
            label: 'Distance',
            icon: IcRuler,
          },
          {
            id: 'area',
            label: 'Area',
            icon: IcRulerCorner,
          },
        ]"
      ></MapToolsDropdown>
      <MapToolsDropdown
        :triggerIcon="IcMapFlat"
        :itemLabel="'Basemap'"
        :itemDescription="'Draw on Map and add to layer'"
      >
        <template #custom-item>
          <div
            v-for="item in [
              {
                id: 1,
                label: 'Satellite',
                url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/-122.4241,37.78,15.25,0,60/400x400?access_token=pk.eyJ1IjoiaGFmaXphbmFkbGkiLCJhIjoiY2s0M3pxdmtnMGRmODNkcG11a2RkdGEyNiJ9.zJ_0jcPOGZko34FBrPxDRA',
              },
              {
                id: 1,
                label: 'Dark Theme',
                url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/-122.4241,37.78,15.25,0,60/400x400?access_token=pk.eyJ1IjoiaGFmaXphbmFkbGkiLCJhIjoiY2s0M3pxdmtnMGRmODNkcG11a2RkdGEyNiJ9.zJ_0jcPOGZko34FBrPxDRA',
              },
            ]"
            :key="item.id"
          >
            <MenuItem v-slot="{ active }">
              <button
                :class="[
                  active ? 'bg-grey-700' : 'bg-transparent text-grey-200',
                  'group flex w-full items-center gap-3 rounded-xxs p-2 text-xs text-white',
                ]"
              >
                <NuxtImg
                  width="64px"
                  height="64px"
                  class="rounded-xxs"
                  :src="item.url"
                />
                {{ item.label }}
              </button>
            </MenuItem>
          </div>
        </template>
      </MapToolsDropdown>
      <div class="border-l border-grey-700 h-8"></div>
      <button
        @click="toggleExpandTools"
        :class="expandTools ? '' : 'rotate-180'"
        class="transition-all duration-500 ease-in-out"
      >
        <IcArrowFat class="w-4 h-4 text-grey-400" :fontControlled="false" />
      </button>
    </div>
  </TransitionRoot>
  <MapToolsCard
    :active="showIsochroneCard"
    :onClose="
      () => {
        showIsochroneCard = false;
        showTools = true;
      }
    "
    :label="'Isochrone Tool'"
  >
    <MapToolsIsochrone />
  </MapToolsCard>
</template>