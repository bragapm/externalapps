<script lang="ts" setup>
const store = useMapLayer();
</script>

<template>
  <template
    v-if="store.groupLayerList"
    v-for="groupItem in store.groupLayerList"
    :key="groupItem.label"
  >
    <template v-for="layerItem in groupItem.layerLists">
      <MapLayerVector :item="layerItem" />
    </template>
  </template>
</template>
