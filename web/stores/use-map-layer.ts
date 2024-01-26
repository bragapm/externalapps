import type { VectorTiles, RasterTiles } from "~/utils/types";

type LayerGroupByCategory = {
  label: string;
  // layerLists: (VectorTiles | RasterTiles)[];
  layerLists: VectorTiles[];
  defaultOpen: boolean;
};

export const useMapLayer = defineStore("maplayer", () => {
  const groupLayerList = ref<LayerGroupByCategory[] | null>(null);

  const handleVisibility = (
    groupIndex: number,
    layerIndex: number,
    visibility: boolean
  ) => {
    if (groupLayerList.value) {
      const prev = groupLayerList.value;
      prev[groupIndex].layerLists[layerIndex].default = visibility;
      groupLayerList.value = prev;
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

    const allLayerData = [
      ...layers.value.vectorTiles.data,
      // ...layers.value.rasterTiles.data,
    ];
    console.log(allLayerData);

    if (allLayerData) {
      const layerGroupByCategory = allLayerData.reduce(
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

      groupLayerList.value = layerGroupByCategory;
    }
  };

  return {
    fetchVectorTiles,
    handleVisibility,
    groupLayerList,
  };
});
