<script lang="ts" setup>
import { provide } from "vue";
const store = useMapLayer();
const beforeId = ref("");
provide(
  "beforeIdProvider",
  computed(() => beforeId.value)
);
const updateBeforeId = (id: string) => {
  beforeId.value = id;
};
</script>

<template>
  <template
    v-if="store.groupedLayerList"
    v-for="groupItem in store.groupedLayerList"
    :key="groupItem.label"
  >
    <template v-for="layerItem in groupItem.layerLists">
      <MapLayerVector
        v-if="layerItem.source === 'vector_tiles'"
        :item="(layerItem as VectorTiles)"
        @update-before-id="updateBeforeId"
      />
      <MapLayerRasterTerrain
        v-else-if="layerItem.source === 'raster_tiles' && layerItem.terrain_rgb"
        :item="(layerItem as RasterTiles)"
      />
      <MapLayerRaster
        v-else-if="layerItem.source === 'raster_tiles'"
        :item="(layerItem as RasterTiles)"
      />
    </template>
  </template>
</template>
