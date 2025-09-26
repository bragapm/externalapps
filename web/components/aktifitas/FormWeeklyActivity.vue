<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { useQuery } from "@tanstack/vue-query";
import dayjs from "dayjs";

const authStore = useAuth();
const emit = defineEmits(["success"]);

// Props for edit mode
const props = defineProps<{
  editData?: any;
  isEdit?: boolean;
}>();

// Form fields
const tanggalKerja = ref("");
const jamMulai = ref("10:00");
const jamSelesai = ref("18:00");
const pic = ref("Beben Nardi");
const lokasi = ref("Kantor A");
const jenisReport = ref("Land Dispute");
const judulAktivitas = ref("Headline Report");
const status = ref("Open");
const deskripsi = ref("");
const uploadedFile = ref<File | null>(null);
const isSubmitting = ref(false);

// Select options (kept for future use)
const picItems = ["Beben Nardi", "Ayu Laras", "Rico Wijaya"];
const reportItems = ["Land Dispute", "Work Progress", "Incident Report"];
const statusItems = ["Open", "Close"];

// Selected daily activities for weekly report
const selectedDailyActivities = ref<string[]>([]);

// Function to populate form with edit data
function populateEditData() {
  if (props.editData && props.isEdit) {
    judulAktivitas.value = props.editData.title || "Headline Report";
    deskripsi.value = props.editData.summary || "";

    // If there's a date from daily activities, use the latest one
    if (props.editData.daily_activities?.length > 0) {
      const latestActivity = props.editData.daily_activities.reduce(
        (latest: any, current: any) => {
          return new Date(current.date) > new Date(latest.date)
            ? current
            : latest;
        }
      );
      tanggalKerja.value = latestActivity.date;

      // Pre-select the daily activities that are part of this weekly report
      selectedDailyActivities.value = props.editData.daily_activities.map(
        (activity: any) => activity.id
      );
    }

    // Note: We don't populate file as it's a file input
    uploadedFile.value = null;
  }
}

// Initialize edit data on mount
onMounted(() => {
  populateEditData();
});

// Watch for changes in editData prop
watch(
  () => props.editData,
  () => {
    if (props.editData && props.isEdit) {
      populateEditData();
    }
  },
  { deep: true, immediate: true }
);

// File handler
const onFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) uploadedFile.value = file;
};

// Auto 7-day range based on tanggalKerja
const startDate = computed(() =>
  tanggalKerja.value
    ? dayjs(tanggalKerja.value).subtract(6, "day").format("YYYY-MM-DD")
    : ""
);
const endDate = computed(() => tanggalKerja.value || "");

// Fetch reports only if tanggalKerja dipilih
const fetchReports = async () => {
  if (!tanggalKerja.value) return [];
  const url = `/panel/items/daily_activities?fields=id,status,date,title,report_type.name&filter[date][_between]=${startDate.value},${endDate.value}`;
  const res = await $fetch<any>(url, {
    headers: {
      Authorization: `Bearer ${authStore.accessToken}`,
    },
  });
  return res.data;
};

const { data: reports, refetch } = useQuery({
  queryKey: ["dailyActivities", startDate, endDate],
  queryFn: fetchReports,
  enabled: false,
});

watch(tanggalKerja, () => {
  if (tanggalKerja.value) refetch();
});

// Function to toggle daily activity selection
const toggleDailyActivity = (activityId: string) => {
  const index = selectedDailyActivities.value.indexOf(activityId);
  if (index > -1) {
    selectedDailyActivities.value.splice(index, 1);
  } else {
    selectedDailyActivities.value.push(activityId);
  }
};

// Check if activity is selected
const isActivitySelected = (activityId: string) => {
  return selectedDailyActivities.value.includes(activityId);
};

// ============= Report Detail Slideover ============
const selectedReport = ref<any | null>(null);
const openDetail = ref(false);

const fetchReportDetail = async (id: string) => {
  const url = `/panel/items/daily_activities/${id}?fields=id,title,description,location,date,start_time,end_time,status,report_type.name,user_created.first_name,user_created.last_name,pics.directus_users_id.first_name,documents.directus_files_id.id,documents.directus_files_id.title`;

  return await $fetch<any>(url, {
    headers: {
      Authorization: `Bearer ${authStore.accessToken}`,
    },
  });
};

const handleOpenDetail = async (id: string) => {
  try {
    const res = await fetchReportDetail(id);
    selectedReport.value = res.data ?? res;
    openDetail.value = true;
  } catch (err) {
    console.error("Gagal ambil detail report:", err);
    alert("Tidak bisa mengambil detail report.");
  }
};

// Reset form function
const resetForm = () => {
  tanggalKerja.value = "";
  jamMulai.value = "10:00";
  jamSelesai.value = "18:00";
  pic.value = "Beben Nardi";
  lokasi.value = "Kantor A";
  jenisReport.value = "Land Dispute";
  judulAktivitas.value = "Headline Report";
  status.value = "Open";
  deskripsi.value = "";
  uploadedFile.value = null;
  selectedDailyActivities.value = [];
};

