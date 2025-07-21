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
type submissionStatus = "in_progress" | "approved" | "draft";

// Updated dummy data to match your table structure
const data = ref<Record<string, any>[]>([
  {
    id: "1",
    user: { first_name: "Ajip", last_name: "Rosyadi" },
    start_date: "2025-02-10",
    end_date: "2025-02-15",
    destination: "Bandung",
    transportation: "Mobil Dinas",
    status: "approved" as submissionStatus,
    document: {
      id: "doc1",
      title: "Travel Document",
      filename_download: "travel_doc_1.pdf",
    },
  },
  {
    id: "2",
    user: { first_name: "Kamala", last_name: "Husain" },
    start_date: "2025-02-12",
    end_date: "2025-02-18",
    destination: "Jakarta",
    transportation: "Pesawat",
    status: "in_progress" as submissionStatus,
    document: {
      id: "doc2",
      title: "Business Trip Report",
      filename_download: "business_trip_2.pdf",
    },
  },
  {
    id: "3",
    user: { first_name: "Ridwan", last_name: "AKBP" },
    start_date: "2025-02-14",
    end_date: "2025-02-20",
    destination: "Surabaya",
    transportation: "Kereta Api",
    status: "draft" as submissionStatus,
    document: {
      id: "doc3",
      title: "Official Visit Document",
      filename_download: "official_visit_3.pdf",
    },
  },
  {
    id: "4",
    user: { first_name: "Asep", last_name: "Personil" },
    start_date: "2025-02-16",
    end_date: "2025-02-22",
    destination: "Yogyakarta",
    transportation: "Bus",
    status: "approved" as submissionStatus,
    document: {
      id: "doc4",
      title: "Training Document",
      filename_download: "training_doc_4.pdf",
    },
  },
  {
    id: "5",
    user: { first_name: "Maulana", last_name: "Ketua" },
    start_date: "2025-02-18",
    end_date: "2025-02-25",
    destination: "Medan",
    transportation: "Mobil Pribadi",
    status: "in_progress" as submissionStatus,
    document: {
      id: "doc5",
      title: "Conference Document",
      filename_download: "conference_5.pdf",
    },
  },
  {
    id: "6",
    user: { first_name: "Adi", last_name: "Subrata" },
    start_date: "2025-02-20",
    end_date: "2025-02-26",
    destination: "Makassar",
    transportation: "Pesawat",
    status: "approved" as submissionStatus,
    document: {
      id: "doc6",
      title: "Meeting Document",
      filename_download: "meeting_doc_6.pdf",
    },
  },
  {
    id: "7",
    user: { first_name: "Rian", last_name: "Ketua" },
    start_date: "2025-02-22",
    end_date: "2025-02-28",
    destination: "Palembang",
    transportation: "Mobil Dinas",
    status: "draft" as submissionStatus,
    document: {
      id: "doc7",
      title: "Inspection Document",
      filename_download: "inspection_7.pdf",
    },
  },
  {
    id: "8",
    user: { first_name: "Anggi", last_name: "Bendahara" },
    start_date: "2025-02-24",
    end_date: "2025-03-02",
    destination: "Bali",
    transportation: "Pesawat",
    status: "approved" as submissionStatus,
    document: {
      id: "doc8",
      title: "Audit Document",
      filename_download: "audit_doc_8.pdf",
    },
  },
  {
    id: "9",
    user: { first_name: "Santi", last_name: "Anggota" },
    start_date: "2025-01-08",
    end_date: "2025-01-12",
    destination: "Semarang",
    transportation: "Kereta Api",
    status: "in_progress" as submissionStatus,
    document: {
      id: "doc9",
      title: "Workshop Document",
      filename_download: "workshop_9.pdf",
    },
  },
  {
    id: "10",
    user: { first_name: "Deni", last_name: "Kepala Bagian" },
    start_date: "2025-03-03",
    end_date: "2025-03-08",
    destination: "Lombok",
    transportation: "Mobil Dinas",
    status: "approved" as submissionStatus,
    document: {
      id: "doc10",
      title: "Policy Review Document",
      filename_download: "policy_review_10.pdf",
    },
  },
  {
    id: "11",
    user: { first_name: "Budi", last_name: "Santoso" },
    start_date: "2025-03-30",
    end_date: "2025-04-03",
    destination: "Batam",
    transportation: "Pesawat",
    status: "draft" as submissionStatus,
    document: {
      id: "doc11",
      title: "Contract Review",
      filename_download: "contract_review_11.pdf",
    },
  },
  {
    id: "12",
    user: { first_name: "Citra", last_name: "Dewi" },
    start_date: "2025-02-18",
    end_date: "2025-02-22",
    destination: "Pontianak",
    transportation: "Pesawat",
    status: "in_progress" as submissionStatus,
    document: {
      id: "doc12",
      title: "Quarterly Report",
      filename_download: "quarterly_report_12.pdf",
    },
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
        ui: { base: "rounded-2xs ring-grey-500" },
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        "aria-label": "Select row",
        ui: { base: "rounded-2xs ring-grey-500" },
      }),
  },
  {
    accessorKey: "user",
    header: "Nama",
    cell: ({ row }) => {
      const user: { first_name: string; last_name: string } =
        row.getValue("user");

      return h(
        "span",
        {
          class: "",
        },
        user.first_name + " " + user.last_name
      );
    },
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("start_date"));
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    },
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("end_date"));
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    },
  },
  {
    accessorKey: "destination",
    header: "Tujuan",
  },
  {
    accessorKey: "transportation",
    header: "Transport",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as submissionStatus;

      const badgeStyles: Record<submissionStatus, string> = {
        in_progress: "text-[#E1CB0D] border-[#E1CB0D] rounded-lg",
        draft: "text-red-500 border-red-500 rounded-lg",
        approved: "text-blue-500 border-blue-500 rounded-lg",
      };

      return h(
        "span",
        {
          class: `text-2xs leading-4 border p-2 rounded-2xs font-medium capitalize ${badgeStyles[status]}`,
        },
        status.replace("_", " ")
      );
    },
  },
  {
    accessorKey: "document",
    header: "Dokumen",
    cell: ({ row }) => {
      const file: { id: string; title: string; filename_download: string } =
        row.getValue("document");
      if (!file || typeof file !== "object") return "No file";

      const url = `/panel/assets/${file.id}?download`;

      return h(
        "a",
        {
          href: url,
          target: "_blank",
          download: true,
          class: "text-blue-600 underline text-xs",
        },
        file.filename_download || file.title || "Download"
      );
    },
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => {
      return h(
        "button",
        {
          class: "text-blue-600 underline text-xs",
          onClick: () => (openReview.value = !openReview.value),
        },
        "Review"
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
