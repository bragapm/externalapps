<script setup lang="ts">
const layerGroupItems = [
  {
    label: "Data Group 1",
    layerItems: [
      { id: "layer_1_group_1", label: "Layer 1 Group 1", type: "Polygon" },
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
];
</script>

<template>
  <h2 class="text-white">Layer Management</h2>
  <hr class="my-3" />
  <UAccordion
    :items="layerGroupItems"
    :ui="{ default: { class: 'bg-transparent hover:bg-brand-500 text-white rounded-xxs' } }"
  >
    <template #item="{ item }">
      <MapLayerManagementGroup :layerItem="item.layerItems" />
    </template>
  </UAccordion>
</template>
