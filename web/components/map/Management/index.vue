<script setup lang="ts">

type VectorTiles = {
  layer_name: string;
  category: { category_name: string | null };
};
type VectorTilesData = {
  data: VectorTiles[];
};
type Layer = { label: string };
type LayerGroupByCategory = {
  label: string;
  layerLists: Layer[];
  defaultOpen: boolean;
};

const { pending, data: vectorTilesData } = await useFetch<VectorTilesData>(
  "/panel/items/vector_tiles?fields=*.*",
  {
    lazy: true,
    server: false,
  }
);

const list = computed(() => {
  if (vectorTilesData.value && vectorTilesData.value.data.length > 0) {
    console.log(vectorTilesData.value.data[0]);
    
    const layerGroupByCategory = vectorTilesData.value.data.reduce(
      (acc: LayerGroupByCategory[], item) => {
        const existingCategory = acc.find((group: LayerGroupByCategory) => {
          let categoryName = "";
          if (item.category.category_name === null) {
            categoryName = "Others";
          } else {
            categoryName = item.category.category_name;
          }
          return group.label === categoryName;
        });
        if (existingCategory) {
          existingCategory.layerLists.push({ label: item.layer_name });
        } else {
          if (item.category === null) {
            acc.push({
              label: "Others",
              layerLists: [{ label: item.layer_name }],
              defaultOpen: false,
            });
          } else if (item.category !== null && item.category.category_name) {
            acc.push({
              label: item.category.category_name,
              layerLists: [{ label: item.layer_name }],
              defaultOpen: false,
            });
          }
        }
        return acc;
      },
      []
    );

    return layerGroupByCategory;
  }
});

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
//   {
//     label: "Data Group 3",
//     layerLists: [
//       { id: "layer_1_group_1", label: "Layer 1 Group 1", type: "Polygon" },
//       { id: "layer_2_group_1", label: "Layer 2 Group 1", type: "Polygon" },
//     ],
//     defaultOpen: false,
//   },
//   {
//     label: "Data Group 4",
//     layerLists: [
//       { id: "layer_1_group_1", label: "Layer 1 Group 1", type: "Polygon" },
//       { id: "layer_2_group_1", label: "Layer 2 Group 1", type: "Polygon" },
//     ],
//     defaultOpen: false,
//   },
//   {
//     label: "Data Group 5",
//     layerLists: [
//       { id: "layer_1_group_1", label: "Layer 1 Group 1", type: "Polygon" },
//       { id: "layer_2_group_1", label: "Layer 2 Group 1", type: "Polygon" },
//     ],
//     defaultOpen: false,
//   },
// ];
</script>

<template>
  <h2 class="p-3 text-white">Layer Management</h2>
  <hr class="mx-3" />
  <!-- to do edit loading state -->
  <div v-if="pending" class="px-3 my-3 text-white">Loading ...</div>
  <UAccordion
    v-else-if="list && list.length > 0"
    multiple
    :items="list"
    :ui="{
      default: {
        class:
          'bg-transparent hover:bg-transparent px-0 py-3 text-white rounded-xxs',
      },
      wrapper: 'px-3 my-3 flex-1 overflow-y-scroll',
    }"
  >
    <template #item="{ item }">
      <MapManagementGroup :layerItem="item.layerLists" />
    </template>
  </UAccordion>

  <!-- to do edit style placeholder -->
  <div v-else class="px-3 my-3 text-white">no data</div>
</template>
