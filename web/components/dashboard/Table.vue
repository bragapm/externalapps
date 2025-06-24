<script lang="ts" setup>
import { ref } from "vue";
import type { TableColumn, TableRow } from "@nuxt/ui";

const props = defineProps<{
  data: Record<string, any>[] | undefined;
  columns: TableColumn<Record<string, any>>[];
  totalData: number | undefined;
}>();

const table = useTemplateRef("table");

const rowSelection = ref<Record<string, boolean>>({});

function onSelect(row: TableRow<Record<string, any>>, e?: Event) {
  /* If you decide to also select the column you can do this  */
  row.toggleSelected(!row.getIsSelected());
}

//pagination
const currentPage =  defineModel<number>('page');
const pageSizeItems = ref(["10", "20", "50"]);
const pageSize = defineModel<string>('pageSize');
</script>

<template>
  <div>
    <UTable
      ref="table"
      :ui="{
        th: 'bg-[#E2E1DF]  px-3 py-2 text-left font-medium text-grey-800 text-xs border-b border-gray-300',
        td: 'px-3 py-2 align-middle text-xs text-gray-700 border-b border-gray-100 text-grey-800',
        tr: 'odd:bg-white even:bg-[#F9FAFB]',
      }"
      v-model:row-selection="rowSelection"
      :data="data"
      :columns="columns"
      @select="onSelect"
    />
  </div>
  <div class="flex justify-between items-center gap-2">
    <div class="flex gap-2 items-center">
      <p>Menampilkan</p>
      <USelect
        v-model="pageSize"
        :items="pageSizeItems"
        class="w-16"
        :searchInput="false"
      />
      <p>dari {{ totalData || "0" }} Data Ditemukan</p>
    </div>
    <UPagination
      v-model:page="currentPage"
      show-edges
      :sibling-count="1"
      :total="totalData"
    />
  </div>
</template>
