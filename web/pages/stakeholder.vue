<script lang="ts" setup>
definePageMeta({
  middleware: "auth",
});
import type { TableColumn, TableRow } from "@nuxt/ui";

const page = ref(1);
const pageSize = ref<string>("10");
const startDate = ref();
const endDate = ref();
const search = ref("");
const currentQueryParams = ref<Record<string, string>>();
const openReview = ref(false);

function handleDateUpdate(startDateInput?: string, endDateInput?: string) {
  startDate.value = startDateInput ?? null;
  endDate.value = endDateInput ?? null;
}

const UCheckbox = resolveComponent("UCheckbox");

const data = ref<Record<string, any>[]>([
  {
    id: "1",
    name: "Ajip Rosyadi",
    jabatan: "Sekertaris",
    organisasi: "Ormas A",
    alamat: "Desa Kalimantan Barat",
    no_hp: "081563225190",
    email: "ajip.rosyadi@gmail.com",
    sentimen: "Negatif",
    dokumen: "Dokumen.pdf",
    last_update: "12 Feb 2025, 10:30",
  },
  {
    id: "2",
    name: "Kamala Husain",
    jabatan: "Ketua",
    organisasi: "Ormas A",
    alamat: "Desa Kalimantan Barat",
    no_hp: "082145678890",
    email: "kamala.husain@yahoo.com",
    sentimen: "Positif",
    dokumen: "Dokumen.pdf",
    last_update: "12 Feb 2025, 11:00",
  },
  {
    id: "3",
    name: "Ridwan",
    jabatan: "AKBP",
    organisasi: "Polisi",
    alamat: "Desa Kalimantan Barat",
    no_hp: "081277889911",
    email: "ridwan.akbp@polri.go.id",
    sentimen: "Negatif",
    dokumen: "Dokumen.pdf",
    last_update: "12 Feb 2025, 11:45",
  },
  {
    id: "4",
    name: "Asep",
    jabatan: "Personil",
    organisasi: "TNI",
    alamat: "Desa Kalimantan Barat",
    no_hp: "085211223344",
    email: "asep.tni@mil.id",
    sentimen: "Positif",
    dokumen: "Dokumen.pdf",
    last_update: "12 Feb 2025, 12:15",
  },
  {
    id: "5",
    name: "Maulana",
    jabatan: "Ketua",
    organisasi: "Ormas C",
    alamat: "Desa Kalimantan Barat",
    no_hp: "081399887766",
    email: "maulana.ketua@ormasc.org",
    sentimen: "Negatif",
    dokumen: "Dokumen.pdf",
    last_update: "12 Feb 2025, 13:00",
  },
  {
    id: "6",
    name: "Adi Subrata",
    jabatan: "Ketua",
    organisasi: "Ormas C",
    alamat: "Desa Kalimantan Barat",
    no_hp: "082233445566",
    email: "adi.subrata@ormasc.org",
    sentimen: "Positif",
    dokumen: "Dokumen.pdf",
    last_update: "12 Feb 2025, 13:40",
  },
  {
    id: "7",
    name: "Rian",
    jabatan: "Ketua",
    organisasi: "Ormas C",
    alamat: "Desa Kalimantan Barat",
    no_hp: "081966554433",
    email: "rian.ketua@ormasc.org",
    sentimen: "Negatif",
    dokumen: "Dokumen.pdf",
    last_update: "12 Feb 2025, 14:20",
  },
  {
    id: "8",
    name: "Anggi",
    jabatan: "Bendahara",
    organisasi: "Ormas C",
    alamat: "Desa Kalimantan Barat",
    no_hp: "087812345678",
    email: "anggi.bendahara@ormasc.org",
    sentimen: "Positif",
    dokumen: "Dokumen.pdf",
    last_update: "12 Feb 2025, 15:00",
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
        ui: { base: "rounded-sm ring-grey-500" },
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        "aria-label": "Select row",
        ui: { base: "rounded-sm ring-grey-500" },
      }),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "jabatan",
    header: "Jabatan",
  },
  {
    accessorKey: "organisasi",
    header: "Organisasi",
  },
  {
    accessorKey: "alamat",
    header: "Alamat",
  },
  {
    accessorKey: "no_hp",
    header: "No Hp",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email");
      return h(
        "a",
        {
          href: `mailto:${email}`,
          class: "text-blue-600 underline",
        },
        { default: () => email }
      );
    },
  },
  {
    accessorKey: "sentimen",
    header: "Sentimen",
    cell: ({ row }) => {
      const sentimen = row.getValue("sentimen");
      const isPositive = sentimen === "Positif";

      return h(
        "span",
        {
          class: `px-2 py-1 rounded text-xs font-medium ${
            isPositive
              ? "text-green-500 border border-green-500"
              : "text-red-500 border border-red-500"
          }`,
        },
        { default: () => sentimen }
      );
    },
  },
  {
    accessorKey: "dokumen",
    header: "Dokumen",
    cell: ({ row }) => {
      const dokumen = row.getValue("dokumen");
      return h(
        "a",
        {
          href: "#",
          class: "text-blue-600 underline text-xs",
        },
        { default: () => dokumen }
      );
    },
  },
  {
    accessorKey: "last_update",
    header: "Last Update",
    cell: ({ row }) => {
      const lastUpdate = row.getValue("last_update");
      return h(
        "span",
        {
          class: "text-xs text-gray-600",
        },
        { default: () => lastUpdate }
      );
    },
  },
  {
    id: "action",
    header: "Aksi",
    cell: ({ row }) => {
      return h(
        "div",
        {
          class: "flex items-center gap-2",
        },
        [
          h(
            "button",
            {
              class: "text-gray-600 hover:text-gray-800",
              onClick: () => console.log("View", row.original),
            },
            [
              h("i", {
                class: "i-heroicons-eye w-4 h-4",
              }),
            ]
          ),
          h(
            "button",
            {
              class: "text-gray-600 hover:text-gray-800",
              onClick: () => console.log("More", row.original),
            },
            "⋮"
          ),
        ]
      );
    },
  },
];
</script>

