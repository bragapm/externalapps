<script lang="ts" setup>
const layerStore = useMapLayer();
const activeLayers = computed(() => {
  return layerStore.groupedActiveLayers
    ?.map(({ layerLists }) => layerLists)
    .flat()
    .filter((el) => el.source === "vector_tiles")
    .map(({ layer_name }: any) => layer_name as string);
});
const selectedLayer = ref<string>();
const overlapLayer = ref<string>();
const outputLayername = ref<string>();

const handleDifference = () => {};
</script>

<template>
  <div class="p-2 flex flex-col gap-2">
    <div class="space-y-1">
      <p class="text-2xs text-white">Create new features from</p>
      <USelect
        v-model="selectedLayer"
        :options="activeLayers"
        color="gray"
        :ui="{ rounded: 'rounded-xxs' }"
        size="2xs"
      />
    </div>
    <div class="space-y-1">
      <p class="text-2xs text-white">Overlaps with</p>
      <USelect
        v-model="overlapLayer"
        :options="activeLayers"
        color="gray"
        :ui="{ rounded: 'rounded-xxs' }"
        size="2xs"
      />
    </div>
    <div class="space-y-1">
      <p class="text-2xs text-white">Output Feature Class Name</p>
      <UInput
        v-model="outputLayername"
        color="gray"
        :ui="{ rounded: 'rounded-xxs' }"
        size="2xs"
      >
      </UInput>
    </div>
  </div>
  <div class="p-2">
    <UButton
      @click="handleDifference"
      color="brand"
      :ui="{ rounded: 'rounded-[4px]' }"
      class="w-full justify-center text-sm"
      :loading="false"
      >Apply Difference</UButton
    >
  </div>
</template>
