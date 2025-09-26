<script lang="ts" setup>
definePageMeta({ middleware: "auth" });

import { h, ref, resolveComponent, watch } from "vue";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import type { TableColumn } from "@nuxt/ui";

const UIcon = resolveComponent("UIcon");
const UCheckbox = resolveComponent("UCheckbox");

const startDate = ref();
const endDate = ref();
const search = ref("");
const uploadedBy = ref<string | null>(null);
const currentQueryParams = ref<Record<string, string>>();

const page = ref(1);
const pageSize = ref("10");
const auth = useAuth();
const selectedId = ref<string | null>(null);
const openReview = ref(false);

// Edit functionality states
const openEdit = ref(false);
const editData = ref<any>(null);
const isLoadingEditData = ref(false);

const queryClient = useQueryClient();

const { data: userOptions } = useQuery({
  queryKey: ["users"],
  queryFn: async () => {
    const res = await $fetch<{ data: any[] }>("/panel/users", {});
    return res.data.map((u) => ({
      label: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email,
      value: u.id,
    }));
  },
});

const { data: tableData, isFetching } = useQuery({
  queryKey: [
    "weekly-activities",
    page,
    pageSize,
    startDate,
    endDate,
    search,
    uploadedBy,
  ],
  queryFn: async () => {
    const filters: any[] = [];

    if (startDate.value) {
      filters.push({
        date_created: { _gte: startDate.value },
      });
    }

    if (endDate.value) {
      filters.push({
        date_created: { _lte: endDate.value },
      });
    }

    if (search.value) {
      filters.push({
        _or: [
          { title: { _icontains: search.value } },
          { summary: { _icontains: search.value } },
        ],
      });
    }

    if (uploadedBy.value) {
      const userId =
        typeof uploadedBy.value === "object" && uploadedBy.value !== null
          ? (uploadedBy.value as any).value || uploadedBy.value
          : uploadedBy.value;

      filters.push({
        user_created: { _eq: userId },
      });
    }

    const queryParams: Record<string, string> = {
      fields: [
        "*",
        "user_created.first_name",
        "user_created.last_name",
        "documents.directus_files_id",
        "pics.directus_users_id.first_name",
        "pics.directus_users_id.last_name",
      ].join(","),
      limit: pageSize.value,
      page: String(page.value),
      meta: "filter_count",
    };

    if (filters.length > 0) {
      queryParams.filter =
        filters.length === 1
          ? JSON.stringify(filters[0])
          : JSON.stringify({ _and: filters });
    }

    currentQueryParams.value = queryParams;

    return await $fetch<{
      data: any[];
      meta: { filter_count: number };
    }>(
      `/panel/items/weekly_activities?${new URLSearchParams(queryParams)}`,
      {}
    );
  },
});

