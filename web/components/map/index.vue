<script setup lang="ts">
import { Map, NavigationControl } from "maplibre-gl";
import type { Raw } from "vue";
import type { ShallowRef } from "vue";
import { shallowRef, onMounted, onUnmounted, markRaw } from "vue";

useHead({
  link: [
    {
      rel: "stylesheet",
      href: "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css",
    },
  ],
});

const mapContainer: ShallowRef<null | HTMLElement> = shallowRef(null);
const map: ShallowRef<null | Raw<Map>> = shallowRef(null);

onMounted(() => {
  const apiKey = "D7JUUxLv3oK21JM9jscD";

  const initialState = { lng: 107.60981, lat: -6.914744, zoom: 14 };

  map.value = markRaw(
    new Map({
      container: mapContainer.value!,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
    })
  );

  // map.value.addControl(new NavigationControl(), "top-right");
});
onUnmounted(() => {
  map.value?.remove();
});
</script>

<template>
  <div class="map-wrap">
    <a href="https://www.maptiler.com" class="watermark"
      ><img
        src="https://api.maptiler.com/resources/logo.svg"
        alt="MapTiler logo"
    /></a>
    <div class="map" ref="mapContainer"></div>
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
