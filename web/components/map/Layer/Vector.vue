<script setup lang="ts">
import type { VectorTiles } from "~/utils/types";

const store = useMapRef();
const { map } = storeToRefs(store);

const props = defineProps<{
  item: VectorTiles;
}>();

watchEffect(async () => {
  if (map?.value) {
    if (!map.value.getSource(props.item.layer_name)) {
      map.value.addSource(props.item.layer_name, {
        type: "vector",
        tiles: [
          window.location.origin +
            "/panel/mvt/" +
            props.item.layer_name +
            "?z={z}&x={x}&y={y}",
        ],
        minzoom: 6,
        maxzoom: 14,
      });
      map.value.addLayer({
        id: props.item.layer_name,
        type: "circle",
        source: props.item.layer_name,
        "source-layer": props.item.layer_name,
        layout: {
          visibility: props.item.default ? "visible" : "none",
        },
        paint: {
          "circle-radius": 6,
          "circle-color": "#B42222",
        },
      });
    }
  }
});
</script>

<template></template>
