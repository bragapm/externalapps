<script setup lang="ts">
import type { MapData } from "~/utils/types";

const { pending: isLoad, data: mapData } = await useFetch<MapData>(
  "/panel/items/map/eng",
  {
    key: "map",
  }
);
</script>

<template>
  <h2 class="text-white p-3">Map Information</h2>
  <hr class="mx-3" />
  <div class="flex-1 overflow-scroll px-3 my-3">
    <div v-if="isLoad" class="px-3 my-3 text-white">Loading ...</div>
    <MapMarkdownRenderer v-else :source="mapData?.data.information" />
  </div>
</template>
