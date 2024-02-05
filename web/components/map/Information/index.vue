<script setup lang="ts">
import { useMapData } from "~/utils";
const { isLoading, data } = await useMapData();
</script>

<template>
  <h2 class="text-white p-3">Map Information</h2>
  <hr class="mx-3" />
  <div class="flex-1 overflow-scroll px-3 my-3">
    <div v-if="isLoading" class="px-3 my-3 text-white">Loading ...</div>
    <MapMarkdownRenderer v-else :source="data?.data.information" />
    <ul class="mt-3 space-y-3">
      <MapAttachmentLink
        v-for="attachment in data?.data.information_attachment"
        :title="attachment.title"
        :description="attachment.description"
        :url="attachment.url"
        :icon="attachment.icon"
      />
    </ul>
  </div>
</template>
