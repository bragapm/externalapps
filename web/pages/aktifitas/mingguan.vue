<script lang="ts" setup>
definePageMeta({ middleware: "auth" });

import { h, ref, resolveComponent } from "vue";
import { useQuery } from "@tanstack/vue-query";
import type { TableColumn } from "@nuxt/ui";

const UIcon = resolveComponent("UIcon");
const UCheckbox = resolveComponent("UCheckbox");

const startDate = ref();
const endDate = ref();
const search = ref("");
const currentQueryParams = ref<Record<string, string>>();

const page = ref(1);
const pageSize = ref("10");
const auth = useAuth();
const selectedId = ref<string | null>(null);
const openReview = ref(false);

const { data: tableData, isFetching } = useQuery({
  queryKey: ["weekly-activities", page, pageSize, startDate, endDate, search], // Add filter dependencies
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
      if (filters.length === 1) {
        queryParams.filter = JSON.stringify(filters[0]);
      } else {
        queryParams.filter = JSON.stringify({ _and: filters });
      }
    }

    currentQueryParams.value = queryParams;

    return await $fetch<{
      data: any[];
      meta: { filter_count: number };
    }>(`/panel/items/weekly_activities?${new URLSearchParams(queryParams)}`, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
  },
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
      const docs = row.original.documents;
      if (!docs?.length) return "-";
      const fileId = docs[0]?.directus_files_id;
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
      :collection="'business_trips'"
      :queryParams="currentQueryParams"
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
              <AktifitasFormWeeklyActivity />
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

  <USlideover
    v-model:open="openReview"
    :title="`Review Weekly Activity`"
    :ui="{
      content: 'w-full max-w-[30vw] m-9 rounded-lg',
      body: 'relative',
      title: 'text-sm font-semibold text-gray-900',
    }"
  >
    <template #body> </template>
  </USlideover>
</template>
