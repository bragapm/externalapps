<script setup lang="ts">
import IcFileSort from "~/assets/icons/ic-file-sort.svg";
import type { LayerGroupedByCategory } from "~/utils/types";
const store = useMapLayer();
const storeCatalogue = useCatalogue();
const { toggleCatalogue } = storeCatalogue;

const filteredLayers = ref<null | LayerGroupedByCategory[]>(null);
const managementData = computed(() => {
  if (filteredLayers.value) {
    return filteredLayers.value;
  } else if (store.groupedActiveLayers) {
    return store.groupedActiveLayers;
  }
});

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
  debounce(handleFilter, 750)(newVal);
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
  <UAccordion
    v-if="managementData"
    multiple
    :items="managementData"
    :ui="{
      default: {
        class:
          'bg-transparent hover:bg-transparent px-0 py-3 text-grey-200 rounded-xxs',
      },
      wrapper: 'px-3 my-3 flex-1 overflow-y-scroll',
    }"
  >
    <template #item="{ item }">
      <MapManagementGroup :layerLists="item.layerLists" />
    </template>
  </UAccordion>

  <!-- to do change temporary placeholder -->
  <div v-else class="px-3 my-3 text-white">no data</div>
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
