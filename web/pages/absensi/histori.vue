<script lang="ts" setup>
definePageMeta({
  middleware: "auth",
});
import { h, ref, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";

const UCheckbox = resolveComponent("UCheckbox");
const UIcon = resolveComponent("UIcon");

const openReview = ref(false);
const page = ref(1);
const pageSize = ref("5");
const search = ref("");
const startDate = ref();
const endDate = ref();
const currentQueryParams = ref<Record<string, string>>({});

// ✅ Dummy data persis kayak screenshot
const data = ref<Record<string, any>[]>([
  {
    id: "1",
    iSafe: "IDT01A5",
    nik: "1234567890112",
    nama: "Priya Nair",
    role: "Geologist",
    tanggal: "12 Jan 2025",
    waktu: "09:05 AM",
    status: "Hadir",
  },
  {
    id: "2",
    iSafe: "IDT01A5",
    nik: "1234567890112",
    nama: "Akmal",
    role: "Geologist",
    tanggal: "12 Jan 2025",
    waktu: "-",
    status: "Tidak Hadir",
  },
  {
    id: "3",
    iSafe: "IDT01A5",
    nik: "1234567890112",
    nama: "Ilam Nugroho",
    role: "Geologist",
    tanggal: "12 Jan 2025",
    waktu: "09:05 AM",
    status: "Hadir",
  },
  {
    id: "4",
    iSafe: "IDT01A5",
    nik: "1234567890112",
    nama: "Laila Mila",
    role: "Geologist",
    tanggal: "12 Jan 2025",
    waktu: "09:05 AM",
    status: "Hadir",
  },
  {
    id: "5",
    iSafe: "IDT01A5",
    nik: "1234567890112",
    nama: "Maria",
    role: "Geologist",
    tanggal: "12 Jan 2025",
    waktu: "09:05 AM",
    status: "Hadir",
  },
  {
    id: "6",
    iSafe: "IDT01A5",
    nik: "1234567890112",
    nama: "David",
    role: "Geologist",
    tanggal: "12 Jan 2025",
    waktu: "09:05 AM",
    status: "Hadir",
  },
  {
    id: "7",
    iSafe: "IDT01A5",
    nik: "1234567890112",
    nama: "Nurhasana",
    role: "Geologist",
    tanggal: "12 Jan 2025",
    waktu: "09:05 AM",
    status: "Hadir",
  },
  {
    id: "8",
    iSafe: "IDT01A5",
    nik: "1234567890112",
    nama: "David",
    role: "Geologist",
    tanggal: "12 Jan 2025",
    waktu: "-",
    status: "Tidak Hadir",
  },
  {
    id: "9",
    iSafe: "IDT01A5",
    nik: "1234567890112",
    nama: "Nurhasana",
    role: "Geologist",
    tanggal: "12 Jan 2025",
    waktu: "09:05 AM",
    status: "Hadir",
  },
]);

const columns: TableColumn<Record<string, any>>[] = [
  {
    id: "select",
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : table.getIsAllPageRowsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Select all",
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        "aria-label": "Select row",
      }),
  },
  { accessorKey: "iSafe", header: "iSafe" },
  { accessorKey: "nik", header: "NIK" },
  { accessorKey: "nama", header: "Nama" },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "tanggal", header: "Tanggal" },
  { accessorKey: "waktu", header: "Waktu" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      const isHadir = status === "Hadir";
      return h(
        "span",
        {
          class: `px-2 py-1 rounded text-xs font-medium ${
            isHadir
              ? "text-blue-600 border border-blue-400"
              : "text-red-500 border border-red-400"
          }`,
        },
        status
      );
    },
  },
  {
    id: "Aksi",
    header: "Aksi",
    cell: ({ row }) =>
      h(UIcon, {
        name: "lucide:eye",
        class: "w-4 h-4 text-gray-600 hover:text-black cursor-pointer",
        onClick: () => (openReview.value = true),
      }),
  },
];

function handleDateUpdate(startDateInput?: string, endDateInput?: string) {
  startDate.value = startDateInput ?? null;
  endDate.value = endDateInput ?? null;
}
</script>

<template>
  <div class="p-6 bg-grey-100 rounded-xs space-y-3">
    <DashboardTableHeaderControls
      v-model:search="search"
      @update-date="handleDateUpdate"
      :collection="'business_trips'"
      :queryParams="currentQueryParams"
    >
      <template #slideover-button>
        <AbsensiFormAbsensi />
      </template>
    </DashboardTableHeaderControls>

    <DashboardTable
      :data="data"
      :columns="columns"
      :totalData="data.length"
      v-model:pageSize="pageSize"
      v-model:page="page"
    />
  </div>

  <USlideover
    v-model:open="openReview"
    title="Review Perjalanan Dinas"
    :ui="{ content: 'm-9' }"
  >
    <template #body>Data detail di sini...</template>
  </USlideover>
</template>
