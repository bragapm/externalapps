<script setup lang="ts">
const layerGroupItems = [
  {
    label: "Data Group 1",
    layerItems: [
      { id: "layer_1_group_1", label: "Layer 1 Group 1", type: "Polygon" },
      { id: "layer_2_group_1", label: "Layer 2 Group 1", type: "Polygon" },
    ],
    defaultOpen: false,
  },
  {
    label: "Data Group 2",
    layerItems: [
      { id: "layer_2_group_2", label: "Layer 2 Group 2", type: "Polygon" },
    ],
    defaultOpen: false,
  },
  {
    label: "Data Group 3",
    layerItems: [
      { id: "layer_1_group_1", label: "Layer 1 Group 1", type: "Polygon" },
      { id: "layer_2_group_1", label: "Layer 2 Group 1", type: "Polygon" },
    ],
    defaultOpen: false,
  },
  {
    label: "Data Group 4",
    layerItems: [
      { id: "layer_1_group_1", label: "Layer 1 Group 1", type: "Polygon" },
      { id: "layer_2_group_1", label: "Layer 2 Group 1", type: "Polygon" },
    ],
    defaultOpen: false,
  },
  {
    label: "Data Group 5",
    layerItems: [
      { id: "layer_1_group_1", label: "Layer 1 Group 1", type: "Polygon" },
      { id: "layer_2_group_1", label: "Layer 2 Group 1", type: "Polygon" },
    ],
    defaultOpen: false,
  },
];
</script>

<template>
  <h2 class="p-3 text-white">Layer Management</h2>
  <hr class="mx-3" />
  <UAccordion
    multiple
    :items="layerGroupItems"
    :ui="{
      default: {
        class:
          'bg-transparent hover:bg-transparent px-0 py-3 text-white rounded-xxs',
      },
      wrapper: 'px-3 my-3 flex-1 overflow-y-scroll',
    }"
  >
    <template #item="{ item }">
      <MapLayerManagementGroup :layerItem="item.layerItems" />
    </template>
  </UAccordion>
</template>
