<script setup lang="ts">
import { TransitionRoot } from "@headlessui/vue";
import IcHome from "~/assets/icons/ic-home.svg";
import IcLogoGeodashboardFull from "~/assets/icons/ic-logo-geodashboard-full.svg";
import IcLink from "~/assets/icons/ic-link.svg";
import IcMapFlat from "~/assets/icons/ic-map-flat.svg";
import IcTopnav from "~/assets/icons/ic-topnav.svg";
import IcUser from "~/assets/icons/ic-user.svg";
import IcHelp from "~/assets/icons/ic-help.svg";
import IcSettings from "~/assets/icons/ic-settings.svg";
import IcLogin from "~/assets/icons/ic-login.svg";
import IcLogout from "~/assets/icons/ic-logout.svg";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";

const authStore = useAuth();

const route = useRoute();

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

const myInterval = ref<any>(null);

const startScroll = () => {
  myInterval.value = setInterval(
    () =>
      document.getElementById("test-auto-scroll")?.scrollBy({
        left: 5,
        behavior: "smooth",
      }),
    100
  );
};
const refreshScroll = () => {
  clearInterval(myInterval.value);
  document.getElementById("test-auto-scroll")?.scrollTo({
    left: 0,
    behavior: "smooth",
  });
};

const toast = useToast();
</script>

