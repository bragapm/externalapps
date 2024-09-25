<script lang="ts" setup>
import type { Queue } from "~/utils/types";

const authStore = useAuth();
const toast = useToast();

const queue = ref<Queue[]>([]);

watchEffect((onInvalidate) => {
  if (!authStore.accessToken) return;

  const fetchQueueList = async () => {
    try {
      const response = await $fetch<{ data: any }>(
        "/panel/items/geoprocessing_queue?" +
          new URLSearchParams({
            fields: "*,uploader.*",
            sort: "-mtime",
            "filter[state][_eq]": "done",
          }),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authStore.accessToken}`,
            "Cache-Control": "no-store",
          },
        }
      );
      const result = await response.data;

      queue.value = result.filter((item: any) =>
        ["intersect"].includes(item.message.actor_name)
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error";
      toast.add({
        title: "Error",
        description: message,
      });
    }
  };

  fetchQueueList();
  const interval = setInterval(() => {
    fetchQueueList();
  }, 15000);

  onInvalidate(() => {
    clearInterval(interval);
  });
});
</script>

<template>
  <div class="space-y-2">
    <div
      v-if="queue.length"
      v-for="(item, index) of queue"
      :key="item.message_id"
    >
      <MapGeoprocessingCard :data="item" :isAddLayerAction="true" />
    </div>
    <div v-else class="text-white text-center mt-5">
      <h4 class="text-sm text-grey-50">No Data</h4>
    </div>
  </div>
</template>
