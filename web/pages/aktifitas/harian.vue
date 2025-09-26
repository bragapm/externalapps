<script lang="ts" setup>
definePageMeta({
  middleware: "auth",
});
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { h, ref, resolveComponent } from "vue";
import type { TableColumn, TableRow } from "@nuxt/ui";

const UCheckbox = resolveComponent("UCheckbox");
const UIcon = resolveComponent("UIcon");

const authStore = useAuth();
const page = ref(1);
const pageSize = ref<string>("10");
const startDate = ref();
const endDate = ref();
const search = ref("");
const currentQueryParams = ref<Record<string, string>>();
const selectedId = ref<string | null>(null);
const selectedDate = ref<string | null>(null);

// Edit functionality states
const openEdit = ref(false);
const editData = ref<any>(null);
const isLoadingEditData = ref(false);

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
      filters.push({
        date: {
          _gte: startDate.value,
        },
      });
    }
    if (endDate.value) {
      filters.push({
        date: {
          _lte: endDate.value,
        },
      });
    }
    if (search.value) {
      filters.push({
        title: {
          _icontains: search.value.trim(),
        },
      });
    }

    const queryParams: Record<string, string> = {
      limit: String(pageSize.value),
      page: String(page.value),
      fields:
        "id,user_created.*,report_type.name,pics.directus_users_id.first_name,location,title,status,start_time,date",
      filter: JSON.stringify({
        _and: filters,
      }),
      meta: "filter_count",
    };
    currentQueryParams.value = queryParams;
    const r = await $fetch<{
      data: Record<string, any>[];
      meta: { filter_count: number };
    }>(`/panel/items/daily_activities?` + new URLSearchParams(queryParams), {})
      .then((r) => r)
      .catch((err) => {
        throw err; // re-throw to let useQuery handle it if needed
      });

    console.log(r);

    return r;
  },
});

// Function to fetch detailed data for editing
async function fetchEditData(id: string) {
  isLoadingEditData.value = true;
  try {
    const response = await $fetch<{
      data: Record<string, any>;
    }>(
      `/panel/items/daily_activities/${id}?fields=*,pics.directus_users_id.id,report_type.id,documents.directus_files_id`
    );

    // Transform the data to match form expectations
    const data = response.data;

    // Transform pics data to array of user IDs
    const pics = (data.pics || [])
      .map((pic: any) => pic.directus_users_id?.id)
      .filter(Boolean);

    return {
      ...data,
      pics: pics,
      report_type: data.report_type?.id || data.report_type,
      // Keep other fields as they are
    };
  } catch (error) {
    console.error("Error fetching edit data:", error);
    throw error;
  } finally {
    isLoadingEditData.value = false;
  }
}

// Function to handle edit button click
async function handleEditClick(id: string, date: string) {
  try {
    const data = await fetchEditData(id);
    editData.value = data;
    selectedId.value = id;
    selectedDate.value = date;
    openEdit.value = true;
  } catch (error) {
    // Handle error - you might want to show a toast notification
    console.error("Failed to load edit data:", error);
  }
}

type submissionStatus = "in_progress" | "approved" | "draft";

