<script lang="ts" setup>
import IcTrash from "~/assets/icons/ic-trash.svg";
import IcLayerPlus from "~/assets/icons/ic-layer-plus.svg";
import type { Queue } from "~/utils/types";

const props = withDefaults(
  defineProps<{
    data: Queue;
    isAddLayerAction: boolean;
  }>(),
  {
    isAddLayerAction: false,
  }
);
</script>

<template>
  <div>
    <div
      class="p-2 bg-grey-800 rounded-xxs flex gap-2 justify-between items-center"
    >
      <div class="text-2xs">
        <p class="text-grey-400">{{ data.message.kwargs.output_table }}</p>
        <p class="text-grey-500">01</p>
      </div>
      <div class="space-x-1">
        <button v-if="isAddLayerAction">
          <IcLayerPlus class="text-grey-400 w-3 h-3" :fontControlled="false" />
        </button>
        <button>
          <IcTrash class="text-brand-500 w-3 h-3" :fontControlled="false" />
        </button>
      </div>
    </div>
    <div class="p-2 border border-grey-700 rounded-xxs space-y-2">
      <div class="text-2xs">
        <p class="text-grey-500">Queue ID</p>
        <p class="text-grey-50">{{ data.message_id }}</p>
      </div>
      <div class="text-2xs">
        <p class="text-grey-500">Initiator</p>
        <p class="text-grey-50">
          {{
            data.uploader
              ? data.uploader.first_name + " " + data.uploader.last_name
              : "-"
          }}
        </p>
      </div>
      <div class="text-2xs">
        <p class="text-grey-500">Created at</p>
        <p class="text-grey-50">
          {{ data.mtime ? new Date(data.mtime).toLocaleString() : "-" }}
        </p>
      </div>
      <div class="text-2xs">
        <p class="text-grey-500">Status</p>
        <p class="text-grey-50">{{ data.status ?? data.state }}</p>
      </div>
    </div>
  </div>
</template>
