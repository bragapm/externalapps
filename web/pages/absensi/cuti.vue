<script lang="ts" setup>
definePageMeta({ middleware: "auth" });

import { h, ref, resolveComponent } from "vue";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import type { TableColumn } from "@nuxt/ui";

const UIcon = resolveComponent("UIcon");
const UCheckbox = resolveComponent("UCheckbox");

// Define proper types
interface User {
  first_name?: string;
  last_name?: string;
}

interface LeaveRequest {
  id: string;
  user: User;
  start_date: string;
  end_date: string;
  leave_type?: string;
  reason?: string;
  status: "waiting" | "approved" | "rejected";
  total_days?: number;
}

interface ApiResponse {
  data: LeaveRequest[];
  meta: {
    filter_count: number;
  };
}

const page = ref(1);
const pageSize = ref("10");
const search = ref("");
const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);
const auth = useAuth();
const currentQueryParams = ref<Record<string, string>>();

const selectedId = ref<string | null>(null);
const openReview = ref(false);

const queryClient = useQueryClient();

const { data: tableData, isFetching } = useQuery<ApiResponse>({
  queryKey: ["leave-requests", page, pageSize, startDate, endDate, search],
  queryFn: async (): Promise<ApiResponse> => {
    const filters: any[] = [];

    if (startDate.value) {
      filters.push({ start_date: { _gte: startDate.value } });
    }

    if (endDate.value) {
      filters.push({ end_date: { _lte: endDate.value } });
    }

    if (search.value) {
      filters.push({
        _or: [
          { reason: { _icontains: search.value } },
          { leave_type: { _icontains: search.value } },
        ],
      });
    }

    const queryParams: Record<string, string> = {
      fields: "*,user.first_name,user.last_name",
      limit: pageSize.value,
      page: String(page.value),
      meta: "filter_count",
    };

    if (filters.length === 1) {
      queryParams.filter = JSON.stringify(filters[0]);
    } else if (filters.length > 1) {
      queryParams.filter = JSON.stringify({ _and: filters });
    }

    currentQueryParams.value = queryParams;

    return await $fetch<ApiResponse>(
      `/panel/items/leave_requests?${new URLSearchParams(queryParams)}`,
      {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      }
    );
  },
});

function handleDateUpdate(start?: string, end?: string) {
  startDate.value = start ?? null;
  endDate.value = end ?? null;
}

function handleLeaveRequestSuccess() {
  //  Refetch Fucntion After Submit
  queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
}

// Function to calculate total days between dates
function calculateTotalDays(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return `${diffDays} Hari`;
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
  {
    accessorKey: "iSafe",
    header: "iSafe",
    cell: () => "IDT01A5",
  },
  {
    accessorKey: "nik",
    header: "NIK",
    cell: () => "IDT01A5JWADPKZA999",
  },
  {
    id: "name",
    header: "Nama",
    cell: ({ row }) => {
      const user = row.original.user;
      return `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "-";
    },
  },
  {
    id: "start_date",
    header: "Tanggal Mulai",
    cell: ({ row }) => {
      try {
        return new Date(row.original.start_date).toLocaleDateString("id-ID");
      } catch {
        return "-";
      }
    },
  },
  {
    id: "end_date",
    header: "Tanggal Selesai",
    cell: ({ row }) => {
      try {
        return new Date(row.original.end_date).toLocaleDateString("id-ID");
      } catch {
        return "-";
      }
    },
  },
  {
    id: "leave_type",
    header: "Jenis Cuti",
    cell: ({ row }) => row.original.leave_type || "-",
  },
  {
    id: "reason",
    header: "Alasan",
    cell: ({ row }) => row.original.reason || "-",
  },
  {
    id: "total_days",
    header: "Total Cuti",
    cell: ({ row }) => {
      if (row.original.total_days) {
        return `${row.original.total_days} Hari`;
      }
      // Calculate from start and end dates if total_days is not provided
      if (row.original.start_date && row.original.end_date) {
        return calculateTotalDays(
          row.original.start_date,
          row.original.end_date
        );
      }
      return "-"; // fallback
    },
  },

  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const colorMap: Record<string, string> = {
        waiting: "bg-yellow-100 text-yellow-800",
        approved: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        in_progress: "bg-blue-100 text-blue-800",
      };

      const formattedStatus = status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase());

      return h(
        "span",
        {
          class: `text-xs font-medium px-2 py-1 rounded ${
            colorMap[status] || "bg-gray-100 text-gray-800"
          }`,
        },
        formattedStatus
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
</script>

<template>
  <div class="p-6 bg-grey-100 rounded-xs space-y-3">
    <DashboardTableHeaderControls
      v-model:search="search"
      @update-date="handleDateUpdate"
      :collection="'leave-requests'"
      :queryParams="currentQueryParams"
    >
      <template #slideover-button>
        <AbsensiFormCuti @success="handleLeaveRequestSuccess" />
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
    title="Review Pengajuan Cuti"
    :ui="{
      content: 'w-full max-w-[30vw] m-9 rounded-lg',
      body: 'relative',
      title: 'text-sm font-semibold text-gray-900',
    }"
  >
    <template #body>
      <AbsensiDetailCuti v-if="selectedId" :id="selectedId" />
    </template>
  </USlideover>
</template>
