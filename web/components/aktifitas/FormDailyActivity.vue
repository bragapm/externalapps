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
  <div class="flex flex-col h-[60dvh] 2xl:h-fit">
    <!-- Form Content - Scrollable -->
    <div class="overflow-y-auto space-y-2">
      <!-- Tanggal Kerja -->
      <UFormField label="Tanggal Kerja">
        <UInput v-model="tanggalKerja" type="date" size="lg" class="w-full" />
      </UFormField>

      <!-- Jam Mulai & Jam Selesai -->
      <div class="grid grid-cols-2 gap-4">
        <UFormField label="Jam Mulai">
          <UInput v-model="jamMulai" type="time" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="Jam Selesai">
          <UInput v-model="jamSelesai" type="time" size="lg" class="w-full" />
        </UFormField>
      </div>

      <!-- PIC -->
      <UFormField label="PIC">
        <USelectMenu
          v-model="pic"
          :items="picItems"
          placeholder="Pilih PIC"
          size="lg"
          searchable
          class="w-full"
        />
      </UFormField>

      <!-- Lokasi -->
      <UFormField label="Lokasi">
        <UInput v-model="lokasi" size="lg" class="w-full" />
      </UFormField>

      <!-- Jenis Report -->
      <UFormField label="Jenis Report">
        <USelectMenu
          v-model="jenisReport"
          :items="reportItems"
          placeholder="Pilih Jenis Report"
          size="lg"
          searchable
          class="w-full"
        />
      </UFormField>

      <!-- Judul Aktivitas -->
      <UFormField label="Judul Aktivitas">
        <UInput v-model="judulAktivitas" size="lg" class="w-full" />
      </UFormField>

      <!-- Status -->
      <UFormField label="Status">
        <USelectMenu
          v-model="status"
          :items="statusItems"
          placeholder="Pilih Status"
          size="lg"
          searchable
          class="w-full"
        />
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
  </div>
  <div
    class="absolute left-0 right-0 bottom-6 pt-4 px-6 mt-4 space-y-4 border-t border-gray-300"
  >
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
</template>
