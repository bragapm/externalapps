<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

import { ref, h, computed } from "vue";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import type { Table, Row } from "@tanstack/vue-table";
import { UCheckbox } from "#components";

// State Management
const searchTerm = ref("");
const queryClient = useQueryClient();
const authStore = useAuth();
const page = ref(1);
const pageSize = ref("10");

// Types
interface MediaPartner {
  id?: number;
  name: string;
  role: string;
  pic: string;
  phone_number: string;
  email: string | null;
}

interface ApiResponse {
  data: MediaPartner[];
}

// Form State
const form = ref<MediaPartner>({
  name: "",
  role: "",
  pic: "",
  phone_number: "",
  email: "",
});

const formMode = ref<"create" | "edit">("create");
const selectedItem = ref<MediaPartner | null>(null);
const isSlideoverOpen = ref(false);
const openEdit = ref(false);

// API Queries
const { data: medias, isLoading } = useQuery({
  queryKey: ["medias"],
  queryFn: async (): Promise<MediaPartner[]> => {
    const res = await $fetch<ApiResponse>("/panel/items/medias", {
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
    });
    return res.data;
  },
});

// Mutations
const createMedia = useMutation({
  mutationFn: async (payload: MediaPartner) => {
    return await $fetch("/panel/items/medias", {
      method: "POST",
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
      body: payload,
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["medias"] });
    resetForm();
    isSlideoverOpen.value = false;
  },
});

const updateMedia = useMutation({
  mutationFn: async (payload: MediaPartner) => {
    return await $fetch(`/panel/items/medias/${payload.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
      body: payload,
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["medias"] });
    resetForm();
    openEdit.value = false;
  },
});

const deleteMedia = useMutation({
  mutationFn: async (id: number) => {
    return await $fetch(`/panel/items/medias/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["medias"] });
  },
});

const handleDelete = async (id: number) => {
  if (confirm("Yakin ingin menghapus media ini?")) {
    await deleteMedia.mutateAsync(id);
  }
};

// Form Handlers
const handleSubmit = async () => {
  if (formMode.value === "create") {
    await createMedia.mutateAsync(form.value);
  } else if (formMode.value === "edit" && form.value.id) {
    await updateMedia.mutateAsync(form.value);
  }
};

const resetForm = () => {
  formMode.value = "create";
  selectedItem.value = null;
  form.value = {
    name: "",
    role: "",
    pic: "",
    phone_number: "",
    email: "",
  };
};

const openCreateModal = () => {
  resetForm();
  formMode.value = "create";
  isSlideoverOpen.value = true;
};

const openEditModal = (item: MediaPartner) => {
  formMode.value = "edit";
  form.value = { ...item };
  selectedItem.value = item;
  openEdit.value = true;
};

// Utility Functions
const openFilterPanel = () => {};
const exportCSV = () => {};

// Computed Properties
const slideoverTitle = computed(() =>
  formMode.value === "create"
    ? "Tambah Media & Publikasi"
    : "Edit Media & Publikasi"
);

// Table Columns
const mediaPartnerColumns = [
  {
    id: "select",
    header: ({ table }: { table: Table<any> }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : table.getIsAllPageRowsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Select all",
      }),
    cell: ({ row }: { row: Row<any> }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        "aria-label": "Select row",
      }),
  },
  {
    accessorKey: "name",
    header: "Nama Media Partner",
  },
  {
    accessorKey: "pic",
    header: "PIC",
  },
  {
    accessorKey: "role",
    header: "Jabatan",
  },
  {
    accessorKey: "phone_number",
    header: "Kontak",
    cell: ({ row }: { row: Row<any> }) =>
      h("span", `CP - ${row.getValue("phone_number")}`),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }: { row: Row<any> }) =>
      h("div", { class: "flex gap-2 items-center" }, [
        // 🖊️ Edit icon
        h("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          class:
            "w-4 h-4 text-blue-600 cursor-pointer hover:text-blue-800 transition-colors",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          onClick: () => openEditModal(row.original),
          innerHTML: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>`,
          title: "Edit",
        }),

        // 🗑️ Delete icon
        h("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          class:
            "w-4 h-4 text-red-600 cursor-pointer hover:text-red-800 transition-colors",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          onClick: () => handleDelete(row.original.id!),
          innerHTML: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>`,
          title: "Delete",
        }),
      ]),
  },
];
</script>

