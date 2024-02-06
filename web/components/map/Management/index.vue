<script setup lang="ts">
import IcFileSort from "~/assets/icons/ic-file-sort.svg";
const store = useMapLayer();
const storeCatalogue = useCatalogue();
const value = ref("");

const handleFilter = (e: Event) => {
  console.log((e.target as HTMLInputElement).value);
};
</script>

<template>
  <h2 class="p-3 text-grey-50">Layer Management</h2>

  <hr class="mx-3" />
  <div class="p-3">
    <UInput
      v-model="value"
      @change="handleFilter"
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
    v-if="store.groupedLayerList"
    multiple
    :items="store.groupedLayerList"
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
          storeCatalogue.toggleCatalogue();
        }
      "
    >
      <template #trailing>
        <IcFileSort class="w-3 h-3" :fontControlled="false" />
      </template>
    </UButton>
  </div>
</template>
