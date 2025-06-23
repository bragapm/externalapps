<script lang="ts" setup>
import { h, ref, resolveComponent } from "vue";
import type { TableColumn, TableRow } from "@nuxt/ui";

const page = ref(4);

const items = ref(["Harian", "Mingguan", "Bulanan"]);
const value = ref("Mingguan");

const UCheckbox = resolveComponent("UCheckbox");

type AbsensiStatus = "Perjalanan Dinas" | "sakit" | "Cuti" | "Hadir";

type Absensi = {
  id: string;
  name: string;
  role: string;
  status: AbsensiStatus;
};

const data = ref<Absensi[]>([
  {
    id: "1",
    name: "Priya Nair",
    role: "Dept Head",
    status: "Perjalanan Dinas",
  },
  { id: "2", name: "Puteri Aprilia", role: "Admin", status: "sakit" },
  { id: "3", name: "Angelica", role: "Non-Organic", status: "Cuti" },
  { id: "4", name: "Maria", role: "Organic", status: "Hadir" },
  {
    id: "5",
    name: "Santa Sitorius",
    role: "Organic",
    status: "Perjalanan Dinas",
  },
  { id: "6", name: "Alma", role: "Organic", status: "sakit" },
  { id: "7", name: "Adi Subrata", role: "Non-Organic", status: "Cuti" },
  { id: "8", name: "Fahmi", role: "Organic", status: "sakit" },
  { id: "9", name: "Yasmin", role: "Non-Organic", status: "Cuti" },
]);

const rowSelection = ref<Record<string, boolean>>({});

function onSelect(row: TableRow<Absensi>, e?: Event) {
  row.toggleSelected(!row.getIsSelected());
  console.log("Selected:", row.original, e);
}

const columns: TableColumn<Absensi>[] = [
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
        class: "rounded-sm border-gray-300",
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        "aria-label": "Select row",
        class: "rounded-sm border-gray-300",
      }),
  },
  {
    accessorKey: "name",
    header: "Nama",
  },
  {
    accessorKey: "role",
    header: "Role/Jabatan",
  },
  {
    accessorKey: "status",
    header: "Status Absensi",
    cell: ({ row }) => {
      const status = row.getValue("status") as AbsensiStatus;

      const badgeStyles: Record<AbsensiStatus, string> = {
        "Perjalanan Dinas": "bg-gray-200 text-gray-700",
        sakit: "bg-yellow-200 text-yellow-800",
        Cuti: "bg-green-200 text-green-800",
        Hadir: "bg-blue-200 text-blue-800",
      };

      return h(
        "span",
        {
          class: `text-xs px-2 py-1 rounded-full font-medium capitalize ${badgeStyles[status]}`,
        },
        status
      );
    },
  },
];

//pagination
const pageSizeItems = ref(["5", "10", "20", "50"]);
const pageSize = ref("10");
</script>

<template>
  <div class="p-6 bg-grey-100 rounded-xs space-y-3">
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
          v-model="value"
          :items="items"
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
        <p>dari 1124 Data Ditemukan</p>
      </div>
      <UPagination
        v-model:page="page"
        show-edges
        :sibling-count="1"
        :total="200"
      />
    </div>
  </div>
</template>
