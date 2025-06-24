<script lang="ts" setup>
import { h, ref, resolveComponent } from "vue";
import type { TableColumn, TableRow } from "@nuxt/ui";

const UCheckbox = resolveComponent("UCheckbox");

type AbsensiStatus = "Perjalanan Dinas" | "sakit" | "Cuti" | "Hadir";

const data = ref<Record<string, any>[]>([
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
</script>

<template>
  <div class="p-6 bg-grey-100 rounded-xs space-y-3">
    <DashboardTable :data="data" :columns="columns" :totalData="100" />
  </div>
</template>
