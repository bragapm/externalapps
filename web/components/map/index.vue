<script setup lang="ts">
import { Map, GeolocateControl } from "maplibre-gl";
import type { LngLatBoundsLike } from "maplibre-gl";
import type { Raw } from "vue";
import { shallowRef, onMounted, onUnmounted, markRaw } from "vue";
import { useMapData } from "~/utils";
import bbox from "@turf/bbox";
import { MapboxOverlay } from "@deck.gl/mapbox/src";
import { ArcLayer } from "@deck.gl/layers";
import { Tile3DLayer } from "@deck.gl/geo-layers";
import { CesiumIonLoader } from "@loaders.gl/3d-tiles";

const AIR_PORTS =
  "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson";

const { isLoading, data: mapData } = await useMapData();

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

    const L1 = new ArcLayer({
      id: "1-3d-layer",
      data: AIR_PORTS,
      dataTransform: ((d: any): unknown[] =>
        d.features.filter((f: any) => f.properties.scalerank < 4)) as any,
      // Styles
      getSourcePosition: (f) => [-0.4531566, 51.4709959], // London
      getTargetPosition: (f: any) => f.geometry.coordinates,
      getSourceColor: [0, 128, 200],
      getTargetColor: [200, 0, 80],
      getWidth: 1,
    });

    const L2 = new Tile3DLayer({
      id: "2-3d-layer",
      data: "https://assets.ion.cesium.com/ap-northeast-1/2456455/tileset.json?v=1",
      loader: CesiumIonLoader,
      loadOptions: {
        "cesium-ion": {
          accessToken:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmMDQ3OGVhYi05NDExLTRjZWMtODI5My1iOTFiZGY1YzE3MGEiLCJpZCI6MTkzNTMxLCJpYXQiOjE3MDY4NTg2ODN9.1tT2FMwj6RzWQydihlhrsiBUNBB98N8DvAmjbDnIn04",
        },
      },
      getPointColor: [200, 200, 200, 100],
    });

    const L3 = new Tile3DLayer({
      id: "3-3d-layer",
      data: "https://assets.ion.cesium.com/ap-northeast-1/2457846/tileset.json?v=1",
      loader: CesiumIonLoader,
      loadOptions: {
        "cesium-ion": {
          accessToken:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmMDQ3OGVhYi05NDExLTRjZWMtODI5My1iOTFiZGY1YzE3MGEiLCJpZCI6MTkzNTMxLCJpYXQiOjE3MDY4NTg2ODN9.1tT2FMwj6RzWQydihlhrsiBUNBB98N8DvAmjbDnIn04",
        },
      },
      getPointColor: [200, 200, 200, 100],
    });

    const deckOverlay = new MapboxOverlay({
      layers: [L1, L2, L3],
    });

    map.value!.addControl(deckOverlay as any);
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
