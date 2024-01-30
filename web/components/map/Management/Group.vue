<script setup lang="ts">
import type { RasterTiles, VectorTiles } from "~/utils/types";

const props = defineProps<{
  layerLists: (VectorTiles | RasterTiles)[];
}>();
</script>

<template>
  <div class="flex flex-col gap-2">
    <template
      v-for="item in props.layerLists"
      :key="item.layer_name"
      class="space-y-2"
    >
      <MapManagementLayerVector
        v-if="item.source === 'vector_tiles'"
        :layerItem="(item as VectorTiles)"
      />
      <MapManagementLayerRaster
        v-else-if="item.source === 'raster_tiles'"
        :layerItem="(item as RasterTiles)"
      />
    </template>
  </div>
</template>
