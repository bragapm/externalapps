<script lang="ts" setup>
import IcMenu from "@/assets/icons/ic-burger-menu.svg";
import IcMarker from "@/assets/icons/ic-marker.svg";
import IcUser from "@/assets/icons/ic-user.svg";
import IcBell from "@/assets/icons/ic-bell.svg";

import Logo from "@/assets/images/logo.png";
import NewLogo from "@/assets/images/new-logo.png";

import type { DropdownMenuItem } from "@nuxt/ui";

const authStore = useAuth();

const items = ref<DropdownMenuItem[]>([
  {
    label: "Logout",
    icon: "i-lucide-log-out",
    onSelect: () => {
      authStore.signout();
    },
  },
]);

const city = ref("Loading...");

const route = useRoute();

const isAuthPage = computed(() => route.path === "/signin");

onMounted(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
        );
        const data = await res.json();
        city.value =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          "Unknown";
      },
      () => {
        city.value = "Permission denied";
      }
    );
  } else {
    city.value = "Unavailable";
  }
});
</script>

<template>
  <nav class="sticky top-0 z-50">
    <div
      class="mt-6 mx-6 mb-3 py-2 rounded-lg bg-grey-100 border border-grey-200 h-[4.25rem] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] flex justify-between items-center px-3"
    >
      <section class="flex items-center gap-4">
        <IcMenu />
        <img :src="NewLogo" alt="" srcset="" class="w-12 h-auto" />

        <h1 class="text-3xl font-semibold">X-RELS</h1>
        <p class="text-sm">(External Relation & Sustainability)</p>
      </section>
      <section
        v-if="!isAuthPage"
        class="flex items-center gap-3 text-grey-800 text-xs font-medium"
      >
        <IcMarker />
        <p>{{ city }}</p>
        <div class="w-[1px] h-6 bg-grey-300" />
        <div class="rounded-full w-4 h-4 bg-green-600" />
        <p>Online</p>
        <button class="border border-[#D32E36] p-[10px] rounded-sm">
          <IcBell class="" />
        </button>
        <UDropdownMenu
          :items="items"
          :content="{
            align: 'end',
            side: 'bottom',
          }"
          :ui="{
            content: 'w-48',
          }"
        >
          <!-- <UButton icon="i-lucide-menu" color="neutral" variant="outline" /> -->
          <button class="bg-[#D32E36] p-[10px] rounded-full">
            <IcUser class="text-white" />
          </button>
        </UDropdownMenu>
      </section>
    </div>
  </nav>
</template>
