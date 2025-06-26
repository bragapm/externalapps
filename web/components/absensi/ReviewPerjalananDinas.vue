<script lang="ts" setup>
const infoItems = [
  { label: "Nama", value: "value" },
  { label: "ID pegawai", value: "value" },
  { label: "Role", value: "value" },
  { label: "Tanggal Mulai", value: "value" },
  { label: "Tanggal Selesai", value: "value" },
  { label: "Tujuan", value: "value" },
  { label: "Transport", value: "value" },
  { label: "Agenda", value: "value" },
  { label: "Durasi", value: "value" },
  { label: "Lampiran", value: "value" },
  { label: "Status", value: "value" },
];
</script>

<template>
  <DashboardProfileCard />
  <div class="mt-3 p-4 rounded-lg border border-grey-200">
    <div
      v-for="item in infoItems"
      :key="item.label"
      class="grid grid-cols-2 gap-2 items-center"
    >
      <p class="text-xs text-grey-500 font-medium">{{ item.label }}</p>
      <p class="text-sm text-grey-950 font-medium">{{ item.value }}</p>
    </div>
  </div>
  <div class="mt-3 p-4 rounded-lg border border-grey-200">
    <p class="text-xs text-grey-600">Alasan Penolakan</p>
    <p class="text-base text-grey-800">
      Alasan Tidak disetujui karena dokumen tidak lengkap
    </p>
  </div>
</template>
