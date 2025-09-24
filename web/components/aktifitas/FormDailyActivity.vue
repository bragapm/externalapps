<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
// Removed: import * as z from "zod";
// Removed: import type { FormSubmitEvent } from "@nuxt/ui";

const authStore = useAuth();
const toast = useToast();
const emit = defineEmits(["success"]);

// Loading and alert states
const isSubmitting = ref(false);
const isLoadingData = ref(true);

// Removed the Zod schema and its tyfpe
// type Schema = z.output<typeof schema>;

// Form state - empty by default
const state = reactive<any>({
  // Changed type to `any` for simplicity
  date: undefined,
  start_time: undefined,
  end_time: undefined,
  pics: [],
  location: undefined,
  report_type: undefined,
  title: undefined,
  status: undefined,
  description: undefined,
  documents: undefined,
});

// Dropdown options
const picOptions = ref<{ label: string; value: string }[]>([]);
const reportTypeOptions = ref<{ label: string; value: number }[]>([]);

const statusOptions = [
  { label: "Open", value: "open" },
  { label: "Approved", value: "approved" },
  { label: "Close", value: "close" },
];

// Fetch PIC options from Directus users
async function fetchPicOptions() {
  try {
    const res = await fetch("/panel/users?filter[status][_eq]=active", {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(
        result?.errors?.[0]?.message || "Gagal mengambil data PIC"
      );
    }

    picOptions.value = result.data.map((user: any) => ({
      label: `${user.first_name} ${user.last_name}`.trim() || user.email,
      value: user.id,
    }));
  } catch (err) {
    console.error("Error fetching PIC options:", err);
    toast.add({
      title: "Error",
      description: "Gagal mengambil data PIC",
    });
  }
}

// Fetch report types
async function fetchReportTypes() {
  try {
    const res = await fetch(
      "/panel/items/report_types?filter[active][_eq]=true",
      {
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`,
        },
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw new Error(
        result?.errors?.[0]?.message || "Gagal mengambil jenis report"
      );
    }

    reportTypeOptions.value = result.data.map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  } catch (err) {
    console.error("Error fetching report types:", err);
    toast.add({
      title: "Error",
      description: "Gagal mengambil jenis report",
    });
  }
}

// Initialize data on mount
onMounted(async () => {
  try {
    await Promise.all([fetchPicOptions(), fetchReportTypes()]);
  } finally {
    isLoadingData.value = false;
  }
});

// Reset form to initial empty state
function resetForm() {
  Object.assign(state, {
    date: undefined,
    start_time: undefined,
    end_time: undefined,
    pics: [],
    location: undefined,
    report_type: undefined,
    title: undefined,
    status: undefined,
    description: undefined,
    documents: undefined,
    colllab: undefined,
    source: undefined,
  });
}

// Updated onSubmit function to accept a generic event object
async function onSubmit(event: any) {
  if (isSubmitting.value) return;

  const data = state;

  // Manual validation check for required fields
  if (
    !data.date ||
    !data.start_time ||
    !data.end_time ||
    data.pics.length === 0 ||
    !data.location ||
    !data.report_type ||
    !data.title ||
    !data.status ||
    !data.description
  ) {
    toast.add({
      title: "Error",
      description: "Mohon lengkapi semua bidang yang diperlukan.",
    });
    return;
  }

  isSubmitting.value = true;
  const token = authStore.accessToken;

  try {
    let uploadedDocumentIds: string[] = [];

    // Upload document if exists
    if (data.documents) {
      try {
        const documentForm = new FormData();
        documentForm.append("file", data.documents);

        const uploadRes = await fetch("/panel/files", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: documentForm,
        });

        const uploadResult = await uploadRes.json();

        if (!uploadRes.ok || !uploadResult.data?.id) {
          throw new Error("Gagal mengunggah dokumen");
        }

        uploadedDocumentIds = [uploadResult.data.id];
      } catch (err) {
        throw new Error("Gagal mengunggah dokumen: " + (err as Error).message);
      }
    }

    // Prepare the pics payload in the required format
    const picsPayload = data.pics.map((picId: string) => ({
      daily_activities_id: "+",
      directus_users_id: {
        id: picId,
      },
    }));

    // Submit daily activity
    const res = await fetch("/panel/items/daily_activities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        date: data.date,
        start_time: data.start_time + ":00",
        end_time: data.end_time + ":00",
        location: data.location,
        title: data.title,
        description: data.description,
        status: data.status,
        source: data.source,
        collab: data.colllab,
        // Use the new structured payload for pics
        pics: {
          create: picsPayload,
        },
        report_type: data.report_type,
        documents: uploadedDocumentIds.map((id) => ({
          directus_files_id: id,
        })),
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(
        result?.errors?.[0]?.message || "Gagal menyimpan aktivitas harian"
      );
    }

    // Success
    toast.add({
      title: "Berhasil",
      description: "Aktivitas harian berhasil disimpan",
    });

    emit("success");
    resetForm();
  } catch (err) {
    console.error("Submit error:", err);
    toast.add({
      title: "Error",
      description:
        (err as Error).message || "Terjadi kesalahan saat menyimpan data",
    });
  } finally {
    isSubmitting.value = false;
  }
}

function onCancel() {
  resetForm();
}
</script>

<template>
  <div class="w-full max-w-2xl mx-auto p-3">
    <!-- Loading state for initial data -->
    <div v-if="isLoadingData" class="flex justify-center items-center h-40">
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin text-2xl text-primary"
      />
      <span class="ml-2">Memuat data...</span>
    </div>

    <div v-else class="flex flex-col h-[60dvh] 2xl:h-fit">
      <!-- Form Content - Scrollable -->
      <div class="overflow-y-auto space-y-4">
        <!-- Removed :schema="schema" and the @error listener -->
        <UForm
          id="daily-activity-form"
          :state="state"
          class="space-y-4"
          @submit="onSubmit"
        >
          <!-- Tanggal Kerja -->
          <UFormField label="Tanggal Kerja" name="date">
            <UInput
              v-model="state.date"
              type="date"
              size="lg"
              class="w-full"
              :disabled="isSubmitting"
              required
            />
          </UFormField>

          <!-- Jam Mulai & Jam Selesai -->
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Jam Mulai" name="start_time">
              <UInput
                v-model="state.start_time"
                type="time"
                size="lg"
                class="w-full"
                :disabled="isSubmitting"
                required
              />
            </UFormField>
            <UFormField label="Jam Selesai" name="end_time">
              <UInput
                v-model="state.end_time"
                type="time"
                size="lg"
                class="w-full"
                :disabled="isSubmitting"
                required
              />
            </UFormField>
          </div>

          <!-- PIC - Multiple selection -->
          <UFormField label="PIC" name="pics">
            <USelect
              v-model="state.pics"
              :items="picOptions"
              placeholder="Pilih PIC"
              size="lg"
              class="w-full"
              multiple
              value-attribute="value"
              option-attribute="label"
              :disabled="isSubmitting"
            />
          </UFormField>

          <!-- Lokasi -->
          <UFormField label="Lokasi" name="location">
            <UInput
              v-model="state.location"
              size="lg"
              class="w-full"
              :disabled="isSubmitting"
              placeholder="Masukkan lokasi"
              required
            />
          </UFormField>

          <!-- Jenis Report -->
          <UFormField label="Jenis Report" name="report_type">
            <USelect
              v-model="state.report_type"
              :items="reportTypeOptions"
              placeholder="Pilih Jenis Report"
              size="lg"
              class="w-full"
              :disabled="isSubmitting"
              required
            />
          </UFormField>

          <!-- Judul Aktivitas -->
          <UFormField label="Judul Aktivitas" name="title">
            <UInput
              v-model="state.title"
              size="lg"
              class="w-full"
              :disabled="isSubmitting"
              placeholder="Masukkan judul aktivitas"
              required
            />
          </UFormField>

          <!-- Status -->
          <UFormField label="Status" name="status">
            <USelect
              v-model="state.status"
              :items="statusOptions"
              placeholder="Pilih Status"
              size="lg"
              class="w-full"
              :disabled="isSubmitting"
              required
            />
          </UFormField>
          <UFormField label="Kolaborasi Dengan" name="collab">
            <UInput
              v-model="state.colllab"
              size="lg"
              class="w-full"
              :disabled="isSubmitting"
              placeholder="Masukkan Informasi Kolaborasi"
              required
            />
          </UFormField>

          <!-- Judul Aktivitas -->
          <UFormField label="Sumber Informasi" name="source">
            <UInput
              v-model="state.source"
              size="lg"
              class="w-full"
              :disabled="isSubmitting"
              placeholder="Masukkan Sumber Informasi"
              required
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
              :disabled="isSubmitting"
              required
            />
          </UFormField>

          <!-- Upload Dokumen -->
          <CoreCustomFileInput
            v-model="state.documents"
            name="documents"
            label="Upload Dokumen"
            placeholder="Pilih file..."
            accept=".pdf,.docx,.jpg,.jpeg,.png"
            :disabled="isSubmitting"
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
        :loading="isSubmitting"
        :disabled="isLoadingData"
      >
        <template #leading v-if="isSubmitting">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
        </template>
        {{ isSubmitting ? "Submitting..." : "Submit to Depthead" }}
      </UButton>
      <UButton
        type="button"
        size="xl"
        class="w-full justify-center"
        variant="outline"
        :disabled="isSubmitting"
        @click="onCancel"
      >
        Batal
      </UButton>
    </div>
  </div>
</template>
