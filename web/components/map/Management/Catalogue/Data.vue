<script setup lang="ts">
defineProps<{
  uploadMode: boolean;
  filteredLayers: LayerGroupedByCategory[];
  filteredLocalLayers: LayerGroupedByCategory[];
}>();
</script>

<template>
  <div
    class="flex flex-col w-full h-full border border-neutral-700 border-t-0 border-l-0 rounded-br-xs overflow-y-auto divide-y divide-neutral-700"
  >
    <div class="divide-y divide-neutral-700">
      <div class="py-4 px-3">
        <p class="text-neutral-400">Default Catalogue</p>
        <p class="text-neutral-500 text-2xs">
          Dataset Folder/Project Provided by Default
        </p>
      </div>
      <div class="px-3 pb-3 divide-y divide-neutral-700">
        <template v-if="!uploadMode" v-for="category of filteredLayers">
          <MapManagementCatalogueGroup :groupItem="category" />
        </template>
      </div>
    </div>
    <div class="divide-y divide-neutral-700">
      <div class="py-4 px-3">
        <p class="text-neutral-400">User’s Catalogue</p>
        <p class="text-neutral-500 text-2xs">
          Dataset Folder/Project Uploaded by User
        </p>
      </div>
      <div class="px-3 pb-3 divide-y divide-neutral-700">
        <template v-if="!uploadMode" v-for="category of filteredLocalLayers">
          <MapManagementCatalogueGroup :groupItem="category" />
        </template>
      </div>
    </div>
    <!-- <template v-if="uploadMode" v-for="category of filteredLayers">
      <div
        class="flex flex-col p-3 gap-1"
        :id="category.label.split(' ').join('')"
      >
        <h3 class="text-neutral-50">
          {{ category.label }}
        </h3>
        <p class="text-xs text-neutral-50">description</p>
        <span class="flex items-center gap-3 text-neutral-400 text-xs">
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
      class="flex flex-col w-full h-full border border-neutral-700 border-t-0 border-l-0 rounded-br-xs overflow-y-auto divide-y"
    >
      <div
        class="flex items-center justify-center text-neutral-400 text-sm w-full h-full"
      >
        No Data Layers Found
      </div>
    </div>
  </div>
</template>
