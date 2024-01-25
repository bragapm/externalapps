<script setup lang="ts">
const { pending: isLoad, data: informationData } = await useFetch<any>(
  "/panel/items/map/eng",
  {
    lazy: true,
    server: false,
  }
);

const text = computed(() => {
  const text = informationData?.value?.data.information;
  console.log(text);
  return text;
});
</script>

<template>
  <h2 class="text-white p-3">Map Information</h2>
  <hr class="mx-3" />
  <div class="flex-1 overflow-scroll px-3 my-3">
    <div v-if="isLoad" class="px-3 my-3 text-white">Loading ...</div>
    <MapMarkdownRenderer v-else :source="text" />
  </div>
</template>
