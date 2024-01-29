<script lang="ts" setup>
const store = useMapLayer();
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
      />
    </template>
  </template>
</template>
