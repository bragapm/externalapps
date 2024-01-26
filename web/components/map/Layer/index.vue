<script lang="ts" setup>
const store = useMapLayer();
const groupList = computed(() => store.getGroupLayerList);
// console.log(groupList.value);
</script>

<template>
  <template
    v-if="groupList"
    v-for="groupItem in groupList"
    :key="groupItem.label"
  >
    <template v-for="layerItem in groupItem.layerLists">
      <MapLayerVector :item="layerItem" />
    </template>
  </template>
</template>
