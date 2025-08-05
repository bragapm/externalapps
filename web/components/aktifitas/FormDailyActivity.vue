<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import { ref, reactive } from "vue";

const authStore = useAuth();
const emit = defineEmits(["success"]);

// Validation Schema
const schema = z
  .object({
    date: z.string().min(1, "Tanggal kerja wajib diisi"),
    start_time: z.string().min(1, "Jam mulai wajib diisi"),
    end_time: z.string().min(1, "Jam selesai wajib diisi"),
    pics: z.number().min(1, "PIC wajib dipilih"),
    location: z.string().min(1, "Lokasi wajib diisi"),
    report_type: z.number({ required_error: "Jenis report wajib dipilih" }),
    title: z.string().min(1, "Judul aktivitas wajib diisi"),
    status: z.string().min(1, "Status wajib dipilih"),
    description: z.string().min(1, "Deskripsi wajib diisi"),
    documents: z
      .instanceof(File)
      .optional()
      .refine((file) => !file || file.size < 5 * 1024 * 1024, {
        message: "Ukuran file maksimal 5MB",
      }),
  })
  .refine(({ start_time, end_time }) => start_time < end_time, {
    message: "Jam selesai harus setelah jam mulai",
    path: ["end_time"],
  });

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  date: undefined,
  start_time: "10:00",
  end_time: "18:00",
  pics: 1,
  location: "Kantor A",
  report_type: 1,
  title: "Headline Report",
  status: "approved",
  description: undefined,
  documents: undefined,
});

// Dropdown options
const picOptions = [
  { label: "Beben Nardi", value: 1 },
  { label: "Ayu Laras", value: 2 },
  { label: "Rico Wijaya", value: 3 },
];

const reportTypeOptions = [
  { label: "Land Dispute", value: 1 },
  { label: "Work Progress", value: 2 },
  { label: "Incident Report", value: 3 },
];

const statusOptions = [
  { label: "Open", value: "open" },
  { label: "Approved", value: "approved" },
  { label: "Close", value: "close" },
];

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const token = authStore.accessToken;

  let uploadedDocumentIds: string[] = [];

  // Upload document
  if (event.data.documents) {
    try {
      const documentForm = new FormData();
      documentForm.append("file", event.data.documents);

      const uploadRes = await fetch(
        "https://externalapps.braga.co.id/panel/files",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: documentForm,
        }
      );

      const uploadResult = await uploadRes.json();

      if (!uploadRes.ok || !uploadResult.data?.id) {
        throw new Error("Gagal mengunggah dokumen");
      }

      uploadedDocumentIds = [uploadResult.data.id]; // UUID
    } catch (err: any) {
      console.error("Upload error:", err);
      return;
    }
  }

  // Submit daily activity
  try {
    const res = await fetch(
      "https://externalapps.braga.co.id/panel/items/daily_activities",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: event.data.date,
          start_time: event.data.start_time + ":00",
          end_time: event.data.end_time + ":00",
          location: event.data.location,
          title: event.data.title,
          description: event.data.description,
          status: event.data.status,
          pics: [event.data.pics],
          report_type: event.data.report_type,
          documents: uploadedDocumentIds.map((id) => ({
            directus_files_id: id,
          })),
        }),
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw new Error(
        result?.errors?.[0]?.message || "Gagal menyimpan aktivitas harian"
      );
    }

    emit("success");

    // Reset form
    Object.assign(state, {
      date: undefined,
      start_time: "10:00",
      end_time: "18:00",
      pics: 1,
      location: "Kantor A",
      report_type: 1,
      title: "Headline Report",
      status: "approved",
      description: undefined,
      documents: undefined,
    });
  } catch (err: any) {
    console.error("Submit error:", err);
  }
}
</script>

<template>
  <div class="w-full max-w-2xl mx-auto p-3">
    <div class="flex flex-col h-[60dvh] 2xl:h-fit">
      <!-- Form Content - Scrollable -->
      <div class="overflow-y-auto space-y-4">
        <UForm
          id="daily-activity-form"
          :schema="schema"
          :state="state"
          class="space-y-4"
          @submit="onSubmit"
        >
          <!-- Tanggal Kerja -->
          <UFormField label="Tanggal Kerja" name="date">
            <UInput v-model="state.date" type="date" size="lg" class="w-full" />
          </UFormField>

          <!-- Jam Mulai & Jam Selesai -->
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Jam Mulai" name="start_time">
              <UInput
                v-model="state.start_time"
                type="time"
                size="lg"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Jam Selesai" name="end_time">
              <UInput
                v-model="state.end_time"
                type="time"
                size="lg"
                class="w-full"
              />
            </UFormField>
          </div>

          <!-- PIC -->
          <UFormField label="PIC" name="pics">
            <USelect
              v-model="state.pics"
              :items="picOptions"
              placeholder="Pilih PIC"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <!-- Lokasi -->
          <UFormField label="Lokasi" name="location">
            <UInput v-model="state.location" size="lg" class="w-full" />
          </UFormField>

          <!-- Jenis Report -->
          <UFormField label="Jenis Report" name="report_type">
            <USelect
              v-model="state.report_type"
              :items="reportTypeOptions"
              placeholder="Pilih Jenis Report"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <!-- Judul Aktivitas -->
          <UFormField label="Judul Aktivitas" name="title">
            <UInput v-model="state.title" size="lg" class="w-full" />
          </UFormField>

          <!-- Status -->
          <UFormField label="Status" name="status">
            <USelect
              v-model="state.status"
              :items="statusOptions"
              placeholder="Pilih Status"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <!-- Deskripsi -->
          <UFormField label="Deskripsi" name="description">
            <UTextarea
              v-model="state.description"
              placeholder="Masukkan deskripsi aktivitas"
              size="lg"
              :rows="4"
              class="w-full"
            />
          </UFormField>

          <!-- Upload Dokumen -->
          <CoreCustomFileInput
            v-model="state.documents"
            name="documents"
            label="Upload Dokumen"
            placeholder="Pilih file..."
            accept=".pdf,.docx,.jpg,.jpeg,.png"
          />
        </UForm>
      </div>
    </div>

    <!-- Form Footer -->
    <div class="w-full space-y-3 mt-6 pt-4 border-t border-gray-200">
      <UButton
        type="submit"
        form="daily-activity-form"
        color="primary"
        size="xl"
        class="w-full justify-center"
      >
        Simpan
      </UButton>
      <UButton
        type="button"
        size="xl"
        class="w-full justify-center"
        variant="outline"
      >
        Batal
      </UButton>
    </div>
  </div>
</template>
