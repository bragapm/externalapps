<script setup lang="ts">
import IcCross from "~/assets/icons/ic-cross.svg";
import IcDownload from "~/assets/icons/ic-download.svg";
import IcExpand from "~/assets/icons/ic-expand.svg";
import IcFilter from "~/assets/icons/ic-filter.svg";
import IcShrink from "~/assets/icons/ic-shrink.svg";
import IcSort from "~/assets/icons/ic-sort.svg";
import { useTableData } from "~/stores/use-table-data";
const store = useTableData();
const { toggleTable, toggleFullscreen } = store;
</script>

<template>
  <div class="flex flex-col gap-3 p-6">
    <div class="flex justify-between">
      <h1 class="text-gray-400">Data Table</h1>
      <button
        @click="
          () => {
            toggleTable();
            store.fullscreen && toggleFullscreen();
          }
        "
      >
        <IcCross class="w-4 h-4 text-grey-400" :fontControlled="false" />
      </button>
    </div>
    <hr class="border-b border-grey-700" />
    <div class="flex justify-between items-center gap-3">
      <div class="flex items-center gap-3">
        <button
          class="flex items-center gap-3 p-2 border border-grey-600 rounded-xxs bg-grey-800 text-xs text-grey-200"
        >
          <IcShrink
            class="w-[14px] h-[14px] text-grey-400"
            :fontControlled="false"
          />
          Data Layer Pemetaan Kota
        </button>
        <div class="border-l border-grey-700 h-8"></div>
        <button
          class="flex items-center gap-3 p-2 border border-grey-600 rounded-xxs bg-grey-800 text-xs text-grey-200"
        >
          <IcSort
            class="w-[14px] h-[14px] text-grey-400"
            :fontControlled="false"
          />
          Show All Field
        </button>
        <button
          class="flex items-center gap-3 p-2 border border-grey-600 rounded-xxs bg-grey-800 text-xs text-grey-200"
        >
          <IcFilter
            class="w-[14px] h-[14px] text-grey-400"
            :fontControlled="false"
          />
          Filter
        </button>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="toggleFullscreen"
          class="p-2 border border-grey-600 rounded-xxs bg-grey-800"
        >
          <IcExpand
            class="w-[14px] h-[14px] text-grey-400"
            :fontControlled="false"
          />
        </button>
        <button class="p-2 border border-grey-600 rounded-xxs bg-grey-800">
          <IcDownload
            class="w-[14px] h-[14px] text-grey-400"
            :fontControlled="false"
          />
        </button>
      </div>
    </div>
  </div>
</template>