// Submit handler - handles both create and update
const handleSubmit = async () => {
  if (!tanggalKerja.value) {
    alert("Pilih tanggal kerja dulu.");
    return;
  }

  if (!selectedDailyActivities.value.length) {
    alert("Pilih minimal satu daily activity.");
    return;
  }

  isSubmitting.value = true;

  try {
    const payload: Record<string, any> = {
      title: judulAktivitas.value,
      summary: deskripsi.value || "Summary belum diisi",
      daily_activities: selectedDailyActivities.value,
    };

    // Upload dokumen jika ada
    if (uploadedFile.value) {
      const formData = new FormData();
      formData.append("file", uploadedFile.value);

      const fileRes = await $fetch<any>("/panel/files", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`,
        },
      });
      payload.document = fileRes.id ?? fileRes.data?.id ?? fileRes;
    }

    // Determine if we're updating or creating
    const isEditMode = props.isEdit && props.editData?.id;
    const url = isEditMode
      ? `/panel/items/weekly_activities/${props.editData.id}`
      : "/panel/items/weekly_activities";
    const method = isEditMode ? "PATCH" : "POST";

    // Submit weekly activity
    await $fetch(url, {
      method,
      body: payload,
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    });

    alert(
      isEditMode
        ? "Weekly activity berhasil diupdate!"
        : "Weekly activity berhasil disimpan!"
    );

    emit("success");

    // Reset form only if not in edit mode
    if (!isEditMode) {
      resetForm();
    }
  } catch (err) {
    console.error("Gagal menyimpan:", err);
    alert("Gagal menyimpan data.");
  } finally {
    isSubmitting.value = false;
  }
};

// Handle cancel
const handleCancel = () => {
  resetForm();
};
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex-1 overflow-y-auto space-y-2">
      <!-- Tanggal Kerja -->
      <UFormField label="Tanggal Kerja">
        <UInput
          v-model="tanggalKerja"
          type="date"
          size="lg"
          class="w-full"
          :max="dayjs().format('YYYY-MM-DD')"
          :disabled="isSubmitting"
        />
        <small v-if="tanggalKerja" class="text-gray-500">
          Menampilkan laporan dari {{ startDate }} sampai {{ endDate }}
        </small>
      </UFormField>

      <!-- Judul Aktivitas (title) -->
      <UFormField label="Judul Aktivitas">
        <UInput
          v-model="judulAktivitas"
          type="text"
          size="lg"
          class="w-full"
          placeholder="Masukkan judul aktivitas"
          :disabled="isSubmitting"
        />
      </UFormField>

      <!-- Reports list with checkboxes for selection -->
      <div
        v-if="tanggalKerja && reports?.length"
        class="bg-gray-300 rounded border bg-opacity-80"
      >
        <div class="p-2">
          <h3 class="text-sm font-medium text-gray-700 mb-2">
            Pilih Daily Activities untuk Weekly Report:
          </h3>
        </div>
        <div
          v-for="report in reports"
          :key="report.id"
          class="px-2 my-2 flex items-center gap-2 hover:cursor-pointer hover:bg-gray-200"
        >
          <UCheckbox
            :checked="isActivitySelected(report.id)"
            @change="toggleDailyActivity(report.id)"
            :disabled="isSubmitting"
          />
          <div
            class="flex-1 flex items-center gap-2"
            @click="handleOpenDetail(report.id)"
          >
            <p class="text-xs">{{ report.date }} -</p>
            <h3 class="text-xs">{{ report.title }} -</h3>
            <span
              :class="{
                'text-green-600 text-xs rounded-lg py-1 px-2 border border-green-600':
                  report.status === 'open',
                'text-yellow-600 text-xs rounded-lg p-1 border border-yellow-600':
                  report.status === 'Pending',
                'text-red-600 text-xs rounded-lg p-1 border border-red-600':
                  report.status === 'Rejected',
              }"
            >
              {{ report.status }}
            </span>
          </div>
        </div>
      </div>

      <!-- Show selected activities count -->
      <div v-if="selectedDailyActivities.length" class="text-sm text-blue-600">
        {{ selectedDailyActivities.length }} daily activities dipilih
      </div>

      <!-- Pesan kosong -->
      <div
        v-if="tanggalKerja && !reports?.length"
        class="text-gray-500 text-sm"
      >
        Tidak ada laporan untuk rentang tanggal ini
      </div>

      <!-- Deskripsi -->
      <UFormField label="Kesimpulan Weekly">
        <UTextarea
          v-model="deskripsi"
          placeholder="Input Text or Placeholder"
          size="lg"
          class="w-full"
          :disabled="isSubmitting"
        />
      </UFormField>

      <!-- Upload Dokumen -->
      <UFormField label="Upload Dokumen">
        <UInput
          type="file"
          @change="onFileChange"
          size="lg"
          class="w-full"
          :disabled="isSubmitting"
        />
        <div
          v-if="uploadedFile"
          class="mt-2 px-4 py-2 border border-red-300 text-red-600 rounded flex justify-between items-center"
        >
          <span>{{ uploadedFile.name }}</span>
          <UIcon name="i-heroicons-arrow-up-tray" />
        </div>
      </UFormField>

      <!-- Show existing document if in edit mode -->
      <div
        v-if="isEdit && editData?.document"
        class="mt-2 px-4 py-2 border border-blue-300 text-blue-600 rounded flex justify-between items-center"
      >
        <span>Dokumen yang sudah ada</span>
        <UIcon name="i-heroicons-document" />
      </div>
    </div>

    <!-- Buttons -->
    <div class="absolute left-6 right-6 bottom-6 pt-4 mt-4 space-y-4">
      <UButton
        color="primary"
        size="xl"
        class="w-full justify-center flex"
        @click="handleSubmit"
        :disabled="
          !tanggalKerja || !selectedDailyActivities.length || isSubmitting
        "
        :loading="isSubmitting"
      >
        <template #leading v-if="isSubmitting">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
        </template>
        {{
          isSubmitting
            ? "Menyimpan..."
            : isEdit
            ? "Update Weekly Report"
            : "Simpan"
        }}
      </UButton>

      <UButton
        size="xl"
        class="w-full justify-center flex"
        variant="outline"
        @click="handleCancel"
        :disabled="isSubmitting"
      >
        Batal
      </UButton>
    </div>
  </div>

  <!-- Slideover for Report Detail - Activity -->
  <div
    v-if="openDetail"
    class="fixed top-1/2 transform -translate-y-1/2 right-[45%] z-50"
  >
    <!-- Detail Panel (Next to Form) -->
    <div
      class="w-96 h-[92dvh] bg-white border border-gray-200 rounded-lg overflow-y-auto shadow-xl"
    >
      <!-- Header -->
      <div class="p-4 border-b flex justify-between items-center">
        <h2 class="font-semibold text-sm text-grey-800">Detail Laporan</h2>
        <button
          class="text-gray-500 hover:text-gray-700"
          @click="openDetail = false"
        >
          ✕
        </button>
      </div>

      <!-- Body -->
      <div v-if="selectedReport" class="p-4 space-y-4 text-sm text-gray-800">
        <!-- Status Badge -->
        <div>
          <span
            class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border"
            :class="
              {
                approved: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                open: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                in_progress: 'bg-blue-100 text-blue-700 border-blue-300',
                draft: 'bg-orange-100 text-orange-700 border-orange-300',
                closed: 'bg-green-100 text-green-700 border-green-300',
                reject: 'bg-red-100 text-red-700 border-red-300',
              }[selectedReport.status] ||
              'bg-gray-100 text-gray-700 border-gray-300'
            "
          >
            {{ selectedReport.status }}
          </span>
        </div>

        <!-- Title + Report Type -->
        <div class="text-lg font-semibold">
          {{ selectedReport.title }}
          <span v-if="selectedReport.report_type?.name" class="text-gray-500">
            | {{ selectedReport.report_type.name }}
          </span>
        </div>

        <!-- Main Image -->
        <div
          v-if="
            selectedReport.documents?.length &&
            selectedReport.documents[0]?.directus_files_id?.id
          "
          class="rounded-lg overflow-hidden relative"
        >
          <img
            class="w-full h-40 object-cover"
            :src="`/panel/assets/${selectedReport.documents[0].directus_files_id.id}?access_token=${authStore.accessToken}`"
            :alt="
              selectedReport.documents[0].directus_files_id.title ||
              'Document Image'
            "
          />

          <div
            class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-3 py-1"
          >
            {{ selectedReport.location }} •
            {{
              new Date(selectedReport.date).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            }}
            • {{ selectedReport.start_time }}
          </div>
        </div>

        <!-- Gallery Thumbnails -->
        <div
          v-if="selectedReport.documents && selectedReport.documents.length > 1"
          class="flex gap-2 mt-2 flex-wrap"
        >
          <template v-for="(doc, idx) in selectedReport.documents" :key="idx">
            <img
              v-if="doc?.directus_files_id?.id"
              :src="`/panel/assets/${doc.directus_files_id.id}?access_token=${authStore.accessToken}`"
              :alt="doc.directus_files_id?.title || 'Image'"
              class="w-20 h-14 object-cover rounded border"
            />
          </template>
        </div>

        <!-- Detail Info -->
        <div class="space-y-2 mt-4">
          <div><strong>Tanggal:</strong> {{ selectedReport.date }}</div>

          <div v-if="selectedReport.pics?.length">
            <strong>PIC:</strong>
            {{
              selectedReport.pics
                .map((p: any) => p?.directus_users_id?.first_name || "")
                .filter(Boolean)
                .join(", ")
            }}
          </div>

          <div><strong>Jam Mulai:</strong> {{ selectedReport.start_time }}</div>
          <div><strong>Jam Selesai:</strong> {{ selectedReport.end_time }}</div>
          <div><strong>Lokasi:</strong> {{ selectedReport.location }}</div>

          <div>
            <strong>Deskripsi:</strong>
            <p class="whitespace-pre-line">
              {{ selectedReport.description || "-" }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
