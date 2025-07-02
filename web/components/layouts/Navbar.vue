<script setup lang="ts">
import Logo from "@/assets/images/logo.png";
import { TransitionRoot } from "@headlessui/vue";
import IcHome from "~/assets/icons/ic-home.svg";
import IcLink from "~/assets/icons/ic-link.svg";
import IcMapFlat from "~/assets/icons/ic-map-flat.svg";
import IcTopnav from "~/assets/icons/ic-topnav.svg";
import IcLogin from "~/assets/icons/ic-login.svg";
import IcLogout from "~/assets/icons/ic-logout.svg";

const route = useRoute();
const toast = useToast();
const colorMode = useColorMode();

// const isExpand = useState('isExpand', () => true)
const isExpand = ref(route.path === "/" ? false : true);

const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set() {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
  },
});

import { useMapData } from "~/utils";
const { isLoading, data: mapData } = await useMapData();
const { data: generalSettingsData } = await useGeneralSettings();

const myInterval = ref<NodeJS.Timeout>();

const startScroll = () => {
  myInterval.value = setInterval(
    () =>
      document.getElementById("auto-scroll")?.scrollBy({
        left: 5,
        behavior: "smooth",
      }),
    100
  );
};
const refreshScroll = () => {
  clearInterval(myInterval.value);
  document.getElementById("auto-scroll")?.scrollTo({
    left: 0,
    behavior: "smooth",
  });
};

const authStore = useAuth();
</script>

<template>
  <div class="absolute top-6 left-6 z-40 flex gap-2">
    <div
      class="bg-grey-100 border border-grey-300 rounded-lg relative flex items-center py-3 pl-1 pr-3 gap-3 h-12"
    >
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-heroicons-bars-3"
        size="lg"
      />
      <img :src="Logo" />
      <!-- <NuxtImg
        v-if="generalSettingsData?.data?.project_logo_horizontal"
        provider="directus"
        :src="generalSettingsData?.data?.project_logo_horizontal"
        class="h-10 max-w-56 object-contain object-center"
      /> -->
    </div>
    <div
      v-if="mapData?.data?.title || mapData?.data?.subtitle"
      class="border border-grey-300 bg-white/45 rounded-lg h-12 p-3 max-w-2xl text-grey-950"
    >
      <div class="flex items-center h-6 gap-3">
        <p class="whitespace-nowrap">External Apps Dashboard</p>
        <p
          id="auto-scroll"
          @mouseover="startScroll"
          @mouseout="refreshScroll"
          class="hide-scrollbar whitespace-nowrap text-sm w-64 overflow-auto select-none"
        >
          Example Category for Sinarmas Mockup Project
        </p>
      </div>
    </div>
  </div>
  <div
    class="absolute top-6 right-6 z-40 flex items-center gap-2 bg-grey-100 border border-grey-300 p-[6px] h-12 rounded-lg"
  >
    <LayoutsNavbarSearchLoc />
    <LayoutsNavbarShare />
    <LayoutsNavbarAuth />
  </div>

  <LayoutsAuthModal :isExpand="isExpand"> </LayoutsAuthModal>
</template>
