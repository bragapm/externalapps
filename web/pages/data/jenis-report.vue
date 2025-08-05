<script setup lang="ts">
definePageMeta({ middleware: "auth" });

import { ref, h } from "vue";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import type { Table, Row } from "@tanstack/vue-table";
import { UCheckbox } from "#components";

// Single valid interface
interface StatusData {
  id: number;
  name: string;
  active: boolean;
}
const authStore = useAuth();
const page = ref(1);
const pageSize = ref("10");
const searchTerm = ref("");
const queryClient = useQueryClient();

const newReportType = ref(""); // Form input
const isSlideoverOpen = ref(false); // Slideover open state

// 🟢 Fetch report types from Directus
const { data: statusData, isLoading } = useQuery<StatusData[]>({
  queryKey: ["report-types"],
  queryFn: async () => {
    const res = await $fetch<{ data: StatusData[] }>(
      "/panel/items/report_types",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${authStore.accessToken}` },
        params: {
          fields: ["id", "name", "active"],
        },
      }
    );
    return res.data;
  },
});

// Post Data
const { mutate: createReportType, isPending: isCreating } = useMutation({
  mutationFn: async (payload: { name: string }) => {
    await $fetch("/panel/items/report_types", {
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
      method: "POST",
      body: payload,
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["report-types"] }); // Refresh table
    newReportType.value = ""; // Clear input
    isSlideoverOpen.value = false; // Close modal
  },
});

// 🔄 Toggle mutation
const { mutate: toggleStatus } = useMutation({
  mutationFn: async ({ id, newValue }: { id: number; newValue: boolean }) => {
    await $fetch(`/panel/items/report_types/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
      body: { active: newValue },
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["report-types"] });
  },
});

// 🗑️ Delete mutation
const { mutate: deleteReportType, isPending: isDeleting } = useMutation({
  mutationFn: async (id: number) => {
    await $fetch(`/panel/items/report_types/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["report-types"] });
  },
});

// Form handlers
const handleSubmit = () => {
  if (newReportType.value.trim()) {
    createReportType({ name: newReportType.value.trim() });
  }
};

const handleCancel = () => {
  newReportType.value = "";
  isSlideoverOpen.value = false;
};

const handleDelete = (id: number) => {
  if (confirm("Apakah Anda yakin ingin menghapus jenis report ini?")) {
    deleteReportType(id);
  }
};

const openFilterPanel = () => {};
const exportCSV = () => {};

// ✅ Columns config
const statusColumns = [
  {
    id: "select",
    header: ({ table }: { table: Table<StatusData> }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : table.getIsAllPageRowsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Select all",
      }),
    cell: ({ row }: { row: Row<StatusData> }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        "aria-label": "Select row",
      }),
  },
  {
    accessorKey: "name",
    header: "Jenis Report",
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }: { row: Row<StatusData> }) => {
      const isActive = row.getValue("active") as boolean;
      const id = row.original.id;

      return h("div", { class: "flex items-center gap-2" }, [
        h(
          "button",
          {
            class: `relative w-10 h-5 rounded-full transition duration-300 ${
              isActive ? "bg-red-600" : "bg-gray-500"
            }`,
            onClick: () => {
              toggleStatus({ id, newValue: !isActive });
            },
          },
          [
            h("div", {
              class: `bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                isActive ? "translate-x-5" : ""
              }`,
            }),
          ]
        ),
        h("span", { class: "text-sm" }, isActive ? "Aktif" : "Tidak Aktif"),
      ]);
    },
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }: { row: Row<StatusData> }) => {
      const id = row.original.id;

      return h("div", { class: "flex gap-2 items-center" }, [
        // View/Edit icon
        h("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          class:
            "w-4 h-4 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          innerHTML: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>`,
        }),
        // Delete icon
        h("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          class:
            "w-4 h-4 text-red-600 cursor-pointer hover:text-red-800 transition-colors",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          onClick: () => handleDelete(id),
          innerHTML: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>`,
        }),
      ]);
    },
  },
] as any;
</script>

<template>
  <div class="p-6 bg-white rounded-lg shadow space-y-4">
    <DashboardFilterTableHeader
      @filterClick="openFilterPanel"
      @downloadClick="exportCSV"
      @updateSearch="(val) => (searchTerm = val)"
    >
      <template #slideover-button>
        <USlideover
          v-model="isSlideoverOpen"
          title="Tambah Jenis Report"
          :ui="{
            content: 'w-full max-w-[40vw] m-9 rounded-lg ',
            body: 'flex-1 overflow-y-auto relative',
            title: 'text-sm font-semibold text-gray-900',
          }"
        >
          <UButton
            icon="i-heroicons-plus"
            label="Tambah Jenis Report"
            class="text-sm"
            size="lg"
            @click="isSlideoverOpen = true"
          />

          <template #body>
            <form @submit.prevent="handleSubmit" class="flex flex-col h-full">
              <div class="flex-1 overflow-y-auto space-y-2">
                <UFormField label="Jenis Report" required>
                  <UInput
                    v-model="newReportType"
                    size="lg"
                    class="w-full"
                    placeholder="Masukkan jenis report"
                    :disabled="isCreating"
                  />
                </UFormField>
              </div>

              <div class="absolute left-6 right-6 bottom-6 pt-4 mt-4 space-y-4">
                <UButton
                  type="submit"
                  color="primary"
                  size="xl"
                  class="w-full justify-center flex"
                  :loading="isCreating"
                  :disabled="!newReportType.trim() || isCreating"
                >
                  {{ isCreating ? "Menyimpan..." : "Simpan" }}
                </UButton>

                <UButton
                  type="button"
                  size="xl"
                  class="w-full justify-center flex"
                  variant="outline"
                  @click="handleCancel"
                  :disabled="isCreating"
                >
                  Batal
                </UButton>
              </div>
            </form>
          </template>
        </USlideover>
      </template>
    </DashboardFilterTableHeader>

    <DashboardTable
      :data="statusData || []"
      :columns="statusColumns"
      :totalData="statusData?.length || 0"
      v-model:page="page"
      v-model:pageSize="pageSize"
      :loading="isLoading"
    />
  </div>
</template>
