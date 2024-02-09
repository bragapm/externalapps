<script lang="ts" setup>
const store = useMapLayer();
const renderedLayers = computed(() => {
  return store.groupedActiveLayers?.map(({ layerLists }) => layerLists).flat();
});
</script>

<template>
  <template
    v-if="renderedLayers"
    v-for="(layerItem, index) in renderedLayers"
    :key="layerItem.layer_id"
  >
    <!-- <template v-for="layerItem in groupItem.layerLists"> -->
    <MapLayerVector
      v-if="layerItem.source === 'vector_tiles'"
      :renderedLayers="renderedLayers"
      :order="index"
      :item="(layerItem as VectorTiles)"
    />
    <MapLayerRasterTerrain
      v-else-if="layerItem.source === 'raster_tiles' && layerItem.terrain_rgb"
      :renderedLayers="renderedLayers"
      :order="index"
      :item="(layerItem as RasterTiles)"
    />
    <MapLayerRaster
      v-else-if="layerItem.source === 'raster_tiles'"
      :renderedLayers="renderedLayers"
      :order="index"
      :item="(layerItem as RasterTiles)"
    />
    <!-- </template> -->
  </template>
</template>
