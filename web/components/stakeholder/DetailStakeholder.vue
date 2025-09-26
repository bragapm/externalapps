<script lang="ts" setup>
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import { ref, reactive, watch, nextTick } from "vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";

interface Stakeholder {
  id: number;
  user_created: string;
  date_created: string;
  user_updated: string | null;
  date_updated: string | null;
  name: string;
  organization: string;
  address: string;
  phone_number: string;
  email: string;
  sentiment: "positive" | "negative";
  position: string;
  location: string;
}

const authStore = useAuth();
const queryClient = useQueryClient();

// Props
const props = defineProps<{
  modelValue?: boolean;
  stakeholder?: Partial<Stakeholder> | null;
}>();

const emit = defineEmits<{
  (e: "success"): void;
  (e: "update:modelValue", value: boolean): void;
}>();

// Local open state
const open = ref(props.modelValue || false);

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newVal) => {
    open.value = newVal || false;
    if (newVal) {
      if (props.stakeholder?.id) {
        populateForm();
      } else {
        resetForm();
      }
    }
  },
  { immediate: true }
);

// Watch for internal open changes
watch(open, (newVal) => {
  emit("update:modelValue", newVal);
});

// Validation Schema
const schema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  organization: z.string().min(1, "Organisasi wajib diisi"),
  address: z.string().optional().or(z.literal("")),
  phone_number: z.string().optional().or(z.literal("")),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  sentiment: z.enum(["positive", "negative"]),
  position: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  attachment: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size < 5 * 1024 * 1024, {
      message: "Ukuran file maksimal 5MB",
    }),
});

type Schema = z.output<typeof schema>;

// Form state
const state = reactive<Schema>({
  name: "",
  organization: "",
  address: "",
  phone_number: "",
  email: "",
  sentiment: "positive",
  position: "",
  location: "",
  attachment: undefined,
});

// Sentiment Options
const sentimentOptions = [
  { label: "Positif", value: "positive" },
  { label: "Negatif", value: "negative" },
];

function populateForm() {
  if (props.stakeholder) {
    state.name = props.stakeholder.name || "";
    state.organization = props.stakeholder.organization || "";
    state.address = props.stakeholder.address || "";
    state.phone_number = props.stakeholder.phone_number || "";
    state.email = props.stakeholder.email || "";
    state.sentiment = props.stakeholder.sentiment || "positive";
    state.position = props.stakeholder.position || "";
    state.location = props.stakeholder.location || "";
    state.attachment = undefined; // Don't prefill file
  }
}

function resetForm() {
  state.name = "";
  state.organization = "";
  state.address = "";
  state.phone_number = "";
  state.email = "";
  state.sentiment = "positive";
  state.position = "";
  state.location = "";
  state.attachment = undefined;
}

