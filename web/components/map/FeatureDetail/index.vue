<script setup lang="ts">
const featureStore = useFeature();
const { feature } = storeToRefs(featureStore);

const isLoading = ref(false);
const text = ref("");

function injectDataIntoTemplate(
  template: string,
  data: Record<string, string>
) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (match, propName) => {
    // Check if the propName exists in the data object
    if (data.hasOwnProperty(propName)) {
      return data[propName];
    }

    // If no matching property is found, return the original match
    return match;
  });
}

watchEffect(async () => {
  if (feature.value)
    try {
      const [response, resp] = await Promise.all([
        $fetch(
          `/panel/items/${feature.value.tableName}/${feature.value.rowId}`
        ),
        $fetch(
          `/panel/items/vector_tiles?filter[layer_name][_eq]=${feature.value.tableName}&fields[]=feature_detail&limit=1`
        ),
      ]);
      const { geom, ...rest } = (response as any).data;

      // console.log(rest);
      // console.log(resp.data[0].feature_detail);

      text.value = injectDataIntoTemplate(
        (resp as any).data[0].feature_detail,
        rest
      );
    } catch (error) {
      return null;
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
