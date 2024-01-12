<script setup lang="ts">
import IcCross from "~/assets/icons/ic-cross.svg";
import IcExpand from "~/assets/icons/ic-expand.svg";
import { useTableData } from "~/stores/use-table-data";
const store = useTableData();
const { toggleTable, toggleFullscreen } = store;
</script>

<template>
  <div class="flex flex-col gap-3 p-6">
    <div class="flex justify-between">
      <h1 class="text-gray-400">Data Table</h1>
      <button @click="toggleTable">
        <IcCross class="w-4 h-4 text-grey-400" :fontControlled="false" />
      </button>
    </div>
    <hr class="border-b border-grey-700" />
    <div class="flex justify-end items-center">
      <button
        @click="toggleFullscreen"
        class="p-2 border border-grey-600 rounded-xxs bg-grey-800"
      >
        <IcExpand
          class="w-[14px] h-[14px] text-grey-400 m-2"
          :fontControlled="false"
        />
      </button>
    </div>
  </div>
</template>
