<script lang="ts" setup>
import type { GeoJSONSource, MapLayerTouchEvent } from "maplibre-gl";
import buffer from "@turf/buffer";
import { convertLength, type Units } from "@turf/helpers";
import { useQuery } from "@tanstack/vue-query";
import type { HeaderData } from "../Management/Table.vue";

const mapStore = useMapRef();
const { map } = mapStore;
const toast = useToast();

const points = ref<[string, number, number][]>([]);
const addLocation = (event: MapLayerTouchEvent) => {
  if (map) {
    const features = points.value.map(
      (item) =>
        ({
          type: "Feature",
          properties: { ogc_fid: item[0] },
          geometry: {
            type: "Point",
            coordinates: [item[1], item[2]],
          },
        } as GeoJSON.Feature)
    );

    const ogc_fid = crypto.randomUUID(),
      coordinates = event.lngLat.toArray();
    features.push({
      type: "Feature",
      properties: { ogc_fid },
      geometry: {
        type: "Point",
        coordinates,
      },
    });
    points.value = [...points.value, [ogc_fid, ...coordinates]];

    (map.getSource("buffer-points") as GeoJSONSource).setData({
      type: "FeatureCollection",
      features,
    });
  } else {
    toast.add({
      title: "Map is not ready",
      description: "Please try again in a while",
      icon: "i-heroicons-information-circle",
      timeout: 1500,
    });
  }
};

onMounted(() => {
  if (map) {
    map.on("click", addLocation);
    map.getCanvasContainer().style.cursor = "crosshair";

    map.addSource("buffer-points", {
      type: "geojson",
      data: emptyFeatureCollection,
    });
    map.addLayer({
      type: "circle",
      source: "buffer-points",
      id: "buffer-points",
      paint: { "circle-color": "white", "circle-radius": 5 },
    });

    map.addSource("buffer-polygon", {
      type: "geojson",
      data: emptyFeatureCollection,
    });
    map.addLayer(
      {
        type: "fill",
        source: "buffer-polygon",
        id: "buffer-polygon",
        paint: { "fill-opacity": 0.75 },
      },
      "buffer-points"
    );
  }
});

onUnmounted(() => {
  if (map) {
    map.off("click", addLocation);
    map.getCanvasContainer().style.cursor = "";

    if (map.getSource("buffer-points")) {
      map.removeLayer("buffer-points");
      map.removeSource("buffer-points");
    }
    if (map.getSource("buffer-polygon")) {
      map.removeLayer("buffer-polygon");
      map.removeSource("buffer-polygon");
    }
  }
});

const digit = ref("0");
const units = [
  "kilometers",
  "meters",
  "miles",
  "feet",
  "yards",
  "inches",
  "nauticalmiles",
  "centimeters",
];
const unit = ref(units[0]);
const colour = ref("#ffffff");

const handleBuffer = () => {
  const features = points.value.map(
    (item) =>
      ({
        type: "Feature",
        properties: { ogc_fid: item[0] },
        geometry: {
          type: "Point",
          coordinates: [item[1], item[2]],
        },
      } as GeoJSON.Feature)
  );
  const result = buffer(
    {
      type: "FeatureCollection",
      features,
    },
    +digit.value,
    { units: unit.value as any, steps: 60 }
  );
  map!.setPaintProperty("buffer-polygon", "fill-color", colour.value);
  (map!.getSource("buffer-polygon") as GeoJSONSource).setData(result);
};

const layerStore = useMapLayer();
const activeLayers = computed(() => {
  return layerStore.groupedActiveLayers
    ?.map(({ layerLists }) => layerLists)
    .flat()
    .filter((el) => el.source === "vector_tiles")
    .map(({ layer_name }: any) => layer_name as string);
});
const selectedLayer = ref<string>();

const enabled = computed(() => !!selectedLayer.value);
const {
  data: headerData,
  error: headerError,
  isFetching: isHeaderFetching,
  isError: isHeaderError,
} = useQuery({
  queryKey: [`/panel/vector-tiles-attribute-table-header/`, selectedLayer],
  queryFn: ({ queryKey }) =>
    $fetch<{
      data: HeaderData[];
    }>(queryKey[0] + queryKey[1]!).then((r) => r.data),
  enabled,
});
const columns = computed<
  {
    value: string;
    name: string;
  }[]
