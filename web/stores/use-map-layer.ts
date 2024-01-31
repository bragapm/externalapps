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
    visibility: string
  ) => {
    if (groupedLayerList.value) {
      const prev = groupedLayerList.value;

      if (prev[groupIndex].layerLists[layerIndex].source === "vector_tiles") {
        const selector = prev[groupIndex].layerLists[layerIndex] as VectorTiles;
        if (selector.geometry_type === "CIRCLE") {
          if (selector.circle_style) {
            selector.circle_style.layout_visibility = visibility;
          }
        } else if (selector.geometry_type === "POLYGON") {
          if (selector.fill_style) {
            selector.fill_style.layout_visibility = visibility;
          }
        } else if (selector.geometry_type === "LINE") {
          if (selector.line_style) {
            selector.line_style.layout_visibility = visibility;
          }
        }
      } else if (
        prev[groupIndex].layerLists[layerIndex].source === "raster_tiles"
      ) {
        (prev[groupIndex].layerLists[layerIndex] as RasterTiles).default =
          visibility === "visible" ? true : false;
      }

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
            if (item.circle_style) {
              allLayerData.push({
                ...item,
                layer_id: item.layer_id + "_circle",
                source: "vector_tiles",
                geometry_type: "CIRCLE",
              });
            }
            if (item.line_style) {
              allLayerData.push({
                ...item,
                layer_id: item.layer_id + "_line",
                source: "vector_tiles",
                geometry_type: "LINE",
              });
            }
            if (item.fill_style) {
              allLayerData.push({
                ...item,
                layer_id: item.layer_id + "_fill",
                source: "vector_tiles",
                geometry_type: "POLYGON",
              });
            }
          } else if (key === "rasterTiles") {
            const item = el as RasterTiles;
            allLayerData.push({
              ...item,
              source: "raster_tiles",
              opacity: 1,
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