<template>
  <div class="p-6 bg-white rounded-lg shadow space-y-4">
    <!-- Header Section -->
    <DashboardFilterTableHeader
      @filterClick="openFilterPanel"
      @downloadClick="exportCSV"
      @updateSearch="(val) => (searchTerm = val)"
    >
      <template #slideover-button>
        <!-- Create Slideover -->
        <USlideover
          v-model="isSlideoverOpen"
          :title="slideoverTitle"
          :ui="{
            content: 'w-full max-w-[40vw] m-9 rounded-lg',
            body: 'flex-1 overflow-y-auto relative',
            title: 'text-sm font-semibold text-gray-900',
          }"
        >
          <UButton
            icon="i-heroicons-plus"
            label="Tambah Media & Publikasi"
            class="text-sm"
            size="lg"
            @click="openCreateModal"
          />

          <template #body>
            <div class="flex flex-col h-full">
              <!-- Form Fields -->
              <div class="flex-1 overflow-y-auto space-y-4 pr-2">
                <UFormField label="Media Partner">
                  <UInput
                    v-model="form.name"
                    size="lg"
                    class="w-full"
                    placeholder="Masukkan nama media partner"
                  />
                </UFormField>

                <UFormField label="Jabatan">
                  <UInput
                    v-model="form.role"
                    size="lg"
                    class="w-full"
                    placeholder="Masukkan jabatan"
                  />
                </UFormField>

                <UFormField label="PIC">
                  <UInput
                    v-model="form.pic"
                    size="lg"
                    class="w-full"
                    placeholder="Masukkan nama PIC"
                  />
                </UFormField>

                <UFormField label="No Hp">
                  <UInput
                    v-model="form.phone_number"
                    size="lg"
                    class="w-full"
                    placeholder="Masukkan nomor HP"
                  />
                </UFormField>

                <UFormField label="Email">
                  <UInput
                    v-model="form.email"
                    size="lg"
                    class="w-full"
                    placeholder="Masukkan email"
                  />
                </UFormField>
              </div>

              <!-- Action Buttons -->
              <div
                class="absolute left-6 right-6 bottom-6 pt-4 mt-4 space-y-4 bg-white border-t"
              >
                <UButton
                  color="primary"
                  size="xl"
                  class="w-full justify-center flex"
                  @click="handleSubmit"
                >
                  {{ formMode === "create" ? "Simpan" : "Update" }}
                </UButton>

                <UButton
                  size="xl"
                  class="w-full justify-center flex"
                  variant="outline"
                  @click="isSlideoverOpen = false"
                >
                  Batal
                </UButton>
              </div>
            </div>
          </template>
        </USlideover>

        <!-- Edit Slideover -->
        <USlideover
          v-model:open="openEdit"
          title="Edit Media & Publikasi"
          :ui="{
            content: 'w-full max-w-[40vw] m-9 rounded-lg',
            body: 'flex-1 overflow-y-auto relative',
            title: 'text-sm font-semibold text-gray-900',
          }"
        >
          <template #body>
            <div class="flex flex-col h-full">
              <!-- Form Fields -->
              <div class="flex-1 overflow-y-auto space-y-4 pr-2">
                <UFormField label="Media Partner">
                  <UInput
                    v-model="form.name"
                    size="lg"
                    class="w-full"
                    placeholder="Masukkan nama media partner"
                  />
                </UFormField>

                <UFormField label="Jabatan">
                  <UInput
                    v-model="form.role"
                    size="lg"
                    class="w-full"
                    placeholder="Masukkan jabatan"
                  />
                </UFormField>

                <UFormField label="PIC">
                  <UInput
                    v-model="form.pic"
                    size="lg"
                    class="w-full"
                    placeholder="Masukkan nama PIC"
                  />
                </UFormField>

                <UFormField label="No Hp">
                  <UInput
                    v-model="form.phone_number"
                    size="lg"
                    class="w-full"
                    placeholder="Masukkan nomor HP"
                  />
                </UFormField>

                <UFormField label="Email">
                  <UInput
                    v-model="form.email"
                    size="lg"
                    class="w-full"
                    placeholder="Masukkan email"
                  />
                </UFormField>
              </div>

              <!-- Action Buttons -->
              <div
                class="absolute left-6 right-6 bottom-6 pt-4 mt-4 space-y-4 bg-white border-t"
              >
                <UButton
                  color="primary"
                  size="xl"
                  class="w-full justify-center flex"
                  @click="handleSubmit"
                >
                  {{ formMode === "create" ? "Simpan" : "Update" }}
                </UButton>

                <UButton
                  size="xl"
                  class="w-full justify-center flex"
                  variant="outline"
                  @click="openEdit = false"
                >
                  Batal
                </UButton>
              </div>
            </div>
          </template>
        </USlideover>
      </template>
    </DashboardFilterTableHeader>

    <!-- Data Table -->
    <DashboardTable
      :data="medias || []"
      :columns="mediaPartnerColumns"
      :totalData="(medias || []).length"
      v-model:page="page"
      v-model:pageSize="pageSize"
    />
  </div>
</template>
