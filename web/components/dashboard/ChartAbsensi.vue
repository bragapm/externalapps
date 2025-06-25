<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

const items = [
  {
    label: "Absensi",
    slot: "absensi" as const,
  },
  {
    label: "Cuti",
    slot: "cuti" as const,
  },
  {
    label: "Perjalanan Dinas",
    slot: "dinas" as const,
  },
] satisfies TabsItem[];

const state = reactive({
  name: "Benjamin Canac",
  username: "benjaminca;nac",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});
</script>

<template>
  <UTabs
    :items="items"
    variant="link"
    class="gap-4 w-full"
    :ui="{
      trigger:
        'font-medium text-base text-grey-800 data-[state=inactive]:text-gray-800 mr-4 last:mr-0',
      label: 'font-medium text-base',
    }"
  >
    <template #absensi="{ item }">
      <div class="grid grid-cols-2 gap-3">
        <DashboardBarChart />
        <DashboardLineChart />
      </div>
    </template>

    <template #cuti="{ item }">
      <p class="text-muted mb-4"></p>
      <h3>HAHAHA Passwoord</h3>
    </template>
    <template #dinas="{ item }">
      <p class="text-muted mb-4"></p>
      <h3>HAHAHA Passwoord</h3>
    </template>
  </UTabs>
</template>
