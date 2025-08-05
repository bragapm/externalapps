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
    }>(`/panel/items/daily_activities?` + new URLSearchParams(queryParams), {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    })
      .then((r) => r)
      .catch((err) => {
        throw err; // re-throw to let useQuery handle it if needed
      });

    console.log(r);

    return r;
  },
});

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
  queryKey: ["chart-data"],
  queryFn: async () => {
    const response = await $fetch<{
      data: {
        report_type: { name: string };
        status: string;
      }[];
    }>(
      "/panel/items/daily_activities?fields=report_type.name,status&limit=-1",
      {
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`,
        },
      }
    );

    return response.data;
  },
});

const chartLabels = ref<string[]>([]);
const chartDatasets = ref<
  { label: string; data: number[]; backgroundColor: string }[]
>([]);

watch(chartData, (data) => {
  if (!data) return;

  const grouped: Record<string, { open: number; close: number }> = {};

  data.forEach((item) => {
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

  chartLabels.value = Object.keys(grouped);
  chartDatasets.value = [
    {
      label: "Open",
      data: chartLabels.value.map((label) => grouped[label].open),
      backgroundColor: "#3B82F6",
    },
    {
      label: "Close",
      data: chartLabels.value.map((label) => grouped[label].close),
      backgroundColor: "#22C55E",
    },
  ];
});

const queryClient = useQueryClient();

function handleLeaveRequestSuccess() {
  //  Refetch Fucntion After Submit
  queryClient.invalidateQueries({ queryKey: ["table-data"] });
}
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
      :labels="chartLabels"
      :datasets="chartDatasets"
    />
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
</template>