const columns: TableColumn<Record<string, any>>[] = [
  {
    accessorKey: "isafe_number",
    header: "iSafe Number",
    cell: () => "090909",
  },
  {
    accessorKey: "nik",
    header: "NIK",
    // just a placeholder – you could hash `user_created.id` if needed
    cell: () => "1234675289001",
  },
  {
    accessorKey: "pics",
    header: "PIC",
    cell: ({ row }) => {
      const pics = row.getValue("pics") as {
        directus_users_id: { first_name: string };
      }[];

      const names = (pics || [])
        .map((p) => p.directus_users_id?.first_name)
        .filter(Boolean);
      return names.join(", ") || "-";
    },
  },
  {
    accessorKey: "start_time",
    header: "Start Time",
    cell: ({ row }) => row.getValue("start_time") || "-",
  },
  {
    accessorKey: "location",
    header: "Lokasi",
    cell: ({ row }) => row.getValue("location") || "-",
  },
  {
    accessorKey: "report_type",
    header: "Report",
    cell: ({ row }) => {
      const report = row.getValue("report_type") as { name?: string };
      return report?.name || "-";
    },
  },
  {
    accessorKey: "title",
    header: "Judul Report",
    cell: ({ row }) => {
      const title = String(row.getValue("title") || "-");
      return h(
        "span",
        { class: "whitespace-nowrap truncate max-w-[150px]" },
        title
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const raw = String(row.getValue("status") || "").toLowerCase();
      const labelMap: Record<string, string> = {
        approved: "Approved",
        in_progress: "In Progress",
        draft: "draft",
        closed: "Closed",
        reject: "Reject",
        rejected: "Reject",
      };
      const label = labelMap[raw] || raw;

      const styleMap: Record<string, string> = {
        in_progress: "text-blue-600 border border-blue-300 bg-blue-50",
        draft: "text-orange-600 border border-orange-300 bg-orange-50",
        closed: "text-green-600 border border-green-300 bg-green-50",
        approved: "text-yellow-700 border border-yellow-300 bg-yellow-50",
        reject: "text-red-600 border border-red-300 bg-red-50",
      };

      return h(
        "span",
        {
          class: `inline-flex items-center text-xs px-2 py-1 rounded-md font-medium ${
            styleMap[raw] || ""
          }`,
        },
        [h("span", { class: "i-heroicons-check-circle-16 mr-1" }), label]
      );
    },
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }) => {
      return h("div", { class: "flex items-center gap-2" }, [
        h(UIcon, {
          name: "lucide:eye",
          class: "w-4 h-4 cursor-pointer text-gray-600 hover:text-gray-800",
          onClick: () => {
            selectedId.value = row.original.id;
            selectedDate.value = row.original.date;
            openReview.value = true;
          },
        }),
        h(UIcon, {
          name: "lucide:pencil",
          class: "w-4 h-4 cursor-pointer text-gray-600 hover:text-gray-800",
          onClick: () => {
            handleEditClick(row.original.id, row.original.date);
          },
        }),
      ]);
    },
  },
];

const openReview = ref(false);

function handleDateUpdate(startDateInput?: string, endDateInput?: string) {
  startDate.value = startDateInput ?? null;
  endDate.value = endDateInput ?? null;
}

// Chart Data

const {
  data: chartData,
  isFetching: isChartLoading,
  isError: isChartError,
} = useQuery({
  queryKey: ["chart-data", startDate, endDate, search],
  queryFn: async () => {
    const filters: any[] = [];

    if (startDate.value) {
      filters.push({ date: { _gte: startDate.value } });
    }
    if (endDate.value) {
      filters.push({ date: { _lte: endDate.value } });
    }
    if (search.value) {
      filters.push({ title: { _icontains: search.value.trim() } });
    }

    const queryParams: Record<string, string> = {
      fields: "report_type.name,status",
      limit: "-1",
      filter: JSON.stringify({ _and: filters }),
    };

    const response = await $fetch<{
      data: { report_type: { name: string }; status: string }[];
    }>("/panel/items/daily_activities?" + new URLSearchParams(queryParams), {});

    return response.data;
  },
});

const chartLabels = ref<string[]>([]);
const chartDatasets = ref<
  { label: string; data: number[]; backgroundColor: string }[]
>([]);

const computedChartData = computed(() => {
  if (!chartData.value) return { labels: [], datasets: [] };

  const grouped: Record<string, { open: number; close: number }> = {};

  chartData.value.forEach((item) => {
    const reportName = item.report_type?.name ?? "Unknown";
    const status = item.status?.toLowerCase();

    if (!grouped[reportName]) {
      grouped[reportName] = { open: 0, close: 0 };
    }

    if (status === "in_progress" || status === "open") {
      grouped[reportName].open++;
    } else if (status === "closed") {
      grouped[reportName].close++;
    }
  });

  const labels = Object.keys(grouped);
  const datasets = [
    {
      label: "Open",
      data: labels.map((label) => grouped[label].open),
      backgroundColor: "#3B82F6",
    },
    {
      label: "Close",
      data: labels.map((label) => grouped[label].close),
      backgroundColor: "#22C55E",
    },
  ];

  return { labels, datasets };
});

