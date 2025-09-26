<script lang="ts" setup>
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const authStore = useAuth();
const toast = useToast();
const emit = defineEmits(["submitted"]);

const schema = z
  .object({
    start_date: z.string(),
    end_date: z.string(),
    location: z.string(),
    tujuan: z.string(),
    agenda: z.string().optional(), // agenda is not in API but kept for UI
    transportation: z.string({
      required_error: "Jenis transportasi wajib dipilih",
    }),
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
  location: undefined,
  tujuan: undefined,
  agenda: undefined,
  transportation: undefined,
  attachment: undefined,
});

const agendaOptions = [
  { label: "Survei Lokasi", value: "survey" },
  { label: "Kick-off Meeting", value: "kickoff" },
];

const transportOptions = [
  { label: "Kereta", value: "kerete" },
  { label: "Pesawat", value: "pesawat" },
];

const open = ref(false);

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

  // Step 1: Upload file to /assets
  if (event.data.attachment) {
    try {
      const formData = new FormData();
      formData.append("file", event.data.attachment);

      const uploadRes = await fetch("/panel/files", {
        method: "POST",

        body: formData,
      });

      const result = await uploadRes.json();

      if (!uploadRes.ok || !result.data?.id) {
        throw new Error("Gagal mengunggah dokumen");
      }

      uploadedAssetId = result.data.id;
    } catch (err: any) {
      toast.add({
        title: "Upload Gagal",
        description: err.message || "Terjadi kesalahan saat mengunggah dokumen",
      });
      return;
    }
  }

  // Step 2: Submit to business_trips
  try {
    const res = await fetch("/panel/items/business_trips", {
      method: "POST",

      body: JSON.stringify({
        start_date: event.data.start_date,
        end_date: event.data.end_date,
        destination: event.data.location,
        purpose: event.data.tujuan,
        transportation: event.data.transportation,
        status: "in_progress",
        document: uploadedAssetId,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(
        result?.errors?.[0]?.message || "Gagal mengirim data perjalanan dinas"
      );
    }

    toast.add({
      title: "Berhasil",
      description: "Perjalanan dinas berhasil dikirim.",
    });

    open.value = false;
    emit("submitted");
  } catch (err: any) {
    toast.add({
      title: "Gagal",
      description: err.message || "Terjadi kesalahan saat menyimpan data",
    });
  }
}
</script>

<template>
  <USlideover
    v-model:open="open"
    title="Ajukan Perjalanan Dinas"
    :ui="{ content: 'm-9' }"
  >
    <UButton
      icon="i-heroicons-plus"
      label="Buat Perjalanan Dinas"
      class="text-sm"
      @click="open = true"
    />
    <template #body>
      <UForm
        id="perjalanan-dinas-form"
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
        <UFormField label="Lokasi" name="location">
          <UInput v-model="state.location" class="w-full" />
        </UFormField>
        <UFormField label="Tujuan" name="tujuan">
          <UInput v-model="state.tujuan" class="w-full" />
        </UFormField>
        <UFormField label="Agenda" name="agenda">
          <USelect
            v-model="state.agenda"
            :items="agendaOptions"
            placeholder="Pilih jenis agenda"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Transportasi" name="transportation">
          <USelect
            v-model="state.transportation"
            :items="transportOptions"
            placeholder="Pilih jenis transportasi"
            class="w-full"
          />
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
    <template #footer>
      <div class="w-full space-y-3">
        <UButton
          type="submit"
          form="perjalanan-dinas-form"
          class="w-full justify-center"
        >
          Submit
        </UButton>
        <UButton
          @click="open = false"
          type="button"
          class="w-full justify-center"
          variant="outline"
        >
          Cancel
        </UButton>
      </div>
    </template>
  </USlideover>
</template>
