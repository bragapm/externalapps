<script lang="ts" setup>
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/vue";
import GeojsonWorker from "~/utils/worker/geojson?worker";
import ShapefileWorker from "~/utils/worker/shapefile?worker";
import SheetsWorker from "~/utils/worker/sheets?worker";
import KmlWorker from "~/utils/worker/kml?worker";
import GpxWorker from "~/utils/worker/gpx?worker";
import TcxWorker from "~/utils/worker/tcx?worker";
import GeopackageWorker from "~/utils/worker/geopackage?worker";
import FlatgeobufWorker from "~/utils/worker/flatgeobuf?worker";
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

const emit = defineEmits<{
  (e: "handleCancel"): void;
  (e: "handleSuccess"): void;
}>();

const toast = useToast();

const formatType = ref<string | null>(null);
const selectedFile = ref<File | null>(null);

const mapLayerStore = useMapLayer();
const { addLoadedGeoJsonData } = useIDB();

const cancel = () => {
  emit("handleCancel");
};

const selectedTab = ref(0);

function changeTab(index: number) {
  selectedTab.value = index;
}

const getWorker = (file: File) => {
  if (file.type === "application/geo+json" || file.name.endsWith(".geojson")) {
    return new GeojsonWorker();
  } else if (
    ["application/zip", "application/x-zip-compressed"].includes(file.type) ||
    file.name.endsWith(".zip")
  ) {
    return new ShapefileWorker();
  } else if (
    [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ].includes(file.type) ||
    [".csv", ".xls", ".xlsx"].some((el) => file.name.endsWith(el))
  ) {
    return new SheetsWorker();
  } else if (
    file.type === "application/vnd.google-earth.kml+xml" ||
    file.name.endsWith(".kml")
  ) {
    return new KmlWorker();
  } else if (
    file.type === "application/gpx+xml" ||
    file.name.endsWith(".gpx")
  ) {
    return new GpxWorker();
  } else if (
    file.type === "application/vnd.garmin.tcx+xml" ||
    file.name.endsWith(".tcx")
  ) {
    return new TcxWorker();
  } else if (
    file.type === "application/geopackage+sqlite3" ||
    file.name.endsWith(".gpkg")
  ) {
    return new GeopackageWorker();
  } else if (file.name.endsWith(".fgb")) {
    return new FlatgeobufWorker();
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
      return {
        title: "Data has no feature",
        description: fileName,
        icon: "i-heroicons-x-mark",
      };
    }
    geojsonGeomType = geojsonObj.features[0].geometry.type;
  } else {
    geojsonGeomType = geojsonObj.type;
  }
  const typeAndStyle = getGeomTypeAndStyle(geojsonGeomType);
  if (!typeAndStyle) {
    return {
      title: "Data with mixed geometry per feature is not supported",
      description: fileName,
      icon: "i-heroicons-x-mark",
    };
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

const handleFileUpload = async () => {
  if (!window.Worker) {
    toast.add({
      title: "Feature not supported in this browser",
      description: "Please use browser that supports Web Worker",
      icon: "i-heroicons-x-mark",
    });
    return;
  }

  const worker = getWorker(selectedFile.value!);
  if (!worker) {
    toast.add({
      title: "Unable to identify selected file",
      icon: "i-heroicons-x-mark",
    });
    return;
  }

  worker.onerror = (e: ErrorEvent) => {
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
      let toastErr;
      try {
        const result = e.data.data;
        if (Array.isArray(result)) {
          for (let i = 0; i < result.length; i++) {
            const data = result[i];
            toastErr = await addToIDBAndLayerList(
              data.fileName || `${selectedFile.value!.name}_${i}`,
              data.geojsonObj,
              data.bounds
            );
            if (toastErr) break;
          }
        } else {
          toastErr = await addToIDBAndLayerList(
            selectedFile.value!.name,
            result.geojsonObj,
            result.bounds
          );
        }
      } catch (error) {
        console.error(error);
        toastErr = {
          title: "An error occurred when attempting to input processed file",
          icon: "i-heroicons-x-mark",
        };
      }
      emit("handleSuccess");
      toast.add(
        toastErr ?? {
          title: "File has been processed successfully",
          icon: "i-heroicons-check-circle",
        }
      );
    }
    worker.terminate();
  };
  worker.postMessage(selectedFile.value);
};
const handleBack = () => {
  if (selectedTab.value !== 0) {
    changeTab(selectedTab.value - 1);
  }
};
const handleNext = () => {
  if (selectedTab.value !== 1) {
    changeTab(selectedTab.value + 1);
  } else {
    if (selectedFile.value) {
      handleFileUpload();
    }
  }
};
</script>