// Mutation for creating/updating stakeholder
const stakeholderMutation = useMutation({
  mutationFn: async (data: { formData: Schema; isEdit: boolean }) => {
    const token = authStore.accessToken;
    let uploadedAssetId: string | null = null;

    // Step 1: Upload file if exists
    if (data.formData.attachment) {
      const assetForm = new FormData();
      assetForm.append("file", data.formData.attachment);

      const uploadRes = await fetch("/panel/files", {
        method: "POST",
        body: assetForm,
      });

      const uploadResult = await uploadRes.json();
      if (!uploadRes.ok || !uploadResult.data?.id) {
        throw new Error("Gagal mengunggah file");
      }
      uploadedAssetId = uploadResult.data.id;
    }

    // Step 2: Submit stakeholder (POST or PATCH)
    const url = data.isEdit
      ? `/panel/items/stakeholders/${props.stakeholder?.id}`
      : `/panel/items/stakeholders`;

    const method = data.isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,

      body: JSON.stringify({
        name: data.formData.name,
        organization: data.formData.organization,
        address: data.formData.address || null,
        phone_number: data.formData.phone_number || null,
        email: data.formData.email || null,
        sentiment: data.formData.sentiment,
        position: data.formData.position || null,
        location: data.formData.location || null,
        document: uploadedAssetId,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result?.errors?.[0]?.message || "Gagal menyimpan data");
    }

    return result;
  },
  onSuccess: () => {
    // Refetch stakeholders data
    queryClient.invalidateQueries({ queryKey: ["stakeholders"] });

    // Close modal and emit success
    open.value = false;
    emit("success");

    // Reset form for next use
    resetForm();
  },
  onError: (error) => {
    console.error("Mutation error:", error);
    // You can add toast notification here if you have it
  },
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const isEdit = !!props.stakeholder?.id;

  stakeholderMutation.mutate({
    formData: event.data,
    isEdit,
  });
}

// Close handler
function handleClose() {
  open.value = false;
  resetForm();
}
</script>

<template>
  <USlideover
    v-model:open="open"
    :title="props.stakeholder?.id ? 'Detail Stakeholder' : 'Detail Stakeholder'"
    :ui="{
      content: 'w-full max-w-[40vw] m-9 rounded-lg',
      body: 'relative p-6',
      title: 'text-lg font-semibold text-gray-900 mb-4',
    }"
    @update:open="handleClose"
  >
    <!-- Form Body -->
    <template #body>
      <div class="w-full">
        <UForm
          id="stakeholder-form"
          :schema="schema"
          :state="state"
          class="space-y-4"
          @submit="onSubmit"
        >
          <UFormField label="Nama " name="name" required>
            <UInput
              v-model="state.name"
              class="w-full"
              placeholder="Masukkan nama stakeholder"
            />
          </UFormField>

          <UFormField label="Organisasi " name="organization" required>
            <UInput
              v-model="state.organization"
              class="w-full"
              placeholder="Masukkan nama organisasi"
            />
          </UFormField>

          <UFormField label="Alamat" name="address">
            <UTextarea
              v-model="state.address"
              class="w-full"
              placeholder="Masukkan alamat"
              :rows="3"
            />
          </UFormField>

          <UFormField label="Nomor Telepon" name="phone_number">
            <UInput
              v-model="state.phone_number"
              class="w-full"
              placeholder="Masukkan nomor telepon"
            />
          </UFormField>

          <UFormField label="Email" name="email">
            <UInput
              v-model="state.email"
              type="email"
              class="w-full"
              placeholder="Masukkan alamat email"
            />
          </UFormField>

          <UFormField label="Sentimen" name="sentiment" required>
            <USelect
              v-model="state.sentiment"
              :items="sentimentOptions"
              value-attribute="value"
              option-attribute="label"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Jabatan" name="position">
            <UInput
              v-model="state.position"
              class="w-full"
              placeholder="Masukkan jabatan"
            />
          </UFormField>

          <UFormField label="Lokasi" name="location">
            <UInput
              v-model="state.location"
              class="w-full"
              placeholder="Masukkan lokasi"
            />
          </UFormField>

          <UFormField name="attachment">
            <CoreCustomFileInput
              v-model="state.attachment"
              label="Dokumen Pendukung"
              name="attachment"
              placeholder="Pilih file..."
              accept=".pdf,.docx,.doc"
              class="w-full"
            />
          </UFormField>
        </UForm>
      </div>
    </template>

    <!-- Form Footer -->
    <template #footer>
      <div class="flex flex-col gap-3 border-gray-200 w-full">
        <UButton
          type="submit"
          form="stakeholder-form"
          :loading="stakeholderMutation.isPending.value"
          :disabled="stakeholderMutation.isPending.value"
          size="lg"
          class="justify-center"
        >
          {{ props.stakeholder?.id ? "Update" : "Tambah" }}
        </UButton>
        <UButton
          type="button"
          variant="outline"
          @click="handleClose"
          :disabled="stakeholderMutation.isPending.value"
          size="lg"
          class="justify-center"
        >
          Cancel
        </UButton>
      </div>
    </template>
  </USlideover>
</template>
