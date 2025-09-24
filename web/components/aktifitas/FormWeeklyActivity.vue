<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import dayjs from "dayjs";

const authStore = useAuth();

// Form fields
const tanggalKerja = ref("");
const jamMulai = ref("10:00");
const jamSelesai = ref("18:00");
const pic = ref("Beben Nardi");
const lokasi = ref("Kantor A");
const jenisReport = ref("Land Dispute");
const judulAktivitas = ref("Headline Report"); // <-- title field
const status = ref("Open");
const deskripsi = ref("");
const uploadedFile = ref<File | null>(null);

// Select options (kept for future use)
const picItems = ["Beben Nardi", "Ayu Laras", "Rico Wijaya"];
const reportItems = ["Land Dispute", "Work Progress", "Incident Report"];
const statusItems = ["Open", "Close"];

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

// ============= Report Detail Slideover ============
const selectedReport = ref<any | null>(null);
const openDetail = ref(false);

const fetchReportDetail = async (id: string) => {
  const url = `/panel/items/daily_activities/${id}?fields=id,title,description,location,date,start_time,end_time,status,report_type.name,user_created.first_name,user_created.last_name,pics.directus_users_id.first_name,documents.directus_files_id.id,documents.directus_files_id.title`;

  return await $fetch(url, {
    headers: {
      Authorization: `Bearer ${authStore.accessToken}`,
    },
  });
};

const handleOpenDetail = async (id: string) => {
  try {
    const res = await (<any>fetchReportDetail(id));
    selectedReport.value = res.data ?? res;
    openDetail.value = true;
  } catch (err) {
    console.error("Gagal ambil detail report:", err);
    alert("Tidak bisa mengambil detail report.");
  }
};

// Submit handler
const handleSubmit = async () => {
  if (!tanggalKerja.value) {
    alert("Pilih tanggal kerja dulu.");
    return;
  }
  if (!reports.value?.length) {
    alert("Tidak ada daily activities untuk rentang ini.");
    return;
  }

  try {
    // Ambil ID daily_activities
    const dailyIds = reports.value.map((r: any) => r.id);

    const payload: Record<string, any> = {
      title: judulAktivitas.value, // <-- include title
      summary: deskripsi.value || "Summary belum diisi",
      daily_activities: dailyIds,
    };

    // Upload dokumen jika ada
    if (uploadedFile.value) {
      const formData = new FormData();
      formData.append("file", uploadedFile.value);
      // Directus file upload
      const fileRes = await $fetch<any>("/panel/files", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`,
        },
      });
      payload.document = fileRes.id ?? fileRes.data?.id ?? fileRes;
    }

    // POST ke weekly_activities
    await $fetch("/panel/items/weekly_activities", {
      method: "POST",
      body: payload,
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    });

    alert("Weekly activity berhasil disimpan!");

    // Reset form
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
  } catch (err) {
    console.error("Gagal menyimpan:", err);
    alert("Gagal menyimpan data.");
  }
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
        />
      </UFormField>

      <!-- Reports list -->
      <div
        v-if="tanggalKerja && reports?.length"
        class="bg-gray-300 rounded border bg-opacity-80"
      >
        <div
          v-for="report in reports"
          :key="report.id"
          class="px-2 my-2 flex items-center gap-2 hover:cursor-pointer hover:bg-gray-200"
          @click="handleOpenDetail(report.id)"
        >
          <UCheckbox default-value />
          <p class="text-xs">{{ report.date }} -</p>
          <h3 class="text-xs">{{ report.title }} -</h3>
          <span
            :class="{
              'text-green-600 text-xs rounded-lg py-1 px-2  border border-green-600':
                report.status === 'open',
              'text-yellow-600 text-xs rounded-lg p-1 border border-yellow-600':
                report.status === 'Pending',
              'text-red-600 text-xs  rounded-lg p-1 border border-red-600':
                report.status === 'Rejected',
            }"
          >
            {{ report.status }}
          </span>
        </div>
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
        />
      </UFormField>

      <!-- Upload Dokumen -->
      <UFormField label="Upload Dokumen">
        <UInput type="file" @change="onFileChange" size="lg" class="w-full" />
        <div
          v-if="uploadedFile"
          class="mt-2 px-4 py-2 border border-red-300 text-red-600 rounded flex justify-between items-center"
        >
          <span>{{ uploadedFile.name }}</span>
          <UIcon name="i-heroicons-arrow-up-tray" />
        </div>
      </UFormField>
    </div>

    <!-- Buttons -->
    <div class="absolute left-6 right-6 bottom-6 pt-4 mt-4 space-y-4">
      <UButton
        color="primary"
        size="xl"
        class="w-full justify-center flex"
        @click="handleSubmit"
        :disabled="!tanggalKerja || !reports?.length"
      >
        Simpan
      </UButton>

      <UButton size="xl" class="w-full justify-center flex" variant="outline">
        Batal
      </UButton>
    </div>
  </div>

  <!-- Slideover for Report Detail - Acctivity -->
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
