<script lang="ts" setup>
definePageMeta({
  middleware: "auth",
});
import { h, ref, resolveComponent } from "vue";
import type { TableColumn, TableRow } from "@nuxt/ui";

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

const table = useTemplateRef("table");
</script>

<template>
  <DashboardHeader />
  <div class="flex gap-4 w-full my-4">
    <div class="flex flex-col gap-4 w-1/2">
      <!-- Card Dummy -->
      <section class="grid grid-cols-2 gap-4">
        <div class="bg-grey-100 p-3 rounded-lg space-y-1">
          <h3 class="text-gray-800 font-medium">Jumlah Absen</h3>
          <h1 class="text-[#D32E36] font-semibold text-4xl">17/20</h1>
          <p class="text-sm text-gray-400">Update Hari Ini</p>
        </div>
        <div class="bg-grey-100 p-3 rounded-lg space-y-1">
          <h3 class="text-gray-800 font-medium">Jumlah Cuti</h3>
          <h1 class="text-[#D32E36] font-semibold text-4xl">2/20</h1>
          <p class="text-sm text-gray-400">Update Hari Ini</p>
        </div>
        <div class="bg-grey-100 p-3 rounded-lg space-y-1">
          <h3 class="text-gray-800 font-medium">Jumlah Alfa</h3>
          <h1 class="text-[#D32E36] font-semibold text-4xl">1/20</h1>
          <p class="text-sm text-gray-400">Update Hari Ini</p>
        </div>
        <div class="bg-grey-100 p-3 rounded-lg space-y-1">
          <h3 class="text-gray-800 font-medium">Perjalanan Dinas</h3>
          <h1 class="text-[#D32E36] font-semibold text-4xl">3/20</h1>
          <p class="text-sm text-gray-400">Update Hari Ini</p>
        </div>
      </section>

      <!-- Chart Total -->
      <section class="bg-grey-100 p-4 rounded-lg w-full">
        <h3 class="font-medium text-gray-800">Total Employee</h3>
        <div
          class="h-40 bg-gray-100 mt-2 flex items-center justify-center text-gray-500"
        >
          <DashboardTotalEmployeeChart />
        </div>
      </section>
    </div>

    <!-- Table -->

    <section class="bg-grey-100 p-4 rounded-lg w-[75%] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-medium text-gray-800">Live Absensi</h3>
        <button
          class="font-medium text-xs border border-gray-300 flex items-center gap-2 p-2 rounded-[4px] text-grey-800"
        >
          <p>Lihat Detail</p>
          <SvgoIcArrowReg class="rotate-90" />
        </button>
      </div>

      <div class="overflow-x-auto rounded-[4px] border border-gray-300">
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
    </section>
  </div>
  <div>
    <section class="bg-grey-100 px-5 py-6 rounded-lg">
      <DashboardChartAbsensi />
    </section>
  </div>
</template>
