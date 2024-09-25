<script lang="ts" setup>
import type { Queue } from "~/utils/types";

const authStore = useAuth();
const toast = useToast();

function detectStateChanges(prevState: Queue[], nextState: Queue[]): Queue[] {
  const prevStateMap = new Map<string, Queue>();
  const result: Queue[] = [];

  // Create a map from prevState for quick lookup
  for (const obj of prevState) {
    prevStateMap.set(obj.message_id, obj);
  }

  // Iterate over nextState to find objects that changed to "done"
  for (const obj of nextState) {
    const prevObj = prevStateMap.get(obj.message_id);

    if (["done", "rejected"].includes(obj.state)) {
      if (!prevObj || !["done", "rejected"].includes(prevObj.state)) {
        result.push(obj);
      }
    }
  }

  return result;
}
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
            "filter[state][_neq]": "done",
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

      if (queue.value.length) {
        const changedQueue = detectStateChanges(
          queue.value,
          result.filter((item: any) =>
            ["intersect"].includes(item.message.actor_name)
          )
        );
        changedQueue.forEach((item) => {
          if (item.state === "rejected") {
            toast.add({
              title: `Your ${item.message.actor_name} task has been rejected. Please review and try again.`,
              icon: "i-heroicons-x-mark",
            });
          } else {
            if (item.status === "success") {
              toast.add({
                title: `Your ${item.message.actor_name} task has been successfully processed!`,
                icon: "i-heroicons-check-circle",
              });
            } else if (item.status === "error") {
              toast.add({
                title: `There was an error processing your ${item.message.actor_name} task. Please try again.`,
                icon: "i-heroicons-x-mark",
              });
            }
          }
        });
      }

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
      <MapGeoprocessingCard :data="item" />
    </div>
    <div
      v-else
      class="text-white text-center mt-5"
    >
      <h4 class="text-sm text-grey-50">No Data</h4>
    </div>
  </div>
</template>
