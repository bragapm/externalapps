<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

import { ref, h, computed } from "vue";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import type { Table, Row } from "@tanstack/vue-table";
import { UCheckbox } from "#components";

const searchTerm = ref("");
const authStore = useAuth();
const queryClient = useQueryClient();

const openFilterPanel = () => {
  // logic to open filter slideover or dropdown
};

const exportCSV = () => {
  // logic to download CSV
};

// Define the data structure type based on API response
interface VillageProfileData {
  id: number;
  user_created: string;
  date_created: string;
  user_updated: string | null;
  date_updated: string | null;
  name: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  attachments: any[];
}

// Extended interface for table display
interface LocationData extends VillageProfileData {
  namaDesa: string;
  lokasi: string;
  status: boolean;
  attachment: string;
}

const page = ref(1);
const pageSize = ref("10");
const startDate = ref();
const endDate = ref();
const search = ref("");
const currentQueryParams = ref<Record<string, string>>();
const isSlideoverOpen = ref(false);

function handleDateUpdate(startDateInput?: string, endDateInput?: string) {
  startDate.value = startDateInput ?? null;
  endDate.value = endDateInput ?? null;
}

// 🟢 Fetch village profiles from Directus
const {
  data: villageProfilesData,
  isLoading,
  error,
} = useQuery<VillageProfileData[]>({
  queryKey: ["village-profiles"],
  queryFn: async () => {
    const res = await $fetch<{ data: VillageProfileData[] }>(
      "/panel/items/village_profiles",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${authStore.accessToken}` },
        params: {
          fields: "*",
        },
      }
    );
    return res.data;
  },
});

// 🔄 Toggle status mutation (if you want to add status functionality)
const { mutate: toggleStatus } = useMutation({
  mutationFn: async ({ id, newValue }: { id: number; newValue: boolean }) => {
    await $fetch(`/panel/items/village_profiles/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
      body: { status: newValue },
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["village-profiles"] });
  },
});

// 🗑️ Delete mutation
const { mutate: deleteVillageProfile, isPending: isDeleting } = useMutation({
  mutationFn: async (id: number) => {
    await $fetch(`/panel/items/village_profiles/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["village-profiles"] });
  },
});

const handleDelete = (id: number) => {
  if (confirm("Apakah Anda yakin ingin menghapus profil desa ini?")) {
    deleteVillageProfile(id);
  }
};

// Transform API data for table display
const locationData = computed<LocationData[]>(() => {
  if (!villageProfilesData.value) return [];

  return villageProfilesData.value.map((item) => ({
    ...item,
    namaDesa: item.name,
    lokasi: `${item.location.coordinates[1].toFixed(
      4
    )}° S, ${item.location.coordinates[0].toFixed(4)}° E`,
    status: true, // Default status, you can add actual status field to API
    attachment:
      item.attachments.length > 0
        ? `${item.attachments.length} file(s)`
        : "No attachments",
  }));
});

const locationColumns = [
  {
    id: "select",
    header: ({ table }: { table: Table<LocationData> }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : table.getIsAllPageRowsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Select all",
      }),
    cell: ({ row }: { row: Row<LocationData> }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        "aria-label": "Select row",
      }),
  },
  {
    accessorKey: "namaDesa",
    header: "Nama Desa",
  },
  {
    accessorKey: "lokasi",
    header: "Lokasi",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: Row<LocationData> }) => {
      const status = row.getValue("status") as boolean;
      const id = row.original.id;

      return h("div", { class: "flex items-center gap-2" }, [
        h(
          "button",
          {
            class: `relative w-10 h-5 rounded-full transition duration-300 ${
              status ? "bg-green-600" : "bg-gray-500"
            }`,
            onClick: () => {
              toggleStatus({ id, newValue: !status });
            },
          },
          [
            h("div", {
              class: `bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                status ? "translate-x-5" : ""
              }`,
            }),
          ]
        ),
        h("span", { class: "text-sm" }, status ? "Aktif" : "Tidak Aktif"),
      ]);
    },
  },
  {
    accessorKey: "attachment",
    header: "Attachment",
    cell: ({ row }: { row: Row<LocationData> }) => {
      const attachment = row.getValue("attachment") as string;
      const attachments = row.original.attachments;

      return h(
        "div",
        { class: "flex items-center gap-2" },
        attachments.length > 0
          ? [
              h("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                class: "w-4 h-4 text-blue-600",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                innerHTML: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>`,
              }),
              h(
                "span",
                {
                  class:
                    "text-blue-600 hover:text-blue-800 cursor-pointer text-sm",
                  onClick: () => {
                    console.log("Opening attachments:", attachments);
                  },
                },
                attachment
              ),
            ]
          : [h("span", { class: "text-gray-400 text-sm" }, "No attachments")]
      );
    },
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }: { row: Row<LocationData> }) => {
      const id = row.original.id;

      return h("div", { class: "flex gap-2 items-center" }, [
        // View icon
        h("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          class:
            "w-4 h-4 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          innerHTML: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>`,
          title: "View",
        }),
        // Edit icon
        h("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          class:
            "w-4 h-4 text-blue-600 cursor-pointer hover:text-blue-800 transition-colors",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          innerHTML: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>`,
          title: "Edit",
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
          title: "Delete",
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
          title="Tambah Profil Desa"
          :ui="{
            content: 'w-full max-w-[40vw] m-9 rounded-lg ',
            body: 'flex-1 overflow-y-auto relative',
            title: 'text-sm font-semibold text-gray-900',
          }"
        >
          <UButton
            icon="i-heroicons-plus"
            label="Tambah Profil Desa"
            class="text-sm"
            size="lg"
            @click="isSlideoverOpen = true"
          />

          <template #body>
            <div class="w-full">
              <DataFormProfilDesa
                @success="
                  () => {
                    isSlideoverOpen = false;
                    queryClient.invalidateQueries({
                      queryKey: ['village-profiles'],
                    });
                  }
                "
              />
            </div>
          </template>
        </USlideover>
      </template>
    </DashboardFilterTableHeader>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"
      ></div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-md p-4"
    >
      <div class="text-red-700">
        <h3 class="text-sm font-medium">Error loading data</h3>
        <p class="text-sm mt-1">
          {{ error.message || "Failed to fetch village profiles" }}
        </p>
      </div>
    </div>

    <!-- Table -->
    <DashboardTable
      v-else
      :data="locationData"
      :columns="locationColumns"
      :totalData="locationData.length"
      v-model:page="page"
      v-model:pageSize="pageSize"
      :loading="isLoading"
    />
  </div>
</template>
