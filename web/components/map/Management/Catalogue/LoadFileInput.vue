<script setup lang="ts">
import bbox from "@turf/bbox";
import geojsonhint from "@mapbox/geojsonhint/lib/object";

import {
  geomTypeCircle,
  geomTypeLine,
  geomTypePolygon,
  uncategorizedLoadedData,
} from "~/constants";
import iDB from "~/utils/iDB";
import type { LoadedGeoJson } from "~/utils/types";

const props = defineProps<{
  sortOrder: { id: "asc" | "desc"; name: string };
}>();

const mapStore = useMapRef();
const mapLayerStore = useMapLayer();
const input = ref<HTMLInputElement | null>(null);

const getGeomTypeAndStyle = (
  geojsonGeomType: GeoJSON.GeoJsonGeometryTypes
): {
  geomType:
    | typeof geomTypeCircle
    | typeof geomTypeLine
    | typeof geomTypePolygon;
  layerStyle: CircleStyles | LineStyles | FillStyles;
} | null => {
  const randomColor = `#${Math.floor(Math.random() * 16777216).toString(16)}`;
  if (geojsonGeomType === "Point" || geojsonGeomType === "MultiPoint") {
    return {
      geomType: geomTypeCircle,
      layerStyle: {
        paint_circle_color: randomColor,
        paint_circle_radius: 5,
        paint_circle_stroke_width: 1,
        layout_visibility: "visible",
      },
    };
  } else if (
    geojsonGeomType === "LineString" ||
    geojsonGeomType === "MultiLineString"
  ) {
    return {
      geomType: geomTypeLine,
      layerStyle: {
        paint_line_color: randomColor,
        paint_line_width: 2,
        layout_visibility: "visible",
      },
    };
  } else if (
    geojsonGeomType === "Polygon" ||
    geojsonGeomType === "MultiPolygon"
  ) {
    return {
      geomType: geomTypePolygon,
      layerStyle: {
        paint_fill_color: randomColor,
        paint_fill_outline_color: "#000000",
        layout_visibility: "visible",
      },
    };
  } else {
    return null;
  }
};

const handleFileUploadChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (
    !target.files ||
    !target.files.length ||
    !mapStore.map ||
    !mapStore.mapLoad
  )
    return;
  const file = target.files[0];
  let geojsonObj: GeoJSON.GeoJSON;
  let bounds: GeoJSON.Polygon;
  try {
    geojsonObj = JSON.parse(await file.text());
    const geojsonError = geojsonhint.hint(geojsonObj);
    if (geojsonError.length) {
      // TODO UI for error
      console.error(geojsonError);
      return;
    }
    const [xmin, ymin, xmax, ymax] = bbox(geojsonObj);
    bounds = {
      type: "Polygon",
      coordinates: [
        [
          [xmin, ymin],
          [xmin, ymax],
          [xmax, ymax],
          [xmax, ymin],
          [xmin, ymin],
        ],
      ],
    };
  } catch (error) {
    // TODO UI for error
    console.error(error);
    return;
  }
  if (geojsonObj.type === "GeometryCollection") {
    // TODO UI for error
    console.error("GeoJSON with GeometryCollection is not supported");
    return;
  }

  let geojsonGeomType: GeoJSON.GeoJsonGeometryTypes;
  if (geojsonObj.type === "Feature") {
    geojsonGeomType = geojsonObj.geometry.type;
  } else if (geojsonObj.type === "FeatureCollection") {
    if (!geojsonObj.features.length) {
      // TODO UI for error
      console.error("Data has no feature");
      return;
    }
    geojsonGeomType = geojsonObj.features[0].geometry.type;
  } else {
    geojsonGeomType = geojsonObj.type;
  }
  const typeAndStyle = getGeomTypeAndStyle(geojsonGeomType);
  if (!typeAndStyle) {
    // TODO UI for error
    console.error("GeoJSON with GeometryCollection is not supported");
    return;
  }

  const newLayer: LoadedGeoJson = {
    source: "loaded_geojson",
    layer_id: `__local_${crypto.randomUUID()}`,
    layer_alias: file.name,
    category: { category_name: uncategorizedLoadedData },
    bounds,
    layer_style: typeAndStyle.layerStyle,
    geometry_type: typeAndStyle.geomType,
    dimension: "2D",
  };
  const newLayerWithData = {
    ...newLayer,
    data: geojsonObj,
  };
  await iDB.loadedGeoJsonData.add(newLayerWithData);

  const loadedDataGroupIdx = mapLayerStore.groupedLocalLayers.findIndex(
    (el) => el.label === uncategorizedLoadedData
  );
  if (loadedDataGroupIdx > -1) {
    mapLayerStore.groupedLocalLayers[loadedDataGroupIdx].layerLists.push(
      newLayer
    );
    const currentLayers = mapLayerStore.groupedLocalLayers
      .map(({ layerLists }) => layerLists)
      .flat();
    mapLayerStore.groupedLocalLayers = mapLayerStore.groupLayerByCategory(
      mapLayerStore.sortLayer(currentLayers, props.sortOrder.id)
    );
  } else {
    mapLayerStore.groupedLocalLayers.push({
      label: uncategorizedLoadedData,
      layerLists: [newLayer],
      defaultOpen: false,
    });
  }
};

defineExpose({ input });
</script>

<template>
  <input
    ref="input"
    type="file"
    accept=".geojson,application/geo+json"
    hidden
    @change="handleFileUploadChange"
  />
</template>
