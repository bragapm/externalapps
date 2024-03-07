<script lang="ts" setup>
import { useDrawControl } from "~/utils/useDrawControl";

const { drawer } = useDrawControl({ mode: "draw_line_string" });
</script>

<template>
  <div class="p-2 flex flex-col gap-2">
    <p class="text-2xs text-grey-400">
      Click on the map to start measuring length and Double click to finish.
    </p>
    <div class="flex gap-1">
      <UInput
        color="gray"
        :ui="{ rounded: 'rounded-xxs' }"
        placeholder="0"
        class="w-full"
        size="2xs"
      >
        <template #trailing>
          <span class="text-gray-500 dark:text-gray-400 text-xs"
            >Distance Result (m)</span
          >
        </template>
      </UInput>
      <UButton
        color="grey"
        variant="outline"
        :ui="{ rounded: 'rounded-[4px]' }"
        class="text-2xs p-1 gap-0"
      >
        Meter
      </UButton>
      <UButton
        color="grey"
        variant="outline"
        :ui="{ rounded: 'rounded-[4px]' }"
        class="text-2xs p-1 gap-0"
        >Kilometer</UButton
      >
    </div>
  </div>
  <div class="p-2">
    <UButton
      @click="
        () => {
          drawer?.deleteAll();
          drawer?.changeMode('draw_line_string');
        }
      "
      color="grey"
      variant="outline"
      :ui="{ rounded: 'rounded-[4px]' }"
      class="w-full justify-center text-sm"
      >Reset</UButton
    >
  </div>
</template>
