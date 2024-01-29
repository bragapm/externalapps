<script setup lang="ts">
import bbox from "@turf/bbox";
import type { LngLatBoundsLike } from "maplibre-gl";
import type { RasterTiles } from "~/utils/types";

const store = useMapRef();
const { map } = storeToRefs(store);

const props = defineProps<{
  item: RasterTiles;
}>();

watchEffect(async () => {
  if (map?.value) {
    if (!map.value.getSource(props.item.layer_id)) {
      map.value.addSource(props.item.layer_id, {
        type: "raster",
        tiles: [
          `${window.location.origin}/panel/raster-tiles/${props.item.layer_id}?z={z}&x={x}&y={y}`,
        ],
        tileSize: 256,
        bounds: bbox(props.item.bounds) as [number, number, number, number],
        minzoom: props.item.minzoom || 5,
        maxzoom: props.item.maxzoom || 15,
      });
      map.value.addLayer({
        id: props.item.layer_id,
        type: "raster",
        source: props.item.layer_id,
      });
    }
  }
});
</script>

<template></template>
