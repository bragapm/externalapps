<script lang="ts" setup>
definePageMeta({ middleware: "auth" });

import { h, ref, resolveComponent } from "vue";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import type { TableColumn } from "@nuxt/ui";

const UIcon = resolveComponent("UIcon");
const UCheckbox = resolveComponent("UCheckbox");

interface User {
  first_name?: string;
  last_name?: string;
}

interface BusinessTrip {
  id: string;
  user: User | null;
  start_date: string;
  end_date: string;
  destination: string | null;
  purpose: string | null;
  transportation: string | null;
  status: "waiting" | "approved" | "rejected" | "in_progress";
}

interface ApiResponse {
  data: BusinessTrip[];
  meta: {
    filter_count: number;
  };
}

const page = ref(1);
const pageSize = ref<string>("10");
const search = ref("");
const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);
const auth = useAuth();
const currentQueryParams = ref<Record<string, string>>();
const selectedId = ref<string | null>(null);
const openReview = ref(false);

const { data: tableData, isFetching } = useQuery<ApiResponse>({
  queryKey: ["business-trips", page, pageSize, startDate, endDate, search],
  queryFn: async (): Promise<ApiResponse> => {
    const filters: any[] = [];

    if (startDate.value)
      filters.push({ start_date: { _gte: startDate.value } });
    if (endDate.value) filters.push({ end_date: { _lte: endDate.value } });
    if (search.value) {
      filters.push({
        _or: [
          { purpose: { _icontains: search.value } },
          { destination: { _icontains: search.value } },
        ],
      });
    }

    const queryParams: Record<string, string> = {
      fields: "*,user.first_name,user.last_name",
      limit: pageSize.value,
      page: String(page.value),
      meta: "filter_count",
    };

    if (filters.length === 1) queryParams.filter = JSON.stringify(filters[0]);
    else if (filters.length > 1)
      queryParams.filter = JSON.stringify({ _and: filters });

    currentQueryParams.value = queryParams;

    return await $fetch<ApiResponse>(
      `/panel/items/business_trips?${new URLSearchParams(queryParams)}`,
      {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      }
    ).then((res) => {
      return res;
    });
  },
});

function handleDateUpdate(start?: string, end?: string) {
  startDate.value = start ?? null;
  endDate.value = end ?? null;
}

const columns: TableColumn<Record<string, any>>[] = [
  {
    id: "select",
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : table.getIsAllPageRowsSelected(),
        "onUpdate:modelValue": (v: any) => table.toggleAllPageRowsSelected(!!v),
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (v: any) => row.toggleSelected(!!v),
      }),
  },
  { accessorKey: "iSafe", header: "iSafe ID", cell: () => "IDT01A5" },
  { accessorKey: "nik", header: "NIK", cell: () => "1234567890111" },
  {
    id: "start_date",
    header: "Tanggal Mulai",
    cell: ({ row }) => {
      try {
        // Handle null start_date
        if (!row.original.start_date) return "-";
        return new Date(row.original.start_date).toLocaleDateString("id-ID");
      } catch (error) {
        return "-";
      }
    },
  },
  {
    id: "end_date",
    header: "Tanggal Selesai",
    cell: ({ row }) => {
      try {
        // Handle null end_date
        if (!row.original.end_date) return "-";
        return new Date(row.original.end_date).toLocaleDateString("id-ID");
      } catch (error) {
        return "-";
      }
    },
  },
  {
    id: "destination",
    header: "Tujuan",
    cell: ({ row }) => row.original.destination || "-",
  },
  {
    id: "transportation",
    header: "Transport",
    cell: ({ row }) => row.original.transportation || "-",
  },
  {
    id: "purpose",
    header: "Jenis Perjalanan Dinas",
    cell: ({ row }) => row.original.purpose || "-",
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;

      // Handle null status
      if (!status) {
        return h(
          "span",
          {
            class:
              "text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-800",
          },
          "No Status"
        );
      }

      const colorMap: Record<string, string> = {
        waiting: "bg-yellow-100 text-yellow-800",
        approved: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        in_progress: "bg-blue-100 text-blue-800",
      };

      const label = status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase());

      return h(
        "span",
        {
          class: `text-xs font-medium px-2 py-1 rounded ${
            colorMap[status] || "bg-gray-100 text-gray-800"
          }`,
        },
        label
      );
    },
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) =>
      h(UIcon, {
        name: "lucide:eye",
        class: "w-4 h-4 text-gray-600 hover:text-black cursor-pointer",
        onClick: () => {
          selectedId.value = row.original.id;
          openReview.value = true;
        },
      }),
  },
];

const queryClient = useQueryClient();
function refetchBusinessTrips() {
  queryClient.invalidateQueries({ queryKey: ["business-trips"] });
}
</script>

<template>
  <div class="p-6 bg-grey-100 rounded-xs space-y-3">
    <DashboardTableHeaderControls
      v-model:search="search"
      @update-date="handleDateUpdate"
      :collection="'business-trips'"
      :queryParams="currentQueryParams"
    >
      <template #slideover-button>
        <AbsensiFormPerjalananDinas @submitted="refetchBusinessTrips" />
      </template>
    </DashboardTableHeaderControls>
    <DashboardTable
      v-model:page="page"
      v-model:pageSize="pageSize"
      :columns="columns"
      :data="tableData?.data"
      :totalData="tableData?.meta?.filter_count"
    />
  </div>

  <USlideover
    v-model:open="openReview"
    title="Detail Perjalanan Dinas"
    :ui="{
      content: 'w-full max-w-[30vw] m-9 rounded-lg',
      body: 'relative',
      title: 'text-sm font-semibold text-gray-900',
    }"
  >
    <template #body>
      <AbsensiReviewPerjalananDinas v-if="selectedId" :id="selectedId" />
    </template>
  </USlideover>
</template>