// Function to fetch detailed data for editing
async function fetchEditData(id: string) {
  isLoadingEditData.value = true;
  try {
    const response = await $fetch<{
      data: Record<string, any>;
    }>(
      `/panel/items/weekly_activities/${id}?fields=*,daily_activities.id,daily_activities.date,daily_activities.title,document`,
      {}
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching edit data:", error);
    throw error;
  } finally {
    isLoadingEditData.value = false;
  }
}

// Function to handle edit button click
async function handleEditClick(id: string) {
  try {
    const data = await fetchEditData(id);
    editData.value = data;
    selectedId.value = id;
    openEdit.value = true;
  } catch (error) {
    console.error("Failed to load edit data:", error);
    // You might want to show a toast notification here
    alert("Gagal memuat data untuk edit");
  }
}

// Handle successful edit
function handleEditSuccess() {
  queryClient.invalidateQueries({ queryKey: ["weekly-activities"] });
  openEdit.value = false;
  editData.value = null;
  selectedId.value = null;
}

// Handle successful create
function handleCreateSuccess() {
  queryClient.invalidateQueries({ queryKey: ["weekly-activities"] });
}

// Watch for openEdit changes to reset data when modal is closed
watch(openEdit, (newVal) => {
  if (!newVal) {
    editData.value = null;
    selectedId.value = null;
  }
});

const columns: TableColumn<Record<string, any>>[] = [
  {
    id: "select",
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : table.getIsAllPageRowsSelected(),
        "onUpdate:modelValue": (value: any) =>
          table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Select all",
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: any) => row.toggleSelected(!!value),
        "aria-label": "Select row",
      }),
  },
  {
    accessorKey: "title",
    header: "Report Weekly",
    cell: ({ row }) => row.getValue("title") || "-",
  },
  {
    accessorKey: "summary",
    header: "Kesimpulan Weekly",
    cell: ({ row }) => {
      const val = String(row.getValue("summary") || "-");
      return h("span", { class: "truncate max-w-[200px]" }, val);
    },
  },
  {
    id: "diunggah_oleh",
    header: "Diunggah Oleh",
    cell: ({ row }) => {
      const u = row.original.user_created;
      return `${u?.first_name || ""} ${u?.last_name || ""}`.trim() || "-";
    },
  },
  {
    id: "dokumen",
    header: "Dokumen",
    cell: ({ row }) => {
      const fileId = row.original.document;
      if (!fileId) return "-";

      return h(
        "a",
        {
          href: `/panel/assets/${fileId}`,
          target: "_blank",
          class: "text-blue-600 hover:underline",
        },
        "Dokumen"
      );
    },
  },
  {
    id: "updated",
    header: "Last Update",
    cell: ({ row }) => {
      const raw = row.original.date_updated;
      return raw
        ? new Date(raw).toLocaleString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-";
    },
  },
  {
    id: "aksi",
    header: "Action",
    cell: ({ row }) => {
      return h("div", { class: "flex items-center gap-2" }, [
        h(UIcon, {
          name: "lucide:eye",
          class: "w-4 h-4 cursor-pointer hover:text-gray-700",
          onClick: () => {
            selectedId.value = row.original.id;
            openReview.value = true;
          },
        }),
        h(UIcon, {
          name: "lucide:pencil",
          class: "w-4 h-4 cursor-pointer hover:text-gray-700",
          onClick: () => {
            handleEditClick(row.original.id);
          },
        }),
        h(UIcon, {
          name: "lucide:download",
          class: "w-4 h-4 cursor-pointer hover:text-gray-700",
          onClick: () => {
            const fileId = row.original.documents?.[0]?.directus_files_id;
            if (fileId) window.open(`/panel/assets/${fileId}`, "_blank");
          },
        }),
      ]);
    },
  },
];

function handleDateUpdate(startDateInput?: string, endDateInput?: string) {
  startDate.value = startDateInput ?? null;
  endDate.value = endDateInput ?? null;
}
</script>

<template>
  <div class="p-6 bg-white rounded-lg shadow space-y-4">
    <DashboardTableHeaderControls
      v-model:search="search"
      @update-date="handleDateUpdate"
      v-model:selected-user="uploadedBy"
      :collection="'weekly_activities'"
      :queryParams="currentQueryParams"
      :show-user-filter="true"
      :user-options="userOptions"
    >
      <template #slideover-button>
        <USlideover
          title="Buat Weekly Activity"
          :ui="{
            content: 'w-full max-w-[40vw] m-9 rounded-lg',
            body: 'relative',
            title: 'text-sm font-semibold text-gray-900',
          }"
        >
          <UButton
            icon="i-heroicons-plus"
            label="Buat Weekly Activity"
            class="text-sm"
          />

          <template #body>
            <div class="w-full">
              <AktifitasFormWeeklyActivity @success="handleCreateSuccess" />
            </div>
          </template>
        </USlideover>
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

  <!-- Review Modal -->
  <USlideover
    v-model:open="openReview"
    :title="`Review Weekly Activity`"
    :ui="{
      content: 'w-full max-w-[30vw] m-9 rounded-lg',
      body: 'relative',
      title: 'text-sm font-semibold text-gray-900',
    }"
  >
    <template #body>
      <AktifitasDetailWeeklyActivity v-if="selectedId" :id="selectedId" />
    </template>
  </USlideover>

  <!-- Edit Modal -->
  <USlideover
    v-model:open="openEdit"
    title="Edit Weekly Activity"
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
        <AktifitasFormWeeklyActivity
          v-else-if="editData"
          :editData="editData"
          :isEdit="true"
          @success="handleEditSuccess"
        />
      </div>
    </template>
  </USlideover>
</template>
