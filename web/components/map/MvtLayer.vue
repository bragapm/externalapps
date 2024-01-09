<script setup lang="ts">
import { Map } from "maplibre-gl";
import type { Raw } from "vue";

const props = defineProps<{
  mapRef: null | Raw<Map>;
}>();

watchEffect(async () => {
  if (props.mapRef) {
    if (!props.mapRef.getSource("mapillary")) {
      props.mapRef.addSource("mapillary", {
        type: "vector",
        tiles: [
          "https://tiles.mapillary.com/maps/vtp/mly1_public/2/{z}/{x}/{y}?access_token=MLY|4142433049200173|72206abe5035850d6743b23a49c41333",
        ],
        minzoom: 6,
        maxzoom: 14,
      });
      props.mapRef.addLayer({
        id: "mapillary", // Layer ID
        type: "line",
        source: "mapillary", // ID of the tile source created above
        // Source has several layers. We visualize the one with name 'sequence'.
        "source-layer": "sequence",
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-opacity": 0.6,
          "line-color": "rgb(53, 175, 109)",
          "line-width": 2,
        },
      });
    }
  }
});
</script>

<template></template>
