<script setup lang="ts">
import IcFileSort from "~/assets/icons/ic-file-sort.svg";
import type { LayerGroupedByCategory } from "~/utils/types";
const store = useMapLayer();
const storeCatalogue = useCatalogue();
const { toggleCatalogue } = storeCatalogue;

const filteredLayers = ref<null | LayerGroupedByCategory[]>(null);

const filterRef = ref("");

let timeoutId: NodeJS.Timeout;
function debounce(func: Function, delay: number) {
  return function (...args: any[]) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
}

const handleFilter = (input: string) => {
  if (input) {
    if (store.groupedActiveLayers) {
      filteredLayers.value = store.groupedActiveLayers
        ?.map((item: LayerGroupedByCategory) => {
          return {
            ...item,
            defaultOpen: true,
            layerLists: item.layerLists.filter((el: any) => {
              if (el.layer_name) {
                return el.layer_name
                  ?.toLowerCase()
                  .includes(input.toLowerCase());
              }
            }),
          };
        })
        .filter((item) => item.layerLists.length > 0);
    }
  } else {
    filteredLayers.value = null;
  }
};

watch(filterRef, (newVal) => {
  debounce(handleFilter, 500)(newVal);
});
</script>

<template>
  <h2 class="p-3 text-grey-50">Layer Management</h2>

  <hr class="mx-3" />
  <div class="p-3">
    <UInput
      v-model="filterRef"
      color="gray"
      :ui="{ rounded: 'rounded-xxs' }"
      placeholder="Filter"
    >
    </UInput>
  </div>
  <hr class="mx-3" />
  <!-- to do change temporary loading state -->
  <!-- <div v-if="!getgroupedLayerList" class="px-3 my-3 text-white">Loading ...</div> -->
  <div class="px-3 py-1 my-3 flex-1 overflow-scroll">
    <div
      v-if="filteredLayers && filteredLayers.length > 0"
      class="flex flex-col gap-2"
    >
      <template v-for="item in filteredLayers" :key="item.label">
        <MapManagementGroup
          :defaultOpen="item.defaultOpen"
          :layerLists="item.layerLists"
          :label="item.label"
        />
      </template>
    </div>
    <div
      v-else-if="!filteredLayers && store.groupedActiveLayers"
      class="flex flex-col gap-2"
    >
      <template v-for="item in store.groupedActiveLayers" :key="item.label">
        <MapManagementGroup
          :defaultOpen="item.defaultOpen"
          :layerLists="item.layerLists"
          :label="item.label"
        />
      </template>
    </div>
    <div v-else class="px-3 my-3 text-white">no data</div>
  </div>

  <!-- to do change temporary placeholder -->
  <div class="p-3">
    <UButton
      :ui="{ rounded: 'rounded-xxs' }"
      label="Data Catalogue"
      variant="outline"
      color="brand"
      class="w-full justify-between"
      @click="
        () => {
          toggleCatalogue();
        }
      "
    >
      <template #trailing>
        <IcFileSort class="w-3 h-3" :fontControlled="false" />
      </template>
    </UButton>
  </div>
</template>
