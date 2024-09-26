<script lang="ts" setup>
const emit = defineEmits<{
  onClose: [];
}>();
const toast = useToast();
const layerStore = useMapLayer();
const authStore = useAuth();
const featureStore = useFeature();
const activeLayers = computed(() => {
  return layerStore.groupedActiveLayers
    ?.map(({ layerLists }) => layerLists)
    .flat()
    .filter((el) => el.source === "vector_tiles")
    .map(({ layer_name }: any) => layer_name as string);
});
const selectedLayer = ref<string>();
const overlapLayer = ref<string>();
const outputLayer = ref<string>();

const handleIntersect = async () => {
  const body = {
    input_table: [selectedLayer.value, overlapLayer.value],
    output_table: outputLayer.value,
  };
  try {
    const response = await fetch("/panel/geoprocessing/intersect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.accessToken}`,
      },
      body: JSON.stringify(body),
    });
    const result = await response.json();

    if (result.errors?.length) throw new Error(result.errors[0].message);
    toast.add({
      title: "Success",
      description:
        "Your intersect task has been successfully added to the queue! You'll be notified once processing is complete.",
      icon: "i-heroicons-check-circle",
    });
    featureStore.setRightSidebar("geoprocessing");
    featureStore.setMapInfo("");
    emit("onClose");
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to enqueue the intersect task. Please try again.";
    toast.add({
      title: message,
      icon: "i-heroicons-x-mark",
    });
  }
};
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
        placeholder="Select layer"
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
        placeholder="Select layer"
      />
    </div>
    <div class="space-y-1">
      <p class="text-2xs text-white">Output Feature Class Name</p>
      <UInput
        v-model="outputLayer"
        color="gray"
        :ui="{ rounded: 'rounded-xxs' }"
        size="2xs"
      >
      </UInput>
    </div>
  </div>
  <div class="p-2">
    <UButton
      @click="handleIntersect"
      color="brand"
      :ui="{ rounded: 'rounded-[4px]' }"
      class="w-full justify-center text-sm"
      :loading="false"
      >Apply Intersect</UButton
    >
  </div>
</template>
