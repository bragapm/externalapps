<script lang="ts" setup>
const infoItems = [
  { label: "NIK", value: "value" },
  { label: "iSafe", value: "value" },
  { label: "Role", value: "value" },
  { label: "Jenis Cuti", value: "value" },
  { label: "Tanggal Cuti", value: "value" },
  { label: "Total", value: "value" },
  { label: "Dokumen", value: "value" },
  { label: "Alasan", value: "value" },
  { label: "Status Cuti", value: "value" },
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
