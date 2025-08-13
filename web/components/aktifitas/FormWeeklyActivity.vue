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
  const url = `/panel/items/daily_activities?fields=id,date,title,report_type.name&filter[date][_between]=${startDate.value},${endDate.value}`;
  const res = await $fetch(url, {
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
      const fileRes = await $fetch("/panel/files", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`,
        },
      });
      // depending on your Directus response shape you may need fileRes.data.id or fileRes.id
      // previous code assumed fileRes.id; keep the same assumption:
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
        class="bg-[#B4B4AF] rounded border"
      >
        <div
          v-for="report in reports"
          :key="report.id"
          class="px-2 my-2 flex items-center gap-2"
        >
          <p class="text-xs">{{ report.date }}</p>
          <h3 class="text-xs">{{ report.title }}</h3>
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
      <UFormField label="Deskripsi">
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
</template>