<template>
  <div class="p-6 bg-grey-100 rounded-lg space-y-3">
    <DashboardTableHeaderControls
      v-model:search="search"
      @update-date="handleDateUpdate"
      :collection="'business_trips'"
      :queryParams="currentQueryParams"
    >
      <template #slideover-button>
        <USlideover
          title="Tambah Stakeholder"
          :ui="{
            content: 'w-full max-w-[40vw] m-9 rounded-lg',
            body: 'relative',
            title: 'text-sm font-semibold text-gray-900',
          }"
        >
          <UButton
            icon="i-heroicons-plus"
            label="Tambah Stakeholder"
            size="xl"
            class="text-sm"
          />

          <template #body>
            <div class="w-full">
              <AktifitasFormDailyActivity />
            </div>
          </template>
        </USlideover>
      </template>
    </DashboardTableHeaderControls>
    <section class="grid grid-cols-3 gap-3">
      <ChartBarChart
        title="Jumlah Stakeholder"
        :labels="['Desa A', 'Desa B', 'Desa C', 'Desa D', 'Desa E']"
        :datasets="[
          {
            label: 'stakeholder',
            data: [20, 5, 12, 8, 30],
            backgroundColor: '#ED6C2B',
            borderRadius: 4,
          },
        ]"
        height="h-64"
        :showPeriodSelector="false"
        @periodChange="
        (period : any) => {
          console.log('Selected period:', period);
        }
      "
      />
      <ChartBarChart
        title="Jumlah Stakeholder by Instansi"
        :labels="['Desa A', 'Desa B', 'Desa C', 'Desa D', 'Desa E']"
        :datasets="[
          {
            label: 'stakeholder',
            data: [12, 5, 10, 20, 15],
            backgroundColor: '#ED6C2B',
            borderRadius: 4,
          },
        ]"
        height="h-64"
        :showPeriodSelector="false"
        @periodChange="
        (period : any) => {
          console.log('Selected period:', period);
        }
      "
      />
      <ChartPieChart
        title="Sentimen Stakeholder"
        :data="[
          { label: 'Positif', value: 30, color: '#21D372' },
          { label: 'Negatif', value: 5, color: '#D32E36' },
        ]"
      />
    </section>

    <DashboardTable
      v-model:pageSize="pageSize"
      v-model:page="page"
      :data="data"
      :columns="columns"
      :totalData="12"
    />
  </div>
</template>
