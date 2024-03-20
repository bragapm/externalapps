<script setup lang="ts">
defineProps<{
  uploadMode: boolean;
  filteredLayers: LayerGroupedByCategory[];
  filteredLocalLayers: LayerGroupedByCategory[];
}>();
</script>

<template>
  <div
    class="flex flex-col w-full h-full border border-grey-700 border-t-0 border-l-0 rounded-br-xs overflow-y-auto divide-y divide-grey-700"
  >
    <template v-if="!uploadMode" v-for="category of filteredLayers">
      <MapManagementCatalogueGroup :groupItem="category" />
    </template>
    <template v-if="!uploadMode" v-for="category of filteredLocalLayers">
      <MapManagementCatalogueGroup :groupItem="category" />
    </template>
    <!-- <template v-if="uploadMode" v-for="category of filteredLayers">
      <div
        class="flex flex-col p-3 gap-1"
        :id="category.label.split(' ').join('')"
      >
        <h3 class="text-grey-50">
          {{ category.label }}
        </h3>
        <p class="text-xs text-grey-50">description</p>
        <span class="flex items-center gap-3 text-grey-400 text-xs">
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
          />
          <MapManagementCatalogueUploadCard />
        </div>
      </div>
    </template>
    <div v-if="uploadMode" class="p-3">
      <MapManagementCatalogueAddFolderCard />
    </div> -->
    <div
      v-if="filteredLayers.length === 0"
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
