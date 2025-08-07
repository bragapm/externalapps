<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

import { ref, h, computed } from "vue";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import type { Table, Row } from "@tanstack/vue-table";
import { UCheckbox } from "#components";

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

// Fetch data
const { data: medias, isLoading } = useQuery({
  queryKey: ["medias"],
  queryFn: async () => {
    const res = await $fetch("/panel/items/medias", {
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
    });
    return res.data;
  },
});

// Create
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
  },
});

// Update
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
  },
});

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

// Open slideover programmatically (optional)
const openFilterPanel = () => {};
const exportCSV = () => {};

// Columns
const mediaPartnerColumns = [
  {
    id: "select",
    display: true,
    header: ({ table }: { table: Table<MediaPartner> }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : table.getIsAllPageRowsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Select all",
      }),
    cell: ({ row }: { row: Row<MediaPartner> }) =>
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
    cell: ({ row }: { row: Row<MediaPartner> }) =>
      h("span", `CP - ${row.getValue("phone_number")}`),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }: { row: Row<MediaPartner> }) =>
      h("div", { class: "flex gap-2 items-center" }, [
        h(
          "button",
          {
            class: "text-blue-600 text-sm hover:underline",
            onClick: () => {
              formMode.value = "edit";
              form.value = { ...row.original };
              selectedItem.value = row.original;
            },
          },
          "Edit"
        ),
      ]),
  },
];
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
          title="Tambah Media & Publikasi"
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
          />

          <template #body>
            <div class="flex flex-col h-full">
              <div class="flex-1 overflow-y-auto space-y-2">
                <UFormField label="Media Partner">
                  <UInput v-model="form.name" size="lg" class="w-full" />
                </UFormField>
                <UFormField label="Jabatan">
                  <UInput v-model="form.role" size="lg" class="w-full" />
                </UFormField>
                <UFormField label="PIC">
                  <UInput v-model="form.pic" size="lg" class="w-full" />
                </UFormField>
                <UFormField label="No Hp">
                  <UInput
                    v-model="form.phone_number"
                    size="lg"
                    class="w-full"
                  />
                </UFormField>
                <UFormField label="Email">
                  <UInput v-model="form.email" size="lg" class="w-full" />
                </UFormField>
              </div>

              <div class="absolute left-6 right-6 bottom-6 pt-4 mt-4 space-y-4">
                <UButton
                  color="primary"
                  size="xl"
                  class="w-full justify-center flex"
                  @click="handleSubmit"
                >
                  Simpan
                </UButton>

                <UButton
                  size="xl"
                  class="w-full justify-center flex"
                  variant="outline"
                  @click="resetForm"
                >
                  Batal
                </UButton>
              </div>
            </div>
          </template>
        </USlideover>
      </template>
    </DashboardFilterTableHeader>

    <DashboardTable
      :data="medias || []"
      :columns="mediaPartnerColumns"
      :totalData="(medias || []).length"
      v-model:page="page"
      v-model:pageSize="pageSize"
    />
  </div>
</template>
