<script lang="ts" setup>
import type { GeoJSONSource, MapLayerTouchEvent } from "maplibre-gl";
import buffer from "@turf/buffer";

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
      title: "Invalid Input Coordinate",
      description: "Please provide correct input coordinate",
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
  "centimeters",
  "millimeters",
  "degrees",
  "radians",
  "feet",
  "inches",
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
    { units: unit.value, steps: 60 }
  );
  map!.setPaintProperty("buffer-polygon", "fill-color", colour.value);
  (map!.getSource("buffer-polygon") as GeoJSONSource).setData(result);
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
      @click="() => {}"
      color="brand"
      :ui="{ rounded: 'rounded-[4px]' }"
      class="w-full justify-center text-sm"
      >Do Intersect</UButton
    >
  </div>
</template>
