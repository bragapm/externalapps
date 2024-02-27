<script setup lang="ts">
import { uncategorizedAlias } from "~/constants";

const props = defineProps<{
  uploadMode: boolean;
  filteredLayers: LayerGroupedByCategory[] | null;
}>();

const mapLayerStore = useMapLayer();
const mapRefStore = useMapRef();

const activeLayers = computed(() => {
  return mapLayerStore.groupedActiveLayers
    ?.map(({ layerLists }) => layerLists)
    .flat();
});

const addLayer = (layerItem: VectorTiles | RasterTiles | ThreeDTiles) => {
  let groupName = layerItem.category
    ? layerItem.category.category_name
    : uncategorizedAlias;

  let groupIndex = mapLayerStore.groupedActiveLayers?.findIndex(
    (el) => el.label === groupName
  );
  if (groupIndex !== -1) {
    mapLayerStore.groupedActiveLayers?.[groupIndex as number].layerLists.push(
      layerItem
    );
  } else {
    if (
      mapLayerStore.groupedActiveLayers?.findIndex(
        (el) => el.label === "Terrain"
      ) !== -1
    ) {
      mapLayerStore.groupedActiveLayers?.splice(-1, 0, {
        label: groupName as string,
        layerLists: [layerItem],
        defaultOpen: false,
      });
      // mapLayerStore.groupedActiveLayers?.push({
      //   label: groupName as string,
      //   layerLists: [layerItem],
      //   defaultOpen: false,
      // });
    } else {
      mapLayerStore.groupedActiveLayers?.push({
        label: groupName as string,
        layerLists: [layerItem],
        defaultOpen: false,
      });
    }
  }
};
const removeLayer = (layerItem: VectorTiles | RasterTiles | ThreeDTiles) => {
  let groupName = layerItem.category
    ? layerItem.category.category_name
    : uncategorizedAlias;
  let groupIndex = mapLayerStore.groupedActiveLayers?.findIndex(
    (el) => el.label === groupName
  );
  let layerIndex = mapLayerStore.groupedActiveLayers?.[
    groupIndex as number
  ].layerLists.findIndex((el) => el.layer_id === layerItem.layer_id);

  if (
    mapLayerStore.groupedActiveLayers?.[groupIndex as number].layerLists
      .length === 1
  ) {
    mapLayerStore.groupedActiveLayers?.splice(groupIndex as number, 1);
  } else {
    mapLayerStore.groupedActiveLayers?.[
      groupIndex as number
    ]?.layerLists.splice(layerIndex as number, 1);
  }

  if (layerItem.source !== "three_d_tiles") {
    mapRefStore.map?.removeLayer(layerItem.layer_id);
  }
};
</script>

<template>
  <div
    class="flex flex-col w-full h-full border border-grey-700 border-t-0 border-l-0 rounded-br-xs overflow-y-auto divide-y divide-grey-700"
  >
    <template
      v-if="!uploadMode"
      v-for="category of filteredLayers
        ? filteredLayers
        : mapLayerStore.groupedLayerList"
    >
      <div
        class="flex flex-col p-3 gap-1"
        :id="category.label.split(' ').join('')"
      >
        <h3 class="text-grey-50">
          {{ category.label }}
        </h3>
        <p class="text-xs text-grey-50">description</p>
        <span class="flex items-center gap-3 text-grey-400 text-xs">
          <!-- <p>Folder by: {{ folder.created_by }}</p>
        <p>Made at: {{ folder.created_at }}</p> -->
          <p>No. of Datasets : {{ category.layerLists.length }}</p>
        </span>
        <div
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-3 gap-3"
        >
          <MapManagementCatalogueItem
            v-for="layer of category.layerLists"
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
            @remove-layer="removeLayer"
          />
        </div>
      </div>
    </template>
    <template
      v-if="uploadMode"
      v-for="category of filteredLayers
        ? filteredLayers
        : mapLayerStore.groupedLayerList"
    >
      <div
        class="flex flex-col p-3 gap-1"
        :id="category.label.split(' ').join('')"
      >
        <h3 class="text-grey-50">
          {{ category.label }}
        </h3>
        <p class="text-xs text-grey-50">description</p>
        <span class="flex items-center gap-3 text-grey-400 text-xs">
          <!-- <p>Folder by: {{ folder.created_by }}</p>
        <p>Made at: {{ folder.created_at }}</p> -->
          <p>No. of Datasets : {{ category.layerLists.length }}</p>
        </span>
        <div
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-3 gap-3"
        >
          <MapManagementCatalogueItem
            v-for="layer of category.layerLists"
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
            @remove-layer="removeLayer"
          />
          <MapManagementCatalogueUploadCard />
        </div>
      </div>
    </template>
    <div v-if="uploadMode" class="p-3">
      <MapManagementCatalogueAddFolderCard />
    </div>
    <div
      v-if="
        mapLayerStore.groupedLayerList?.length === 0 ||
        (filteredLayers && filteredLayers.length === 0)
      "
      class="flex flex-col w-full h-full border border-grey-700 border-t-0 border-l-0 rounded-br-xs overflow-y-auto divide-y"
    >
      <div
        class="flex items-center justify-center text-grey-400 text-sm w-full h-full"
      >
        No Data Layers Found
      </div>
    </div>
  </div>
</template>
