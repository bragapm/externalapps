<script lang="ts" setup>
import { h, ref, resolveComponent } from "vue";
import type { TableColumn, TableRow } from "@nuxt/ui";

const page = ref(1);
const UCheckbox = resolveComponent("UCheckbox");

const props = defineProps<{
  data: Record<string, any>[] | undefined;
  columns: TableColumn<Record<string, any>>[];
  totalData: number | undefined;
  //   modelValue?: Record<string, boolean>;
}>();

const intervalValue = ref<string>("Mingguan");
const intervalOptions = ref(["Harian", "Mingguan", "Bulanan"]);

const table = useTemplateRef("table");

const rowSelection = ref<Record<string, boolean>>({});

function onSelect(row: TableRow<Record<string, any>>, e?: Event) {
  /* If you decide to also select the column you can do this  */
  row.toggleSelected(!row.getIsSelected());
}

//pagination
const pageSizeItems = ref(["5", "10", "20", "50"]);
const pageSize = ref("10");
</script>

<template>
  <div class="flex justify-between gap-2">
    <div class="flex gap-2">
      <UInput type="date" size="xl" />
      <UInput type="date" size="xl" />
      <UButton label="Tampilkan" size="xl" />
    </div>
    <div class="flex gap-2">
      <UInput
        trailing-icon="i-heroicons-magnifying-glass"
        placeholder="Search by"
        size="xl"
      />
      <USelectMenu
        v-model="intervalValue"
        :items="intervalOptions"
        class="w-32"
        :searchInput="false"
      />
      <UButton
        icon="i-heroicons-arrow-down-tray"
        size="xl"
        color="neutral"
        variant="outline"
      />
      <UButton icon="i-heroicons-plus" label="Check In" size="xl" />
    </div>
  </div>
  <USeparator />
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
      v-model:page="page"
      show-edges
      :sibling-count="1"
      :total="totalData"
    />
  </div>
</template>
