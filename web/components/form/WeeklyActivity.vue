<script setup lang="ts">
import { ref } from "vue";

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

// Select options - Alternative format
const picItems = ["Beben Nardi", "Ayu Laras", "Rico Wijaya"];
const reportItems = ["Land Dispute", "Work Progress", "Incident Report"];
const statusItems = ["Open", "Close"];

// File handler
const onFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) uploadedFile.value = file;
};

// Submit handler
const handleSubmit = () => {
  console.log({
    tanggalKerja: tanggalKerja.value,
    jamMulai: jamMulai.value,
    jamSelesai: jamSelesai.value,
    pic: pic.value,
    lokasi: lokasi.value,
    jenisReport: jenisReport.value,
    judulAktivitas: judulAktivitas.value,
    status: status.value,
    deskripsi: deskripsi.value,
    file: uploadedFile.value,
  });
};
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Form Content - Scrollable -->
    <div class="flex-1 overflow-y-auto space-y-2">
      <!-- Tanggal Kerja -->
      <UFormField label="Tanggal Kerja">
        <UInput v-model="tanggalKerja" type="date" size="lg" class="w-full" />
      </UFormField>

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

    <!-- Fixed Bottom Buttons -->
    <div class="absolute left-6 right-6 bottom-6 pt-4 mt-4 space-y-4">
      <UButton
        color="primary"
        size="xl"
        class="w-full justify-center flex"
        @click="handleSubmit"
      >
        Simpan
      </UButton>

      <UButton size="xl" class="w-full justify-center flex" variant="outline">
        Batal
      </UButton>
    </div>
  </div>
</template>
