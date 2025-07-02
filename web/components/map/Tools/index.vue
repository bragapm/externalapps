<script setup lang="ts">
import { TransitionRoot } from "@headlessui/vue";
import IcMapFlat from "~/assets/icons/ic-map-flat.svg";
import { storeToRefs } from "pinia";

const mapRefStore = useMapRef();

const toolsStore = useMapTools();
const { showTools } = storeToRefs(toolsStore);
</script>

<template>
  <TransitionRoot
    as="div"
    :show="showTools"
    enter="transition-all duration-300"
    enter-from="-mb-6 opacity-0"
    enter-to="mb-0 opacity-1"
    leave="transition-all duration-300"
    leave-from="mb-0 opacity-1"
    leave-to="-mb-6 opacity-0"
    class="z-10 absolute bottom-8 left-1/2 -translate-x-1/2 rounded-lg transition-all duration-1000 ease-in-out"
  >
    <div
      class="flex gap-2 bg-grey-100 ring-1 ring-grey-200 rounded-lg p-2 transition-all duration-1000 ease-in-out"
    >
      <MapToolsDropdown
        :triggerIcon="IcMapFlat"
        :itemLabel="'Basemap'"
        :itemDescription="'Change basemap'"
      >
        <template #custom-item>
          <MapToolsBasemap />
        </template>
      </MapToolsDropdown>
    </div>
  </TransitionRoot>
</template>
