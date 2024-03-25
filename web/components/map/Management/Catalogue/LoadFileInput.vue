<script setup lang="ts">
import GeojsonWorker from "~/utils/worker/geojson?worker";
import ShapefileWorker from "~/utils/worker/shapefile?worker";
import {
  geomTypeCircle,
  geomTypeLine,
  geomTypePolygon,
  uncategorizedLoadedData,
} from "~/constants";
import type { LoadedGeoJson } from "~/utils/types";

interface IParseResult {
  geojsonObj: GeoJSON.GeoJSON;
  bounds: GeoJSON.Polygon;
}
interface IParseResultWithFileName extends IParseResult {
  fileName: string;
}

const props = defineProps<{
  sortOrder: { id: "asc" | "desc"; name: string };
}>();

const mapLayerStore = useMapLayer();
const { addLoadedGeoJsonData } = useIDB();
const toast = useToast();
const input = ref<HTMLInputElement | null>(null);

const getWorker = (file: File) => {
  if (file.type === "application/geo+json" || file.name.endsWith(".geojson")) {
    return new GeojsonWorker();
  } else if (
    ["application/zip", "application/x-zip-compressed"].includes(file.type) ||
    file.name.endsWith(".zip")
  ) {
    return new ShapefileWorker();
  } else {
    return null;
  }
};

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

const addToIDBAndLayerList = async (
  fileName: string,
  geojsonObj: GeoJSON.GeoJSON,
  bounds: GeoJSON.Polygon
) => {
  let geojsonGeomType: GeoJSON.GeoJsonGeometryTypes;
  if (geojsonObj.type === "Feature") {
    geojsonGeomType = geojsonObj.geometry.type;
  } else if (geojsonObj.type === "FeatureCollection") {
    if (!geojsonObj.features.length) {
      toast.add({
        title: "Data has no feature",
        description: fileName,
        icon: "i-heroicons-x-mark",
      });
      return;
    }
    geojsonGeomType = geojsonObj.features[0].geometry.type;
  } else {
    geojsonGeomType = geojsonObj.type;
  }
  const typeAndStyle = getGeomTypeAndStyle(geojsonGeomType);
  if (!typeAndStyle) {
    toast.add({
      title: "Data with mixed geometry per feature is not supported",
      description: fileName,
      icon: "i-heroicons-x-mark",
    });
    return;
  }

  const newLayer: LoadedGeoJson = {
    source: "loaded_geojson",
    layer_id: `__local_${crypto.randomUUID()}`,
    layer_alias: fileName,
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
  await addLoadedGeoJsonData(newLayerWithData);

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

const handleFileUploadChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (!target.files || !target.files.length) return;
  const file = target.files[0];
  if (!window.Worker) {
    toast.add({
      title: "Feature not supported in this browser",
      description: "Please use browser that supports Web Worker",
      icon: "i-heroicons-x-mark",
    });
    return;
  }

  const worker = getWorker(file);
  if (!worker) {
    toast.add({
      title: "Unable to identify selected file",
      icon: "i-heroicons-x-mark",
    });
    return;
  }

  worker.onerror = (e) => {
    toast.add({
      title: e.message,
      icon: "i-heroicons-x-mark",
    });
    console.error(e.error);
    worker.terminate();
  };
  worker.onmessage = async (
    e: MessageEvent<
      | { status: "error"; message: string; data?: any }
      | { status: "success"; data: IParseResult | IParseResultWithFileName[] }
    >
  ) => {
    if (e.data.status === "error") {
      toast.add({
        title: e.data.message,
        icon: "i-heroicons-x-mark",
      });
      if (e.data.data) {
        console.error(e.data.data);
      }
    } else {
      const result = e.data.data;
      if (Array.isArray(result)) {
        for (let i = 0; i < result.length; i++) {
          const data = result[i];
          await addToIDBAndLayerList(
            data.fileName || `${file.name}_${i}`,
            data.geojsonObj,
            data.bounds
          );
        }
      } else {
        await addToIDBAndLayerList(file.name, result.geojsonObj, result.bounds);
      }
      toast.add({
        title: "File has been processed successfully",
        icon: "i-heroicons-check-circle",
      });
    }
    worker.terminate();
  };
  worker.postMessage(file);
};

defineExpose({ input });
</script>

<template>
  <input
    ref="input"
    type="file"
    accept=".geojson,application/geo+json,.zip,application/zip,application/x-zip-compressed"
    hidden
    @change="handleFileUploadChange"
  />
</template>