>(() => {
  if (headerData.value) {
    return headerData.value
      .filter((el) => el.type !== "geometry")
      .map((el: HeaderData) => ({
        value: el.field,
        name: capitalizeEachWords(el.field),
      }));
  } else return [];
});
const selectedType = ref("simple");
const selectedColumn = ref<{
  value: string;
  name: string;
}>();

watch(selectedLayer, () => {
  selectedColumn.value = undefined;
});

const authStore = useAuth();
const featureStore = useFeature();
const analysisStore = useAnalysisResult();
const isAnalyze = ref(false);
const handleIntersect = async () => {
  const payload = {
    points: points.value.map(([_, lng, lat]) => [lng, lat]),
    radius: convertLength(+digit.value, unit.value as Units, "meters"),
    layer: selectedLayer.value,
    type: selectedType.value,
    column: selectedColumn.value,
  };
  try {
    isAnalyze.value = true;
    const result = await $fetch<{ category: string; count: string }[]>(
      "/panel/buffer",
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + authStore.accessToken,
        },
      }
    );
    analysisStore.addResult({
      date: new Date().toLocaleString(),
      description: `${digit.value} ${unit.value} from ${points.value.length} points`,
      layer: selectedLayer.value!,
      result,
    });
    featureStore.setMapInfo("analytic");
  } catch (error) {
    toast.add({
      title: "Buffer analysis failed",
      description: "Something wrong, try again later",
      icon: "i-heroicons-information-circle",
      timeout: 1500,
    });
  } finally {
    isAnalyze.value = false;
  }
};
</script>

<template>
  <div class="p-2 flex flex-col gap-2">
    <p class="text-2xs text-grey-400">
      <span class="font-bold">Click on the map</span>
      to add a location to points to be buffered.
    </p>
    <div class="text-xs text-grey-400">{{ points.length }} points targeted</div>
    <UDivider
      :ui="{ label: 'text-2xs text-grey-400' }"
      label="Buffer"
      size="2xs"
    />
    <div class="grid grid-cols-3 gap-1">
      <UInput
        v-model="digit"
        color="gray"
        :ui="{ rounded: 'rounded-xxs' }"
        size="2xs"
        type="number"
      >
      </UInput>
      <USelect
        v-model="unit"
        :options="units"
        color="gray"
        :ui="{ rounded: 'rounded-xxs' }"
        size="2xs"
      />
      <UInput
        v-model="colour"
        color="gray"
        :ui="{ rounded: 'rounded-xxs' }"
        size="2xs"
        type="color"
      >
      </UInput>
    </div>
    <UDivider
      :ui="{ label: 'text-2xs text-grey-400' }"
      label="Intersection"
      size="2xs"
    />
    <div class="grid grid-cols-3 gap-1">
      <USelect
        v-model="selectedLayer"
        :options="activeLayers"
        color="gray"
        :ui="{ rounded: 'rounded-xxs' }"
        size="2xs"
      /><USelect
        v-model="selectedType"
        :options="['simple', 'categorical']"
        color="gray"
        :ui="{ rounded: 'rounded-xxs' }"
        size="2xs"
      /><USelect
        :disabled="selectedType === 'simple'"
        v-model="selectedColumn"
        :options="columns"
        option-attribute="name"
        color="gray"
        :ui="{ rounded: 'rounded-xxs' }"
        size="2xs"
      />
    </div>
  </div>
  <div class="p-2 grid grid-cols-2 gap-x-3">
    <UButton
      @click="handleBuffer"
      color="brand"
      variant="outline"
      :ui="{ rounded: 'rounded-[4px]' }"
      class="w-full justify-center text-sm"
      >Show Buffer</UButton
    >
    <UButton
      @click="handleIntersect"
      color="brand"
      :ui="{ rounded: 'rounded-[4px]' }"
      class="w-full justify-center text-sm"
      :loading="isAnalyze"
      >Do Intersect</UButton
    >
  </div>
</template>
