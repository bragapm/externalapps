<script lang="ts" setup>
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import { ref, reactive, watch } from "vue";

const authStore = useAuth();
const toast = useToast();

const open = ref(false);
const emit = defineEmits(["success"]);

const props = defineProps<{
  editId?: string | null;
  editData?: any;
}>();

// Schema validation
const schema = z
  .object({
    start_date: z.string(),
    end_date: z.string(),
    reason: z.string(),
    leave_type: z.string({ required_error: "Jenis cuti wajib dipilih" }),
    attachment: z
      .instanceof(File)
      .optional()
      .refine((file) => !file || file.size < 5 * 1024 * 1024, {
        message: "Ukuran file maksimal 5MB",
      }),
  })
  .refine(
    ({ start_date, end_date }) => new Date(start_date) <= new Date(end_date),
    {
      message: "Tanggal selesai harus setelah tanggal mulai",
      path: ["end_date"],
    }
  );

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  start_date: undefined,
  end_date: undefined,
  reason: undefined,
  leave_type: undefined,
  attachment: undefined,
});

const leaveTypeOptions = [
  { label: "Cuti Tahunan", value: "cuti_tahunan" },
  { label: "Cuti Sakit", value: "cuti_sakit" },
  { label: "Cuti Melahirkan", value: "cuti_melahirkan" },
];

watch(
  () => props.editId,
  (newId) => {
    if (newId && props.editData) {
      state.start_date = props.editData.start_date?.split("T")[0];
      state.end_date = props.editData.end_date?.split("T")[0];
      state.reason = props.editData.reason;
      state.leave_type = props.editData.leave_type;
      state.attachment = undefined;
    }
  },
  { immediate: true }
);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const token = authStore.accessToken;

  if (!token) {
    toast.add({
      title: "Error",
      description: "Token tidak tersedia. Silakan login ulang.",
    });
    return;
  }

  let uploadedAssetId: string | null = null;

  // Step 1: Upload attachment to /assets
  if (event.data.attachment) {
    try {
      const assetForm = new FormData();
      assetForm.append("file", event.data.attachment);

      const uploadRes = await fetch("/panel/files", {
        method: "POST",
        body: assetForm,
      });

      const uploadResult = await uploadRes.json();

      if (!uploadRes.ok || !uploadResult.data?.id) {
        throw new Error("Gagal mengunggah file");
      }

      uploadedAssetId = uploadResult.data.id;
    } catch (err: any) {
      toast.add({
        title: "Upload Gagal",
        description: err.message || "Terjadi kesalahan saat mengunggah file",
      });
      return;
    }
  }

  // Step 2: Submit leave request
  try {
    const payload: any = {
      start_date: event.data.start_date,
      end_date: event.data.end_date,
      reason: event.data.reason,
      leave_type: event.data.leave_type,
    };

    if (!props.editId) {
      payload.status = "waiting";
    }

    if (uploadedAssetId) {
      payload.document = uploadedAssetId;
    }

    const url = props.editId
      ? `/panel/items/leave_requests/${props.editId}`
      : `/panel/items/leave_requests`;

    const method = props.editId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(
        result?.errors?.[0]?.message || "Gagal menyimpan pengajuan cuti"
      );
    }

    toast.add({
      title: "Berhasil",
      description: props.editId
        ? "Pengajuan cuti berhasil diperbarui."
        : "Pengajuan cuti berhasil dikirim.",
    });

    if (!props.editId) {
      open.value = false;
    }

    emit("success");

    Object.keys(state).forEach((key) => {
      state[key as keyof Schema] = undefined;
    });
  } catch (err: any) {
    toast.add({
      title: "Gagal",
      description: err.message || "Terjadi kesalahan saat menyimpan data",
    });
  }
}

watch(open, (isOpen) => {
  if (!isOpen && !props.editId) {
    Object.keys(state).forEach((key) => {
      state[key as keyof Schema] = undefined;
    });
  }
});
</script>

<template>
  <div v-if="editId">
    <UForm
      id="cuti-form-edit"
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <div class="flex gap-2 w-full">
        <UFormField label="Tanggal Mulai" name="start_date">
          <UInput v-model="state.start_date" type="date" class="w-full" />
        </UFormField>

        <UFormField label="Tanggal Selesai" name="end_date">
          <UInput v-model="state.end_date" type="date" class="w-full" />
        </UFormField>
      </div>

      <UFormField label="Jenis Cuti" name="leave_type">
        <USelect
          v-model="state.leave_type"
          :items="leaveTypeOptions"
          placeholder="Pilih jenis cuti"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Alasan" name="reason">
        <UTextarea v-model="state.reason" :rows="5" class="w-full" />
      </UFormField>

      <CoreCustomFileInput
        v-model="state.attachment"
        name="attachment"
        label="Dokumen Pendukung"
        placeholder="Pilih file..."
        accept=".pdf,.docx"
      />

      <div class="w-full space-y-3 pt-4">
        <UButton
          type="submit"
          form="cuti-form-edit"
          class="w-full justify-center"
        >
          Update
        </UButton>
      </div>
    </UForm>
  </div>

  <USlideover
    v-else
    v-model:open="open"
    title="Ajukan Cuti"
    :ui="{ content: 'm-9' }"
  >
    <!-- Trigger Button -->
    <UButton icon="i-heroicons-plus" label="Ajukan Cuti" @click="open = true" />

    <!-- Form Body -->
    <template #body>
      <UForm
        id="cuti-form"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <div class="flex gap-2 w-full">
          <UFormField label="Tanggal Mulai" name="start_date">
            <UInput v-model="state.start_date" type="date" class="w-full" />
          </UFormField>

          <UFormField label="Tanggal Selesai" name="end_date">
            <UInput v-model="state.end_date" type="date" class="w-full" />
          </UFormField>
        </div>

        <UFormField label="Jenis Cuti" name="leave_type">
          <USelect
            v-model="state.leave_type"
            :items="leaveTypeOptions"
            placeholder="Pilih jenis cuti"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Alasan" name="reason">
          <UTextarea v-model="state.reason" :rows="5" class="w-full" />
        </UFormField>

        <CoreCustomFileInput
          v-model="state.attachment"
          name="attachment"
          label="Dokumen Pendukung"
          placeholder="Pilih file..."
          accept=".pdf,.docx"
        />
      </UForm>
    </template>

    <!-- Form Footer -->
    <template #footer>
      <div class="w-full space-y-3">
        <UButton type="submit" form="cuti-form" class="w-full justify-center">
          Submit
        </UButton>
        <UButton
          type="button"
          class="w-full justify-center"
          variant="outline"
          @click="open = false"
        >
          Cancel
        </UButton>
      </div>
    </template>
  </USlideover>
</template>
