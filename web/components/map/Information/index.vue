<script setup lang="ts">
import { useMapData } from "~/utils";
const { isLoading, data } = await useMapData();
</script>

<template>
  <h2 class="text-white p-3">Map Information</h2>
  <hr class="mx-3" />
  <div class="flex-1 overflow-scroll px-3 my-3">
    <div v-if="isLoading" class="px-3 my-3 text-white">Loading ...</div>
    <MapMarkdownRenderer v-else :source="data?.data.information" />
  </div>
</template>
