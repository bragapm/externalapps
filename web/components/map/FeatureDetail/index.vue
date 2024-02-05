<script setup lang="ts">
const featureStore = useFeature();
const { feature } = storeToRefs(featureStore);

const isLoading = ref(false);
const text = ref("");

watchEffect(async () => {
  if (feature.value)
    try {
      isLoading.value = true;
      const { data } = await $fetch<{ data: string }>(
        `/panel/feature-detail/${feature.value.tableName}/${feature.value.rowId}`
      );
      text.value = data;
    } catch (error) {
      return null;
    } finally {
      isLoading.value = false;
    }
});
</script>

<template>
  <h2 class="text-white p-3">Feature Detail</h2>
  <hr class="mx-3" />
  <div class="flex-1 overflow-scroll px-3 my-3">
    <div v-if="isLoading" class="px-3 my-3 text-white">Loading ...</div>
    <MapMarkdownRenderer v-else-if="Boolean(text)" :source="text" />
  </div>
</template>
