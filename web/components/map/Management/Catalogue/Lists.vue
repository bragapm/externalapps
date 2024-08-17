<script setup lang="ts">
defineProps<{
  disabled: boolean;
}>();

const mapLayerStore = useMapLayer();

const handleScroll = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};
</script>

<template>
  <div class="flex-1 overflow-y-scroll">
    <div class="flex flex-col gap-2 p-2">
      <span>
        <h2 class="text-xs text-grey-400">Default Catalogue</h2>
        <p class="text-2xs text-grey-500">
          Dataset Folder/Project Provided by Default
        </p>
      </span>
      <UButton
        :disabled="disabled"
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
        class="text-xs text-left"
      />
    </div>
    <div class="border-t border-grey-700 mx-2" />
    <div class="flex flex-col gap-2 p-2">
      <span>
        <h2 class="text-xs text-grey-400">User’s Catalogue</h2>
        <p class="text-2xs text-grey-500">
          Dataset Folder/Project Uploaded by User
        </p>
        <UButton
          :disabled="disabled"
          v-for="category of mapLayerStore.groupedLocalLayers"
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
          class="text-xs w-full"
        />
      </span>
    </div>
  </div>
</template>
