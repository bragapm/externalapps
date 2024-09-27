<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";

const authStore = useAuth();

const {
  data: historyData,
} = useQuery({
  queryKey: ["geoprocessing_history_query_key"],
  queryFn: async () => {
    const res = await $fetch<{ data: any }>(
      "/panel/items/geoprocessing_queue?" +
        new URLSearchParams({
          fields: "*,uploader.*",
          sort: "-mtime",
          "filter[state][_eq]": "done",
        }),
      {
        headers: { Authorization: "Bearer " + authStore.accessToken },
      }
    );
    return res.data;
  },
  refetchInterval: 15 * 1000,
});
</script>

<template>
  <div class="space-y-2">
    <div
      v-if="historyData"
      v-for="(item, index) of historyData"
      :key="item.message_id"
    >
      <MapGeoprocessingCard
        :data="item"
        :isAddLayerAction="true"
      />
    </div>
    <div v-else class="text-white text-center mt-5">
      <h4 class="text-sm text-grey-50">No Data</h4>
    </div>
  </div>
</template>
