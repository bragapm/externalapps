<script lang="ts" setup>
const store = useMapLayer();
const { activeMapLayer } = storeToRefs(store);
</script>

<template>
  <template
    v-if="activeMapLayer"
    v-for="item in activeMapLayer"
    :key="item.layer_name"
  >
    <MapLayerVector :item="item" />
  </template>
</template>
