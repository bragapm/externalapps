import type { VectorTiles } from "~/utils/types";

type LayerGroupByCategory = {
  label: string;
  layerLists: VectorTiles[];
  defaultOpen: boolean;
};

export const useMapLayer = defineStore("maplayer", () => {
  const vectorTilesData = ref<VectorTiles[] | null>(null);

  const getGroupLayerList = computed(() => {
    if (vectorTilesData.value) {
      const layerGroupByCategory = vectorTilesData.value.reduce(
        (group: LayerGroupByCategory[], item) => {
          const existingCategory = group.find((group: LayerGroupByCategory) => {
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
              group.push({
                label: "Others",
                layerLists: [item],
                defaultOpen: false,
              });
            } else if (item.category !== null && item.category.category_name) {
              group.push({
                label: item.category.category_name,
                layerLists: [item],
                defaultOpen: false,
              });
            }
          }
          return group;
        },
        []
      );

      return layerGroupByCategory;
    }
  });

  const handleVisibility = (layerIndex: number, visibility: boolean) => {
    if (vectorTilesData.value) {
      const prev = vectorTilesData.value;
      prev[layerIndex]["default"] = visibility;
      vectorTilesData.value = prev;
    }
  };

  const fetchVectorTiles = async () => {
    const { data: layers, pending } = await useAsyncData(
      "vector-tiles",
      async () => {
        const [vectorTiles, rasterTiles] = await Promise.all<{
          data: VectorTiles[];
        }>([
          $fetch("/panel/items/vector_tiles?fields=*.*"),
          $fetch("/panel/items/raster_tiles?fields=*.*"),
        ]);

        return { vectorTiles, rasterTiles };
      }
    );
    if (layers?.value?.vectorTiles) {
      vectorTilesData.value = layers.value.vectorTiles.data;
    }
    // const { pending, data } = await useFetch<VectorTilesData>(
    //   "/panel/items/vector_tiles?fields=*.*",
    //   {
    //     lazy: true,
    //     server: false,
    //   }
    // );
    // if (data?.value) {
    //   vectorTilesData.value = data.value;
    // }
  };

  return {
    vectorTilesData,
    getGroupLayerList,
    fetchVectorTiles,
    handleVisibility,
  };
});
