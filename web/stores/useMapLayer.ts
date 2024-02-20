import type {
  VectorTiles,
  RasterTiles,
  CircleStyles,
  FillStyles,
  LineStyles,
  LayerGroupedByCategory,
} from "~/utils/types";
import {
  geomTypeCircle,
  geomTypeLine,
  geomTypePolygon,
  geomTypeRaster,
  uncategorizedAlias,
} from "~/constants";

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
        if (selected.geometry_type === geomTypeCircle) {
          (selected.layer_style as CircleStyles).paint_circle_opacity =
            updatedOpacity.toString();
        } else if (selected.geometry_type === geomTypeLine) {
          (selected.layer_style as LineStyles).paint_line_opacity =
            updatedOpacity.toString();
        } else if (selected.geometry_type === geomTypePolygon) {
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
          const item = JSON.parse(JSON.stringify(el as VectorTiles));
          delete item.circle_style;
          delete item.line_style;
          delete item.fill_style;
          if ((el as VectorTiles).circle_style) {
            layersArr.push({
              ...item,
              layer_id: item.layer_id + "_circle",
              layer_alias: item.layer_alias || item.layer_name,
              layer_style: (el as VectorTiles).circle_style as CircleStyles,
              source: "vector_tiles",
              geometry_type: geomTypeCircle,
              dimension: "2D",
            });
          }
          if ((el as VectorTiles).line_style) {
            layersArr.push({
              ...item,
              layer_id: item.layer_id + "_line",
              layer_alias: item.layer_alias || item.layer_name,
              layer_style: (el as VectorTiles).line_style as LineStyles,
              source: "vector_tiles",
              geometry_type: geomTypeLine,
              dimension: "2D",
            });
          }
          if ((el as VectorTiles).fill_style) {
            layersArr.push({
              ...item,
              layer_id: item.layer_id + "_fill",
              layer_alias: item.layer_alias || item.layer_name,
              layer_style: (el as VectorTiles).fill_style as FillStyles,
              source: "vector_tiles",
              geometry_type: geomTypePolygon,
              dimension: "2D",
            });
          }
        } else if (key === "rasterTiles") {
          const item = el as RasterTiles;
          layersArr.push({
            ...item,
            source: "raster_tiles",
            opacity: 1,
            geometry_type: geomTypeRaster,
            dimension: "2D",
          });
        }
      });
    }

    //sort by layer_alias is ascending order
    layersArr!.sort((a: any, b: any) => {
      const nameA = a.layer_alias.toUpperCase(); // ignore upper and lowercase
      const nameB = b.layer_alias.toUpperCase(); // ignore upper and lowercase
      return nameA.localeCompare(nameB);
    });
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

        return group!.sort((a: any, b: any) => {
          const nameA = a.label.toUpperCase(); // ignore upper and lowercase
          const nameB = b.label.toUpperCase(); // ignore upper and lowercase
          return nameA.localeCompare(nameB);
        });
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
            $fetch("/panel/items/vector_tiles?fields=*.*&sort=layer_name"),
            $fetch("/panel/items/raster_tiles?fields=*.*&sort=layer_alias"),
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
              "/panel/items/vector_tiles?fields=*.*&filter[active][_eq]=true&sort=layer_name"
            ),
            $fetch(
              "/panel/items/raster_tiles?fields=*.*&filter[active][_eq]=true&sort=layer_alias"
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
