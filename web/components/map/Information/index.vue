<script setup lang="ts">
import { useMapData } from "~/utils";
import IcArrowLeft from "~/assets/icons/ic-arrow-left.svg";

const { isLoading, data } = await useMapData();

const featureStore = useFeature();
</script>

<template>
  <div class="flex justify-between items-center m-3">
    <h2 class="text-white">Map Information</h2>
    <IcArrowLeft
      role="button"
      @click="featureStore.setRightSidebar('')"
      :fontControlled="false"
      class="w-3 h-3 rotate-180 text-grey-50"
    />
  </div>
  <hr class="mx-3" />
  <div class="flex-1 overflow-scroll px-3 my-3">
    <div v-if="isLoading" class="px-3 my-3 text-white">Loading ...</div>
    <MapMarkdownRenderer v-else :source="data?.data.information" />
    <ul
      class="mt-3 space-y-3"
      v-if="data?.data.information_attachments?.length"
    >
      <MapAttachmentLink
        v-for="attachment in data?.data.information_attachments"
        :title="attachment.title"
        :description="attachment.description"
        :url="attachment.url"
        :icon="attachment.icon"
      />
    </ul>
  </div>
</template>
