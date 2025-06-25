<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import { h, ref, resolveComponent } from "vue";
import type { TableColumn, TableRow } from "@nuxt/ui";

const page = ref(1);
const pageSize = ref<string>("10");
const startDate = ref();
const endDate = ref();
const search = ref("");
const currentQueryParams = ref<Record<string, string>>();

const {
  data: tableData,
  error: tableError,
  isFetching: isTableFetching,
  isError: isTableError,
} = useQuery({
  queryKey: computed(() => [
    "table-data",
    page.value,
    pageSize.value,
    startDate.value,
    endDate.value,
    search.value,
  ]),
  queryFn: async ({ queryKey }) => {
    const filters: any[] = [];
    if (startDate.value) {
      const date = new Date(startDate.value);
      date.setHours(0, 0, 0);
      filters.push({
        start_date: {
          _gte: date,
        },
      });
    }
    if (endDate.value) {
      const date = new Date(endDate.value);
      date.setHours(23, 59, 59);
      filters.push({
        end_date: {
          _lte: date,
        },
      });
    }
    if (search.value) {
      const searchWords = search.value.trim().split(/\s+/);
      const orConditions = searchWords.map((word) => ({
        _or: [
          {
            user: {
              first_name: {
                _icontains: word,
              },
            },
          },
          {
            user: {
              last_name: {
                _icontains: word,
              },
            },
          },
        ],
      }));

      filters.push(...orConditions);
    }

    const queryParams: Record<string, string> = {
      limit: String(pageSize.value),
      page: String(page.value),
      fields:
        "id,user.first_name,user.last_name,destination,transportation,status,document.id,document.filename_download,document.title,start_date,end_date",
      filter: JSON.stringify({
        _and: filters,
      }),
      meta: "filter_count",
    };
    currentQueryParams.value = queryParams;
    const r = await $fetch<{
      data: Record<string, any>[];
      meta: { filter_count: number };
    }>(`/panel/items/business_trips?` + new URLSearchParams(queryParams))
      .then((r) => r)
      .catch((err) => {
        throw err; // re-throw to let useQuery handle it if needed
      });

    return r;
  },
});

const UCheckbox = resolveComponent("UCheckbox");

type submissionStatus = "in_progress" | "approved" | "draft";

// const data = ref<Record<string, any>[]>([
//   {
//     id: "1",
//     name: "Priya Nair",
//     role: "Dept Head",
//     status: "Perjalanan Dinas",
//   },
//   { id: "2", name: "Puteri Aprilia", role: "Admin", status: "sakit" },
//   { id: "3", name: "Angelica", role: "Non-Organic", status: "Cuti" },
//   { id: "4", name: "Maria", role: "Organic", status: "Hadir" },
//   {
//     id: "5",
//     name: "Santa Sitorius",
//     role: "Organic",
//     status: "Perjalanan Dinas",
//   },
//   { id: "6", name: "Alma", role: "Organic", status: "sakit" },
//   { id: "7", name: "Adi Subrata", role: "Non-Organic", status: "Cuti" },
//   { id: "8", name: "Fahmi", role: "Organic", status: "sakit" },
//   { id: "9", name: "Yasmin", role: "Non-Organic", status: "Cuti" },
// ]);

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
        in_progress: "text-[#E1CB0D] border-[#E1CB0D]",
        draft: "text-red-500",
        approved: "text-blue-500",
      };

      return h(
        "span",
        {
          class: `text-2xs leading-4 border p-2 rounded-2xs font-medium capitalize ${badgeStyles[status]}`,
        },
        status
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

const openReview = ref(false);

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
        <USlideover title="Ajukan Perjalanan Dinas" :ui="{ content: 'm-9' }">
          <UButton
            icon="i-heroicons-plus"
            label="Buat Perjalanan Dinas"
            size="xl"
          />

          <template #body>
            <div>form perjalanan dinas</div>
          </template>
          <template #footer>form submit</template>
        </USlideover>
      </template>
    </DashboardTableHeaderControls>
    <DashboardTable
      v-model:pageSize="pageSize"
      v-model:page="page"
      :data="tableData?.data"
      :columns="columns"
      :totalData="tableData?.meta?.filter_count"
    />
  </div>
  <USlideover
    v-model:open="openReview"
    title="Review Perjalanan Dinas"
    :ui="{ content: 'm-9' }"
  >
    <template #body> </template>
  </USlideover>
</template>
