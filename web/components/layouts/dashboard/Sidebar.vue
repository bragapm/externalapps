<script lang="ts" setup>
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();
const items = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: "Dashboard",
      active: route.path === "/" || route.path === "/report",
      icon: "i-lucide-book-open",
      children: [
        {
          label: "Absensi",
          to: "/",
        },
        {
          label: "Laporan",
          to: "/report",
        },
      ],
    },
    {
      label: "Absensi",
      active: route.path.startsWith("/absensi"),
      icon: "i-lucide-book-open",
      children: [
        {
          label: "Histori Absensi",
          to: "/absensi/histori",
        },
        {
          label: "Cuti",
          to: "/absensi/cuti",
        },
        {
          label: "Perjalanan Dinas",
          to: "/absensi/perjalanan-dinas",
        },
      ],
    },
  ],
]);
</script>

<template>
  <div
    class="flex flex-col gap-3 p-5 w-[13.875rem] ml-6 shrink-0 sticky top-0 h-[calc(100vh-8rem)] overflow-auto bg-grey-100 shadow-[0px_4px_8px_0px_rgba(79,76,74,0.04)] border border-grey-200 rounded-xs"
  >
    <div class="flex-1 overflow-y-auto space-y-3">
      <p class="text-grey-700 text-sm font-medium">Menu</p>
      <UNavigationMenu
        orientation="vertical"
        :items="items"
        class="data-[orientation=vertical]:w-full"
      />
    </div>
    <div class="">Help</div>
  </div>
</template>
