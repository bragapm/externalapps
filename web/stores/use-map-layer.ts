import type { VectorTiles, RasterTiles } from "~/utils/types";

type LayerGroupedByCategory = {
  label: string;
  layerLists: (VectorTiles | RasterTiles)[];
  defaultOpen: boolean;
};

export const useMapLayer = defineStore("maplayer", () => {
  const groupedLayerList = ref<LayerGroupedByCategory[] | null>(null);

  const handleVisibility = (
    groupIndex: number,
    layerIndex: number,
    visibility: boolean
  ) => {
    if (groupedLayerList.value) {
      const prev = groupedLayerList.value;
      prev[groupIndex].layerLists[layerIndex].default = visibility;
      groupedLayerList.value = prev;
    }
  };

  const fetchVectorTiles = async () => {
    const { data: layers, pending } = await useAsyncData(
      "map-layer-tiles",
      async () => {
        const [vectorTiles, rasterTiles] = await Promise.all<{
          data: (VectorTiles | RasterTiles)[];
        }>([
          $fetch("/panel/items/vector_tiles?fields=*.*"),
          $fetch("/panel/items/raster_tiles?fields=*.*"),
        ]);

        return { vectorTiles, rasterTiles };
      }
    );
    const allLayerData: (VectorTiles | RasterTiles)[] = [];
    if (layers.value) {
      for (const [key, value] of Object.entries(layers.value)) {
        value.data.forEach((el) => {
          if (key === "vectorTiles") {
            const item = el as VectorTiles;
            if (item.circle_style || item.line_style || item.fill_style) {
              allLayerData.push({ ...item, source: "vector_tiles" });
            }
          } else if (key === "rasterTiles") {
            const item = el as RasterTiles;
            allLayerData.push({
              ...item,
              source: "raster_tiles",
            });
          }
        });
      }
    }

    if (allLayerData) {
      const layerGroupedByCategory = allLayerData.reduce(
        (group: LayerGroupedByCategory[], item) => {
          const existingCategory = group.find(
            (group: LayerGroupedByCategory) => {
              let categoryName = "";
              if (item.category === null) {
                categoryName = "Others";
              } else if (item.category.category_name) {
                categoryName = item.category.category_name;
              }
              return group.label === categoryName;
            }
          );

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

      groupedLayerList.value = layerGroupedByCategory;
    }
  };

  return {
    fetchVectorTiles,
    handleVisibility,
    groupedLayerList,
  };
});
