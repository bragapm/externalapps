<script setup lang="ts">
import type { Attachment } from "~/utils/types";

const featureStore = useFeature();
const { feature } = storeToRefs(featureStore);

const isLoading = ref(false);
const detail = ref<{ markdown: string; attachments: Attachment[] }>({
  markdown: "",
  attachments: [],
});

watchEffect(async () => {
  if (feature.value)
    try {
      isLoading.value = true;
      const res = await $fetch(
        `/panel/feature-detail/${feature.value.tableName}/${feature.value.rowId}`
      );
      detail.value = res as any;
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
    <MapMarkdownRenderer
      v-else-if="Boolean(detail.markdown)"
      :source="detail.markdown"
    />
    <ul class="mt-3 space-y-3" v-if="detail.attachments.length">
      <p class="text-white text-sm">Attachment</p>
      <MapAttachmentLink
        v-for="attachment in detail.attachments"
        :title="attachment.title"
        :description="attachment.description"
        :url="attachment.url"
        :icon="attachment.icon"
      />
    </ul>
  </div>
</template>
