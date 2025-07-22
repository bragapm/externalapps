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

// Define the data structure type
interface LocationData {
  id: number;
  namaDesa: string;
  lokasi: string;
  status: boolean;
  attachment: string;
  aksi: string;
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

const locationData = ref<LocationData[]>([
  {
    id: 1,
    namaDesa: "Saitung, Kusan Tangah, Tanah Bumbu",
    lokasi: "3.5388° S, 115.8699° E",
    status: true,
    attachment: "Dokumen.pdf",
    aksi: "view",
  },
  {
    id: 2,
    namaDesa: "Saitung, Kusan Tangah, Tanah Bumbu",
    lokasi: "3.5388° S, 115.8699° E",
    status: false,
    attachment: "Dokumen.pdf",
    aksi: "view",
  },
  {
    id: 3,
    namaDesa: "Saitung, Kusan Tangah, Tanah Bumbu",
    lokasi: "C3.5388° S, 115.8699° E",
    status: true,
    attachment: "Dokumen.pdf",
    aksi: "view",
  },
]);

const locationColumns = [
  {
    id: "select",
    header: ({ table }: { table: Table<LocationData> }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : table.getIsAllPageRowsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Select all",
      }),
    cell: ({ row }: { row: Row<LocationData> }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        "aria-label": "Select row",
      }),
  },
  {
    accessorKey: "namaDesa",
    header: "Nama Desa",
  },
  {
    accessorKey: "lokasi",
    header: "Lokasi",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: Row<LocationData> }) => {
      const status = row.getValue("status") as boolean;

      return h("div", { class: "flex items-center gap-2" }, [
        h(
          "button",
          {
            class: `relative w-10 h-5 rounded-full transition duration-300 ${
              status ? "bg-red-600" : "bg-gray-500"
            }`,
            onClick: () => {
              row.original.status = !row.original.status;
            },
          },
          [
            h("div", {
              class: `bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                status ? "translate-x-5" : ""
              }`,
            }),
          ]
        ),
        h("span", { class: "text-sm" }, status ? "Aktif" : "Tidak Aktif"),
      ]);
    },
  },
  {
    accessorKey: "attachment",
    header: "Attachment",
    cell: ({ row }: { row: Row<LocationData> }) => {
      const attachment = row.getValue("attachment") as string;

      return h(
        "a",
        {
          href: "#",
          class: "text-blue-600 hover:text-blue-800 underline text-sm",
          onClick: (e: Event) => {
            e.preventDefault();
            // Handle document download/view
            console.log("Opening document:", attachment);
          },
        },
        attachment
      );
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
          title="Tambah Profil Desa"
          :ui="{
            content: 'w-full max-w-[40vw] m-9 rounded-lg ',
            body: 'flex-1 overflow-y-auto relative',
            title: 'text-sm font-semibold text-gray-900',
          }"
        >
          <UButton
            icon="i-heroicons-plus"
            label="Tambah Profil Desa"
            class="text-sm"
            size="lg"
          />

          <template #body>
            <div class="w-full">
              <DataFormProfilDesa />
            </div>
          </template>
        </USlideover>
      </template>
    </DashboardFilterTableHeader>

    <DashboardTable
      :data="locationData"
      :columns="locationColumns"
      :totalData="locationData.length"
      v-model:page="page"
      v-model:pageSize="pageSize"
    />
  </div>
</template>
