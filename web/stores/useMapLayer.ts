import type {
  VectorTiles,
  RasterTiles,
  CircleStyles,
  FillStyles,
  LineStyles,
  LayerGroupedByCategory,
} from "~/utils/types";

export const useMapLayer = defineStore("maplayer", () => {
  const groupedActiveLayers = ref<LayerGroupedByCategory[] | null>(null);
  const groupedLayerList = ref<LayerGroupedByCategory[] | null>(null);

  const handleVisibility = (
    groupIndex: number,
    layerIndex: number,
    visibility: string
  ) => {
    if (groupedActiveLayers.value) {
      const prev = groupedActiveLayers.value;
      const selected = prev[groupIndex].layerLists[layerIndex];

      if (selected.source === "vector_tiles") {
        (selected as VectorTiles).layer_style.layout_visibility = visibility;
      } else if (selected.source === "raster_tiles") {
        (selected as RasterTiles).default =
          visibility === "visible" ? true : false;
      }

      groupedActiveLayers.value = prev;
    }
  };

  const updateLayerOpacity = (
    groupIndex: number,
    layerIndex: number,
    opacity: number
  ) => {
    if (groupedLayerList.value) {
      const prev = groupedLayerList.value;
      const selected = prev[groupIndex].layerLists[layerIndex];
      if (selected.source === "vector_tiles") {
        let updatedOpacity = opacity;
        if (selected.geometry_type === "CIRCLE") {
          (selected.layer_style as CircleStyles).paint_circle_opacity =
            updatedOpacity.toString();
        } else if (selected.geometry_type === "LINE") {
          (selected.layer_style as LineStyles).paint_line_opacity =
            updatedOpacity.toString();
        } else if (selected.geometry_type === "POLYGON") {
          (selected.layer_style as FillStyles).paint_fill_opacity =
            updatedOpacity.toString();
        }
      } else if (selected.source === "raster_tiles") {
        (selected as RasterTiles).opacity = opacity;
      }

      groupedLayerList.value = prev;
    }
  };

  const fetchLayer = async () => {
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
                layer_style: item.circle_style,
                source: "vector_tiles",
                geometry_type: "CIRCLE",
              });
            }
            if (item.line_style) {
              allLayerData.push({
                ...item,
                layer_id: item.layer_id + "_line",
                layer_style: item.line_style,
                source: "vector_tiles",
                geometry_type: "LINE",
              });
            }
            if (item.fill_style) {
              allLayerData.push({
                ...item,
                layer_id: item.layer_id + "_fill",
                layer_style: item.fill_style,
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
      groupedActiveLayers.value = layerGroupedByCategory;
      groupedLayerList.value = layerGroupedByCategory;
    }
  };

  const groupLayerByCategory = (layerLists: (VectorTiles | RasterTiles)[]) => {
    const layerGroupedByCategory = layerLists.reduce(
      (group: LayerGroupedByCategory[], item) => {
        const existingCategory = group.find((group: LayerGroupedByCategory) => {
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
    return layerGroupedByCategory;
    // groupedLayerList.value = layerGroupedByCategory;
  };

  return {
    fetchLayer,
    handleVisibility,
    groupedLayerList,
    groupedActiveLayers,
    updateLayerOpacity,
    groupLayerByCategory,
  };
});