const queryClient = useQueryClient();

function handleLeaveRequestSuccess() {
  //  Refetch Function After Submit
  queryClient.invalidateQueries({ queryKey: ["table-data"] });
}

function handleEditSuccess() {
  // Refetch table data after successful edit
  queryClient.invalidateQueries({ queryKey: ["table-data"] });
  queryClient.invalidateQueries({ queryKey: ["chart-data"] });

  // Close the edit modal
  openEdit.value = false;
  editData.value = null;
  selectedId.value = null;
  selectedDate.value = null;
}

// Watch for openEdit changes to reset data when modal is closed
watch(openEdit, (newVal) => {
  if (!newVal) {
    editData.value = null;
    selectedId.value = null;
    selectedDate.value = null;
  }
});
</script>

<template>
  <div class="p-6 bg-grey-100 space-y-3 rounded-lg">
    <DashboardTableHeaderControls
      v-model:search="search"
      @update-date="handleDateUpdate"
      :collection="'business_trips'"
      :queryParams="currentQueryParams"
    >
      <template #slideover-button>
        <USlideover
          title="Buat Daily Activity"
          :ui="{
            content: 'w-full max-w-[40vw] m-9 rounded-lg',
            body: 'relative',
            title: 'text-sm font-semibold text-gray-900',
          }"
        >
          <UButton
            icon="i-heroicons-plus"
            label="Buat Daily Activity"
            class="text-sm"
          />

          <template #body>
            <div class="w-full">
              <AktifitasFormDailyActivity
                @success="handleLeaveRequestSuccess"
              />
            </div>
          </template>
        </USlideover>
      </template>
    </DashboardTableHeaderControls>

    <ChartBarChart
      class="w-full"
      title="Report Status"
      :stacked="false"
      :labels="computedChartData.labels"
      :datasets="computedChartData.datasets"
    />

    <DashboardTable
      v-model:pageSize="pageSize"
      v-model:page="page"
      :data="tableData?.data"
      :columns="columns"
      :totalData="tableData?.meta?.filter_count"
    />
  </div>

  <!-- Review Modal -->
  <USlideover
    v-model:open="openReview"
    :title="`Review Daily Activity, ${selectedDate}`"
    :ui="{
      content: 'w-full max-w-[30vw] m-9 rounded-lg',
      body: 'relative',
      title: 'text-sm font-semibold text-gray-900',
    }"
  >
    <template #body>
      <AktifitasDetailDailyActivity v-if="selectedId" :id="selectedId" />
    </template>
  </USlideover>

  <!-- Edit Modal -->
  <USlideover
    v-model:open="openEdit"
    :title="`Edit Daily Activity - ${selectedDate || ''}`"
    :ui="{
      content: 'w-full max-w-[40vw] m-9 rounded-lg',
      body: 'flex-1 overflow-y-auto relative',
      title: 'text-sm font-semibold text-gray-900',
    }"
  >
    <template #body>
      <div class="w-full">
        <!-- Loading state while fetching edit data -->
        <div
          v-if="isLoadingEditData"
          class="flex justify-center items-center h-40"
        >
          <UIcon
            name="i-heroicons-arrow-path"
            class="animate-spin text-2xl text-primary"
          />
          <span class="ml-2">Loading edit data...</span>
        </div>

        <!-- Edit form -->
        <AktifitasFormDailyActivity
          v-else-if="editData"
          :editData="editData"
          :isEdit="true"
          @success="handleEditSuccess"
        />
      </div>
    </template>
  </USlideover>
</template>
