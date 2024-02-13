import type {
  VectorTiles,
  RasterTiles,
  CircleStyles,
  FillStyles,
  LineStyles,
  LayerGroupedByCategory,
} from "~/utils/types";
import { uncategorizedAlias } from "~/constants";

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

  const getLayersArr = (layers: {
    vectorTiles: {
      data: (VectorTiles | RasterTiles)[];
    };
    rasterTiles: {
      data: (VectorTiles | RasterTiles)[];
    };
  }) => {
    const layersArr: (VectorTiles | RasterTiles)[] = [];
    for (const [key, value] of Object.entries(layers)) {
      value.data.forEach((el) => {
        if (key === "vectorTiles") {
          const item = el as VectorTiles;
          if (item.circle_style) {
            layersArr.push({
              ...item,
              layer_id: item.layer_id + "_circle",
              layer_style: item.circle_style,
              source: "vector_tiles",
              geometry_type: "CIRCLE",
            });
          }
          if (item.line_style) {
            layersArr.push({
              ...item,
              layer_id: item.layer_id + "_line",
              layer_style: item.line_style,
              source: "vector_tiles",
              geometry_type: "LINE",
            });
          }
          if (item.fill_style) {
            layersArr.push({
              ...item,
              layer_id: item.layer_id + "_fill",
              layer_style: item.fill_style,
              source: "vector_tiles",
              geometry_type: "POLYGON",
            });
          }
        } else if (key === "rasterTiles") {
          const item = el as RasterTiles;
          layersArr.push({
            ...item,
            source: "raster_tiles",
            opacity: 1,
            geometry_type: "RASTER",
          });
        }
      });
    }
    return layersArr;
  };

  const groupLayerByCategory = (layerLists: (VectorTiles | RasterTiles)[]) => {
    const layerGroupedByCategory = layerLists.reduce(
      (group: LayerGroupedByCategory[], item) => {
        const existingCategory = group.find((group: LayerGroupedByCategory) => {
          let categoryName = "";
          if (item.category === null) {
            categoryName = uncategorizedAlias;
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
              label: uncategorizedAlias,
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
  };

  const fetchListedLayers = async () => {
    try {
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
        allLayerData.push(...getLayersArr(layers.value));
      }

      if (allLayerData) {
        groupedLayerList.value = groupLayerByCategory(allLayerData);
      }
    } catch (error) {
      return null;
    }
  };

  const fetchActiveLayers = async () => {
    try {
      const { data: layers, pending } = await useAsyncData(
        "map-layer-tiles",
        async () => {
          const [vectorTiles, rasterTiles] = await Promise.all<{
            data: (VectorTiles | RasterTiles)[];
          }>([
            $fetch(
              "/panel/items/vector_tiles?fields=*.*&filter[active][_eq]=true"
            ),
            $fetch(
              "/panel/items/raster_tiles?fields=*.*&filter[active][_eq]=true"
            ),
          ]);

          return { vectorTiles, rasterTiles };
        }
      );

      const allLayerData: (VectorTiles | RasterTiles)[] = [];
      if (layers.value) {
        allLayerData.push(...getLayersArr(layers.value));
      }

      if (allLayerData) {
        groupedActiveLayers.value = groupLayerByCategory(allLayerData);
      }
    } catch (error) {
      return null;
    }
  };

  return {
    fetchListedLayers,
    fetchActiveLayers,
    handleVisibility,
    groupedLayerList,
    groupedActiveLayers,
    updateLayerOpacity,
    groupLayerByCategory,
  };
});
