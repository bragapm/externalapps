<script setup lang="ts">
import { Map, GeolocateControl } from "maplibre-gl";
import type { LngLatBoundsLike } from "maplibre-gl";
import type { Raw } from "vue";
import { shallowRef, onMounted, onUnmounted, markRaw } from "vue";
import { useMapData } from "~/utils";
import bbox from "@turf/bbox";

const { isLoading, data: mapData } = await useMapData();
useHead({
  link: [
    {
      rel: "stylesheet",
      href: "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css",
    },
  ],
});

const mapContainer = shallowRef<null | HTMLElement>(null);
const map = shallowRef<null | Raw<Map>>(null);
const geolocate = shallowRef<null | Raw<GeolocateControl>>(null);
const store = useMapRef();
const { setMapLoad, setMapRef, setGeolocateRef } = store;

//map init
onMounted(() => {
  setMapLoad(false);
  const apiKey = "D7JUUxLv3oK21JM9jscD";

  map.value = markRaw(
    new Map({
      container: mapContainer.value!,
      style: `https://api.maptiler.com/maps/satellite/style.json?key=${apiKey}`,
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
  });
});
onUnmounted(() => {
  setMapLoad(false);
  setMapRef(null);
  setGeolocateRef(null);
  map.value?.remove();
});

// get layer list
const layerStore = useMapLayer();
const { fetchVectorTiles } = layerStore;
fetchVectorTiles();
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
    <ClientOnly fallback-tag="p" fallback=""> <MapPopup /></ClientOnly>
  </div>
</template>

<style scoped>
/* @import "~maplibre-gl/dist/maplibre-gl.css"; */
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