<template>
  <div class="h-full flex flex-col gap-4 max-h-[calc(100%-2.25rem)]">
    <div
      class="w-full h-full border border-neutral-700 py-10 px-5 overflow-y-auto"
    >
      <div class="m-auto max-w-2xl">
        <TabGroup :selectedIndex="selectedTab" @change="changeTab">
          <TabList class="flex gap-3 justify-evenly mb-3">
            <Tab
              :disabled="!formatType"
              v-for="(item, index) in [
                { step: 1, title: 'Select Data Type' },
                { step: 2, title: 'Select Data' },
              ]"
              v-slot="{ selected }"
              class="flex flex-col flex-1 text-neutral-200"
            >
              <p>{{ item.step }}</p>
              <p>{{ item.title }}</p>
              <div
                :class="[
                  selected ? 'bg-brand-500' : 'bg-neutral-400',
                  'h-[2px] w-full rounded-lg mt-2',
                ]"
              />
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel class="space-y-3">
              <p class="text-sm text-neutral-400">Load To</p>
              <div class="py-2">
                <p class="text-neutral-50">Loaded Data</p>
                <p class="text-xs text-neutral-400">
                  The dataset you load from your local storage will
                  automatically be displayed and categorized in the Loaded Data
                  Catalogue.
                </p>
              </div>
              <div class="flex flex-col gap-3">
                <p class="text-sm text-neutral-400">Data Format</p>
                <div class="grid grid-cols-3 text-neutral-400">
                  <button
                    v-for="item in [
                      { format: 'geojson' },
                      { format: 'csv' },
                      { format: 'xls' },
                      { format: 'kml' },
                    ]"
                    @click="
                      () => {
                        formatType = item.format;
                      }
                    "
                  >
                    {{ item.format }}
                  </button>
                </div>
              </div>
            </TabPanel>
            <TabPanel class="space-y-3">
              <p class="text-sm text-neutral-400">Select Data</p>
              <MapManagementCatalogueLoadFileInput
                :selectedFile="selectedFile"
                :sortOrder="sortOrder"
                @set-selected-file="
                  (value: File|null) => {
                    selectedFile = value;
                  }
                "
                @handle-success="
                  () => {
                    emit('handleSuccess');
                  }
                "
              />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
    <div class="flex justify-between">
      <UButton
        @click="cancel"
        :ui="{ rounded: 'rounded-xs' }"
        label="Cancel"
        variant="outline"
        color="brand"
        class="w-44 text-sm justify-center"
      >
      </UButton>
      <div class="space-x-2">
        <UButton
          :disabled="selectedTab === 0"
          @click="handleBack"
          :ui="{ rounded: 'rounded-xs' }"
          label="Back"
          variant="outline"
          :color="selectedTab === 0 ? 'neutral' : 'brand'"
          class="w-44 text-sm justify-center"
        >
        </UButton>
        <UButton
          :disabled="(selectedTab === 1 && !selectedFile) || !formatType"
          @click="handleNext"
          :ui="{ rounded: 'rounded-xs' }"
          label="Next"
          :color="
            (selectedTab === 1 && !selectedFile) || !formatType
              ? 'neutral'
              : 'brand'
          "
          class="w-44 text-sm justify-center"
        >
        </UButton>
      </div>
    </div>
  </div>
</template>
