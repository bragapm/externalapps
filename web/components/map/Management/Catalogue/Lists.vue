<script setup lang="ts">

const mapLayerStore = useMapLayer();

const handleScroll = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};
</script>

<template>
  <div class="flex-1 overflow-scroll">
    <div class="flex flex-col gap-2 p-2">
      <span>
        <h2 class="text-xs text-neutral-400">Default Catalogue</h2>
        <p class="text-2xs text-neutral-500">
          Dataset Folder/Project Provided by Default
        </p>
      </span>
      <UButton
        v-for="category of mapLayerStore.groupedLayerList"
        :key="category.label"
        :ui="{ rounded: 'rounded-xxs' }"
        :label="category.label"
        variant="ghost"
        color="neutral"
        @click="
          () => {
            handleScroll(category.label.split(' ').join(''));
          }
        "
        class="text-xs"
      />
    </div>
    <div class="border-t border-neutral-700 mx-2" />
    <div class="flex flex-col gap-2 p-2">
      <span>
        <h2 class="text-xs text-neutral-400">User’s Catalogue</h2>
        <p class="text-2xs text-neutral-500">
          Dataset Folder/Project Uploaded by User
        </p>
        <UButton
          v-for="category of mapLayerStore.groupedLocalLayers"
          :key="category.label"
          :ui="{ rounded: 'rounded-xxs' }"
          :label="category.label"
          variant="ghost"
          color="neutral"
          @click="
            () => {
              handleScroll(category.label.split(' ').join(''));
            }
          "
          class="text-xs w-full"
        />
      </span>
    </div>
  </div>
</template>
