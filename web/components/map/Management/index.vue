<script setup lang="ts">
const store = useMapLayer();

// console.log(groupList);

// const layerGroupByCategory = [
//   {
//     label: "Data Group 1",
//     layerLists: [
//       { id: "layer_1_group_1", label: "Layer 1 Group 1", type: "Polygon" },
//       { id: "layer_2_group_1", label: "Layer 2 Group 1", type: "Polygon" },
//     ],
//     defaultOpen: false,
//   },
//   {
//     label: "Data Group 2",
//     layerLists: [
//       { id: "layer_2_group_2", label: "Layer 2 Group 2", type: "Polygon" },
//     ],
//     defaultOpen: false,
//   },
// ];
</script>

<template>
  <h2 class="p-3 text-white">Layer Management</h2>

  <hr class="mx-3" />

  <!-- to do change temporary loading state -->
  <!-- <div v-if="!getGroupLayerList" class="px-3 my-3 text-white">Loading ...</div> -->
  <UAccordion
    v-if="store.groupLayerList"
    multiple
    :items="store.groupLayerList"
    :ui="{
      default: {
        class:
          'bg-transparent hover:bg-transparent px-0 py-3 text-white rounded-xxs',
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
</template>
