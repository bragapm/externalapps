<script lang="ts" setup>
definePageMeta({
  middleware: "auth",
});
import { h, ref, resolveComponent } from "vue";
import type { TableColumn, TableRow } from "@nuxt/ui";

const UCheckbox = resolveComponent("UCheckbox");
import dummy from "~/assets/images/dummy.png";

type AbsensiStatus = "Perjalanan Dinas" | "sakit" | "Cuti" | "Hadir";

type Absensi = {
  id: string;
  name: string;
  role: string;
  nik: string;
  isafeId: string;
  status: AbsensiStatus;
};

const data = ref<Absensi[]>([
  {
    id: "1",
    nik: "1234567890",
    isafeId: "ISF001",
    name: "Priya Nair",
    role: "Dept Head",
    status: "Perjalanan Dinas",
  },
  {
    id: "2",
    nik: "9876543210",
    isafeId: "ISF002",
    name: "Puteri Aprilia",
    role: "Admin",
    status: "sakit",
  },
  {
    id: "3",
    nik: "1122334455",
    isafeId: "ISF003",
    name: "Angelica",
    role: "Non-Organic",
    status: "Cuti",
  },
  {
    id: "4",
    nik: "2233445566",
    isafeId: "ISF004",
    name: "Maria",
    role: "Organic",
    status: "Hadir",
  },
  {
    id: "5",
    nik: "3344556677",
    isafeId: "ISF005",
    name: "Santa Sitorius",
    role: "Organic",
    status: "Perjalanan Dinas",
  },
  {
    id: "6",
    nik: "4455667788",
    isafeId: "ISF006",
    name: "Alma",
    role: "Organic",
    status: "sakit",
  },
  {
    id: "7",
    nik: "5566778899",
    isafeId: "ISF007",
    name: "Adi Subrata",
    role: "Non-Organic",
    status: "Cuti",
  },
  {
    id: "8",
    nik: "6677889900",
    isafeId: "ISF008",
    name: "Fahmi",
    role: "Organic",
    status: "sakit",
  },
  {
    id: "9",
    nik: "7788990011",
    isafeId: "ISF009",
    name: "Yasmin",
    role: "Non-Organic",
    status: "Cuti",
  },
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
  { accessorKey: "nik", header: "NIK" },
  { accessorKey: "isafeId", header: "iSafe ID" },
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

const today = new Date();
const formattedDate = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
}).format(today);
</script>

<template>
  <!-- <DashboardHeader /> -->
  <div class="flex gap-4 w-full mb-4">
    <div class="flex flex-col gap-4 w-[65%]">
      <DashboardAbsensiSummary />
      <section class="grid grid-cols-3 gap-4">
        <div class="bg-grey-100 p-4 rounded-lg space-y-2">
          <h3 class="text-gray-800 font-medium">Jumlah Absensi</h3>
          <h1 class="text-[#D32E36] font-semibold text-4xl">17/20</h1>
          <p class="text-sm text-gray-400">{{ formattedDate }}</p>
        </div>
        <div class="bg-grey-100 p-4 rounded-lg space-y-2">
          <h3 class="text-gray-800 font-medium">Jumlah Cuti</h3>
          <h1 class="text-[#D32E36] font-semibold text-4xl">2/20</h1>
          <p class="text-sm text-gray-400">{{ formattedDate }}</p>
        </div>
        <div class="bg-grey-100 p-4 rounded-lg space-y-2">
          <h3 class="text-gray-800 font-medium">Jumlah Absen</h3>
          <h1 class="text-[#D32E36] font-semibold text-4xl">1/20</h1>
          <p class="text-sm text-gray-400">{{ formattedDate }}</p>
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
        <h3 class="font-medium text-gray-800">
          Live Absensi - {{ formattedDate }}
        </h3>
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
    <section class="bg-grey-100 px-5 py-6 rounded-lg mt-4 mb-6">
      <h3 class="font-medium text-gray-800">
        Struktur Organisasi Dept External Relations
      </h3>
      <img :src="dummy" alt="Struktur Organisasi" class="mt-4 mx-auto py-12" />
    </section>
    <section class="bg-grey-100 px-5 py-6 rounded-lg mb-6">
      <DashboardChartAbsensi />
    </section>
  </div>
</template>