<template>
  <div class="sticky top-0 z-50 p-6 flex">
    <!-- <Presence>
      <Motion
        v-show="isExpand && route.path === '/map'"
        :initial="{ opacity: 1 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="{ duration: 0.5 }"
      >
        <div
          class="bg-black/50 backdrop-blur-sm fixed top-0 left-0 w-screen h-screen z-50"
        ></div>
      </Motion>
    </Presence> -->
    <div
      :class="isExpand ? 'w-full py-3 px-0' : 'w-0 p-0'"
      class="relative bg-grey-900 rounded-xs flex items-center justify-between z-50 min-w-fit transition-all duration-300 ease-in-out"
    >
      <div class="flex items-center gap-2">
        <div class="relative flex items-center p-3 gap-3 h-12">
          <UButton
            :disabled="route.path === '/home' ? true : false"
            @click="isExpand = !isExpand"
            size="sm"
            color="transparent"
            class="p-0"
          >
            <IcTopnav class="text-xl" />
          </UButton>
          <IcLogoGeodashboardFull
            class="w-40 text-white"
            :fontControlled="false"
          />
          <TransitionRoot
            :show="isExpand"
            enter="transition-opacity duration-100"
            enter-from="opacity-0"
            enter-to="opacity-1"
            leave="transition-opacity duration-100"
            leave-from="opacity-1"
            leave-to="opacity-0"
            class="absolute right-0 translate-x-full flex gap-4 whitespace-nowrap overflow-hidden opacity-1"
          >
            <NuxtLink to="/" @click="isExpand = !isExpand">
              <UButton
                :color="route.path === '/' ? 'navActive' : 'navMenu'"
                label="Map"
                :ui="{ rounded: 'rounded-full' }"
                class="text-2xs py-2 px-3 ring-0"
              >
                <template #leading>
                  <IcMapFlat class="text-base" />
                </template>
              </UButton>
            </NuxtLink>
            <NuxtLink to="/home">
              <UButton
                :color="route.path === '/home' ? 'navActive' : 'navMenu'"
                label="Home"
                :ui="{ rounded: 'rounded-full' }"
                class="text-2xs py-2 px-3 ring-0"
              >
                <template #leading>
                  <IcHome class="text-base" />
                </template>
              </UButton>
            </NuxtLink>
          </TransitionRoot>
        </div>
      </div>

      <TransitionRoot
        :show="isExpand"
        enter="transition-opacity duration-100"
        enter-from="opacity-0"
        enter-to="opacity-1"
        leave="transition-opacity duration-100"
        leave-from="opacity-1"
        leave-to="opacity-0"
        class="absolute right-0 flex items-center gap-2 px-3"
      >
        <UButton label="Share Map">
          <template #trailing>
            <IcLink class="text-base" />
          </template>
        </UButton>
        <UButton
          label="Share Map"
          class="h-9 w-9 rounded-full flex items-center justify-center"
          ><NuxtLink to="/signin"> <IcUser class="" /></NuxtLink>
        </UButton>
      </TransitionRoot>
      <TransitionRoot
        :show="!isExpand"
        enter="transition-opacity duration-1000"
        enter-from="opacity-0"
        enter-to="opacity-1"
        leave="transition-opacity duration-100"
        leave-from="opacity-1"
        leave-to="opacity-0"
        class="absolute top-0 -right-5 translate-x-full bg-grey-700/30 rounded-xs h-12 p-3 max-w-2xl text-white transition-opacity ease-in-out duration-100"
      >
        <div class="flex items-center">
          <p class="whitespace-nowrap">{{ mapData?.data.title ?? "" }}</p>
          <p
            id="test-auto-scroll"
            @mouseover="startScroll"
            @mouseout="refreshScroll"
            class="hide-scrollbar whitespace-nowrap ml-3 text-sm w-64 overflow-scroll select-none"
          >
            {{ mapData?.data.subtitle ?? "" }}
          </p>
        </div>
      </TransitionRoot>
    </div>
    <div
      class="absolute top-6 right-6 z-40 flex items-center gap-2 bg-grey-900 p-[6px] h-12 rounded-xs"
    >
      <UInput
        color="gray"
        :ui="{ rounded: 'rounded-xxs' }"
        placeholder="Search Location"
      >
        <template #trailing>
          <UButton
            color="grey"
            variant="link"
            icon="i-heroicons-magnifying-glass-20-solid"
            :padded="false"
          />
        </template>
      </UInput>

      <UButton :ui="{ rounded: 'rounded-xxs' }" label="Share Map">
        <template #trailing>
          <IcLink class="text-base" />
        </template>
      </UButton>

      <Popover class="relative">
        <PopoverButton as="span"
          ><UButton
            class="h-9 w-9 rounded-full flex items-center justify-center"
          >
            <IcUser />
          </UButton>
        </PopoverButton>
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="translate-y-1 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="translate-y-1 opacity-0"
        >
          <PopoverPanel
            class="absolute -right-1 z-10 mt-3 w-screen max-w-sm px-4 sm:px-0 lg:max-w-80"
          >
            <div
              class="relative bg-grey-900 p-2 rounded-xs shadow-lg ring-1 ring-grey-800"
            >
              <div class="flex text-white justify-between w-full p-2">
                <article>
                  <h4 class="text-base font-medium text-grey-50">
                    {{ authStore.isSignedIn ? "Gunawan Wibisono" : "Guest" }}
                  </h4>
                  <h5 class="text-sm font-normal text-grey-400">
                    {{
                      authStore.isSignedIn
                        ? "gunawanwibisono@gmail.com"
                        : "Published Map"
                    }}
                  </h5>
                  <p class="text-sm font-normal text-grey-500">
                    {{ authStore.isSignedIn ? "User Role" : "Public Access" }}
                  </p>
                </article>
                <div
                  class="bg-brand-600 h-9 w-9 rounded-full flex items-center justify-center text-white"
                >
                  <IcUser />
                </div>
              </div>
              <div class="border-y w-full border-grey-700 py-2 mb-2">
                <button
                  v-if="authStore.isSignedIn"
                  class="flex items-center space-x-2 px-2 py-2 w-full"
                >
                  <IcSettings class="text-grey-400" />
                  <p class="text-xs font-medium text-grey-200">
                    Account Setting
                  </p>
                </button>
                <button class="flex items-center space-x-2 px-2 py-2 w-full">
                  <IcHelp class="text-grey-400" />
                  <p class="text-xs font-medium text-grey-200">Help</p>
                </button>
              </div>
              <PopoverButton
                v-if="authStore.isSignedIn"
                class="flex items-center space-x-2 px-2 py-2 w-full"
                @click="
                  async () => {
                    toast.add({
                      title: 'Sign Out Successful',
                      description: 'You are now browsing as a guest.',
                      icon: 'i-heroicons-information-circle',
                    });
                    await authStore.signout();
                  }
                "
              >
                <IcLogout class="text-red-500" />
                <p class="text-xs font-medium text-red-500">Sign Out</p>
              </PopoverButton>
              <PopoverButton
                v-else
                class="flex items-center space-x-2 px-2 py-2 w-full"
                @click="() => navigateTo('/signin')"
              >
                <IcLogin class="text-grey-400" />
                <p class="text-xs font-medium text-grey-200">Sign In</p>
              </PopoverButton>
            </div>
          </PopoverPanel>
        </transition>
      </Popover>
    </div>
  </div>
</template>
