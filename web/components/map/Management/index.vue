<script setup lang="ts">
import type { VectorTiles } from "~/utils/types";

type VectorTilesData = {
  data: VectorTiles[];
};

type LayerGroupByCategory = {
  label: string;
  layerLists: VectorTiles[];
  defaultOpen: boolean;
};

const store = useMapLayer();
const { setActiveMapLayer } = store;

const { pending, data: vectorTilesData } = await useFetch<VectorTilesData>(
  "/panel/items/vector_tiles?fields=*.*",
  {
    lazy: true,
    server: false,
  }
);

const list = computed(() => {
  if (vectorTilesData.value && vectorTilesData.value.data.length > 0) {
    console.log(vectorTilesData.value.data);
    setActiveMapLayer(vectorTilesData.value.data);
    const layerGroupByCategory = vectorTilesData.value.data.reduce(
      (acc: LayerGroupByCategory[], item) => {
        const existingCategory = acc.find((group: LayerGroupByCategory) => {
          let categoryName = "";
          if (item.category === null) {
            categoryName = "Others";
          } else if (item.category.category_name) {
            categoryName = item.category.category_name;
          }
          return group.label === categoryName;
        });

        if (existingCategory) {
          existingCategory.layerLists.push(item);
        } else {
          if (item.category === null) {
            acc.push({
              label: "Others",
              layerLists: [item],
              defaultOpen: false,
            });
          } else if (item.category !== null && item.category.category_name) {
            acc.push({
              label: item.category.category_name,
              layerLists: [item],
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
// ];
</script>

<template>
  <h2 class="p-3 text-white">Layer Management</h2>

  <hr class="mx-3" />

  <!-- to do change temporary loading state -->
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
      <MapManagementGroup :layerLists="item.layerLists" />
    </template>
  </UAccordion>

  <!-- to do change temporary placeholder -->
  <div v-else class="px-3 my-3 text-white">no data</div>
</template>
