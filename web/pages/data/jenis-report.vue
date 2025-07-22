<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

import { ref, h } from "vue";
import type { Table, Row } from "@tanstack/vue-table";
import { UCheckbox } from "#components";

const searchTerm = ref("");

const openFilterPanel = () => {
  // logic to open filter slideover or dropdown
};

const exportCSV = () => {
  // logic to download CSV
};

interface StatusData {
  id: number;
  reportType: string;
  isActive: boolean;
}

const page = ref(1);
const pageSize = ref("10");
const startDate = ref();
const endDate = ref();
const search = ref("");
const currentQueryParams = ref<Record<string, string>>();

function handleDateUpdate(startDateInput?: string, endDateInput?: string) {
  startDate.value = startDateInput ?? null;
  endDate.value = endDateInput ?? null;
}

const statusData = ref<StatusData[]>([
  { id: 1, reportType: "Collaboration", isActive: true },
  { id: 2, reportType: "Environment", isActive: false },
  { id: 3, reportType: "Environment", isActive: true },
]);

const statusColumns = [
  {
    id: "select",
    header: ({ table }: { table: Table<StatusData> }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : table.getIsAllPageRowsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Select all",
      }),
    cell: ({ row }: { row: Row<StatusData> }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        "aria-label": "Select row",
      }),
  },
  {
    accessorKey: "reportType",
    header: "Jenis Report",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }: { row: Row<StatusData> }) => {
      const isActive = row.getValue("isActive") as boolean;

      return h("div", { class: "flex items-center gap-2" }, [
        h(
          "button",
          {
            class: `relative w-10 h-5 rounded-full transition duration-300 ${
              isActive ? "bg-red-600" : "bg-gray-500"
            }`,
            onClick: () => {
              row.original.isActive = !row.original.isActive;
            },
          },
          [
            h("div", {
              class: `bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                isActive ? "translate-x-5" : ""
              }`,
            }),
          ]
        ),
        h("span", { class: "text-sm" }, isActive ? "Aktif" : "Tidak Aktif"),
      ]);
    },
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: () =>
      h("div", { class: "flex gap-2 items-center" }, [
        h("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          class: "w-4 h-4 text-gray-600 cursor-pointer hover:text-gray-800",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          innerHTML: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>`,
          title: "View",
        }),
        h("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          class: "w-4 h-4 text-gray-600 cursor-pointer hover:text-gray-800",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          innerHTML: `<circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>`,
          title: "More actions",
        }),
      ]),
  },
] as any;
</script>

<template>
  <div class="p-6 bg-white rounded-lg shadow space-y-4">
    <DashboardFilterTableHeader
      @filterClick="openFilterPanel"
      @downloadClick="exportCSV"
      @updateSearch="(val) => (searchTerm = val)"
    >
      <template #slideover-button>
        <USlideover
          title="Tambah Jenis Report"
          :ui="{
            content: 'w-full max-w-[40vw] m-9 rounded-lg ',
            body: 'flex-1 overflow-y-auto relative',
            title: 'text-sm font-semibold text-gray-900',
          }"
        >
          <UButton
            icon="i-heroicons-plus"
            label="Tambah Jenis Report"
            class="text-sm"
            size="lg"
          />

          <template #body>
            <div class="flex flex-col h-full">
              <div class="flex-1 overflow-y-auto space-y-2">
                <UFormField label="Jenis Report">
                  <UInput size="lg" class="w-full" />
                </UFormField>
              </div>

              <div class="absolute left-6 right-6 bottom-6 pt-4 mt-4 space-y-4">
                <UButton
                  color="primary"
                  size="xl"
                  class="w-full justify-center flex"
                >
                  Simpan
                </UButton>

                <UButton
                  size="xl"
                  class="w-full justify-center flex"
                  variant="outline"
                >
                  Batal
                </UButton>
              </div>
            </div>
          </template>
        </USlideover>
      </template>
    </DashboardFilterTableHeader>
    <DashboardTable
      :data="statusData"
      :columns="statusColumns"
      :totalData="statusData.length"
      v-model:page="page"
      v-model:pageSize="pageSize"
    />
  </div>
</template>
