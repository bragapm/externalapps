<script lang="ts" setup>
import marker from "~/assets/images/poi-marker-blue.png";

const store = useMapRef();
const authStore = useAuth();
const { map } = storeToRefs(store);

const sourceName = "poi_layer_source";
const layerId = "poi_circle_layer";

watchEffect(() => {
  if (map.value) {
    if (!map.value.getSource(sourceName)) {
      map.value.addSource(sourceName, {
        type: "geojson",
        data: "https://api.maptiler.com/data/0197c554-8d60-750a-bf0b-16d0aacf6b10/features.json?key=D7JUUxLv3oK21JM9jscD",
        // tiles: [
        //   "https://api.maptiler.com/tiles/cadastre/{z}/{x}/{y}.pbf?key=D7JUUxLv3oK21JM9jscD",
        // ],
        // minzoom: 5,
        // maxzoom: 15,
      });
    }
    if (!map.value.getLayer(layerId)) {
      const markerImg = new Image(28, 28);
      markerImg.src = marker;
      markerImg.onload = () => {
        if (map.value && !map.value.hasImage("poi-marker")) {
          map.value.addImage("poi-marker", markerImg);
        }
      };

      map.value?.addLayer({
        type: "symbol",
        layout: {
          "icon-image": "poi-marker",
          "icon-size": 1.2,
        },
        source: sourceName,
        id: layerId,
      });
    }
  }
});
</script>

<template></template>
