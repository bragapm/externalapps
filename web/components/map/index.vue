<script setup lang="ts">
import { Map, GeolocateControl } from "maplibre-gl";
import type { LngLatBoundsLike, StyleSpecification } from "maplibre-gl";
import type { Raw } from "vue";
import { shallowRef, onMounted, onUnmounted, markRaw } from "vue";
import { addHighlightLayer, useMapData } from "~/utils";
import bbox from "@turf/bbox";

const { isLoading, data: mapData } = await useMapData();

const mapContainer = shallowRef<null | HTMLElement>(null);
const map = shallowRef<null | Raw<Map>>(null);
const geolocate = shallowRef<null | Raw<GeolocateControl>>(null);
const store = useMapRef();
const { setMapLoad, setMapRef, setGeolocateRef } = store;
const { data: generalSettingsData } = await useGeneralSettings();

//map init
onMounted(async () => {
  setMapLoad(false);
  const apiKey = "D7JUUxLv3oK21JM9jscD";
  const style: StyleSpecification = await $fetch(
    `https://api.maptiler.com/maps/satellite/style.json?key=${apiKey}`
  );
  style.sprite = window.location.origin + "/panel/sprites/sprite";

  if (Array.isArray(generalSettingsData.value?.data.basemaps)) {
    for (const basemap of generalSettingsData.value.data.basemaps) {
      if (basemap.type === "raster") {
        const name = `__geodashboard_basemap-${basemap.name}`;
        style.sources[name] = {
          type: "raster",
          tiles: [basemap.url],
          tileSize: basemap.tileSize ?? 512,
        };
        style.layers.push({
          id: name,
          type: "raster",
          source: name,
          layout: { visibility: "none" },
        });
      }
    }
  }

  map.value = markRaw(
    new Map({
      container: mapContainer.value!,
      style,
      bounds: bbox(
        mapData?.value?.data.initial_map_view || [
          [95.01, -11.01], // Southwest coordinates (longitude, latitude)
          [141.02, 6.08], // Northeast coordinates (longitude, latitude)
        ] // Indonesia Bounds
      ) as LngLatBoundsLike,
    })
  );

  geolocate.value = markRaw(
    new GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    })
  );

  setMapRef(map.value);
  setGeolocateRef(geolocate.value);
  map.value.on("load", () => {
    setMapLoad(true);
    map.value!.addImage("pulsing-dot", createPulsingDot(map.value!, 90), {
      pixelRatio: 2,
    });
  });
  map.value.on("style.load", () => {
    addHighlightLayer(map.value!);
  });
});
onUnmounted(() => {
  setMapLoad(false);
  setMapRef(null);
  setGeolocateRef(null);
  map.value?.remove();
});

// get active layer list
const layerStore = useMapLayer();
const { fetchActiveLayers } = layerStore;
fetchActiveLayers();
</script>

<template>
  <div class="map-wrap">
    <!-- <a href="https://www.maptiler.com" class="watermark"
      ><img
        src="https://api.maptiler.com/resources/logo.svg"
        alt="MapTiler logo"
    /></a> -->
    <div class="map" ref="mapContainer"></div>
    <MapLayer v-if="store.mapLoad" />
    <!-- <MapMvtLayer :mapRef="map" v-if="store.mapLoad" /> -->
    <MapPopup />
  </div>
</template>

<style scoped>
@import "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css";
@import "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.4.3/mapbox-gl-draw.css";

.map-wrap {
  position: relative;
  width: 100%;
  height: calc(100vh); /* calculate height of the screen minus the heading */
}

.map {
  position: absolute;
  width: 100%;
  height: 100%;
}

.watermark {
  position: absolute;
  left: 10px;
  bottom: 10px;
  z-index: 999;
}
</style>
