<script setup lang="ts">
defineProps<{
  fetchingListedLayers: boolean;
  uploadMode: boolean;
}>();

const mapLayerStore = useMapLayer();

const handleScroll = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};
</script>

<template>
  <div class="flex-1 overflow-scroll">
    <div v-if="!uploadMode" class="flex flex-col gap-2 p-2">
      <span>
        <h2 class="text-xs text-grey-400">Default Catalogue</h2>
        <p class="text-2xs text-grey-500">
          Dataset Folder/Project Provided by Default
        </p>
      </span>
      <USkeleton
        v-if="fetchingListedLayers"
        v-for="i of [0, 1, 2, 3, 4]"
        :key="i"
        :ui="{ rounded: 'rounded-xxs', background: 'bg-gray-800' }"
        class="w-full h-7"
      />
      <UButton
        v-else
        v-for="category of mapLayerStore.groupedLayerList"
        :key="category.label"
        :ui="{ rounded: 'rounded-xxs' }"
        :label="category.label"
        variant="ghost"
        color="grey"
        @click="
          () => {
            handleScroll(category.label.split(' ').join(''));
          }
        "
        class="text-xs"
      />
    </div>
    <div v-if="!uploadMode" class="border-t border-grey-700 mx-2" />
    <div class="flex flex-col gap-2 p-2">
      <span>
        <h2 class="text-xs text-grey-400">User’s Catalogue</h2>
        <p class="text-2xs text-grey-500">
          Dataset Folder/Project Uploaded by User
        </p>
        <!-- TODO separation for loaded_geojson source -->
      </span>
    </div>
  </div>
</template>
