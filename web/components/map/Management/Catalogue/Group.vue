<script lang="ts" setup>
import { uncategorizedAlias } from '~/constants';

defineProps<{
  groupItem: LayerGroupedByCategory;
}>();

const mapLayerStore = useMapLayer();

const activeLayers = computed(() => {
  return mapLayerStore.groupedActiveLayers
    .map(({ layerLists }) => layerLists)
    .flat();
});

const addLayer = (
  layerItem: VectorTiles | RasterTiles | ThreeDTiles | LoadedGeoJson
) => {
  let groupName = layerItem.category?.category_name || uncategorizedAlias;

  let groupIndex = mapLayerStore.groupedActiveLayers.findIndex(
    (el) => el.label === groupName
  );
  if (groupIndex !== -1) {
    mapLayerStore.groupedActiveLayers[groupIndex].layerLists.push(layerItem);
  } else {
    if (
      mapLayerStore.groupedActiveLayers.findIndex(
        (el) => el.label === "Terrain"
      ) !== -1
    ) {
      mapLayerStore.groupedActiveLayers.splice(-1, 0, {
        label: groupName,
        layerLists: [layerItem],
        defaultOpen: false,
      });
      // mapLayerStore.groupedActiveLayers.push({
      //   label: groupName,
      //   layerLists: [layerItem],
      //   defaultOpen: false,
      // });
    } else {
      mapLayerStore.groupedActiveLayers.push({
        label: groupName,
        layerLists: [layerItem],
        defaultOpen: false,
      });
    }
  }
};
</script>

<template>
  <div
    class="flex flex-col p-3 gap-1"
    :id="groupItem.label.split(' ').join('')"
  >
    <h3 class="text-grey-50">
      {{ groupItem.label }}
    </h3>
    <p class="text-xs text-grey-50">description</p>
    <span class="flex items-center gap-3 text-grey-400 text-xs">
      <!-- <p>Folder by: {{ folder.created_by }}</p>
    <p>Made at: {{ folder.created_at }}</p> -->
      <p>No. of Datasets : {{ groupItem.layerLists.length }}</p>
    </span>
    <div
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-3 gap-3"
    >
      <MapManagementCatalogueItem
        v-for="layer of groupItem.layerLists"
        :key="layer.layer_id"
        :item="layer"
        :isActive="
          activeLayers
            ? activeLayers.findIndex(
                (item) => item.layer_id === layer.layer_id
              ) > -1
            : false
        "
        @add-layer="addLayer"
      />
    </div>
  </div>
</template>
