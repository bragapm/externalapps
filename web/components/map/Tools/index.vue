<script setup lang="ts">
import { TransitionRoot } from "@headlessui/vue";
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
import type { ToolItem } from "~/utils/types";

const showTools = ref(true);
const showIsochroneCard = ref(false);
const store = useTableData();
const { showTable } = storeToRefs(store);

const toolsStore = useMapTools();
const { toggleExpandTools } = toolsStore;
const { expandTools } = storeToRefs(toolsStore);

const showCard = ref(false);
const activeTools = ref<ToolItem | null>(null);

const handleOpenToolsCard = (item: ToolItem) => {
  showCard.value = true;
  showTools.value = false;
  activeTools.value = item;
};

const handleCloseToolsCard = () => {
  showCard.value = false;
  showTools.value = true;
  setTimeout(() => {
    activeTools.value = null;
  }, 400);
};
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
            action: () => console.log('isochrone'),
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
            action: (item) => {
              handleOpenToolsCard(item!);
            },
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
            id: 'length',
            label: 'Length',
            labelCard: 'Length Measurement Tool',
            icon: IcRuler,
            action: (item) => {
              handleOpenToolsCard(item!);
            },
          },
          {
            id: 'area',
            label: 'Area',
            labelCard: 'Area Measurement Tool',
            icon: IcRulerCorner,
            action: (item) => {
              handleOpenToolsCard(item!);
            },
          },
        ]"
      ></MapToolsDropdown>
      <MapToolsDropdown
        :triggerIcon="IcMapFlat"
        :itemLabel="'Basemap'"
        :itemDescription="'Change basemap'"
      >
        <template #custom-item>
          <MapToolsBasemap />
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
    :active="showCard"
    :onClose="handleCloseToolsCard"
    :label="activeTools?.labelCard || activeTools?.label"
    :icon="activeTools?.icon"
  >
    <MapToolsLength v-if="activeTools?.id === 'length'" />
    <MapToolsArea v-else-if="activeTools?.id === 'area'" />
    <MapToolsFindCoordinate v-else-if="activeTools?.id === 'find_coordinate'" />
  </MapToolsCard>
</template>
