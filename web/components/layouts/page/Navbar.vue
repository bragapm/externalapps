<script setup lang="ts">
import { TransitionRoot } from "@headlessui/vue";
import IcHome from "~/assets/icons/ic-home.svg";
import IcLogoGeodashboardFull from "~/assets/icons/ic-logo-geodashboard-full.svg";
import IcLink from "~/assets/icons/ic-link.svg";
import IcMapFlat from "~/assets/icons/ic-map-flat.svg";
import IcTopnav from "~/assets/icons/ic-topnav.svg";

const route = useRoute();

const colorMode = useColorMode();

// const isExpand = useState('isExpand', () => true)
const isExpand = ref(route.path === "/map" ? false : true);

const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set() {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
  },
});
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
      class="relative bg-grey-700 rounded-xs flex items-center justify-between z-50 min-w-fit transition-all duration-300 ease-in-out"
    >
      <div class="flex items-center gap-2">
        <div class="relative flex items-center p-3 gap-3 h-12">
          <UButton
            :disabled="route.path === '/' ? true : false"
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
            <NuxtLink to="/map" @click="isExpand = !isExpand">
              <UButton
                :color="route.path === '/map' ? 'navActive' : 'navMenu'"
                label="Map"
                :ui="{ rounded: 'rounded-full' }"
                class="text-2xs py-2 px-3 ring-0"
              >
                <template #leading>
                  <IcMapFlat class="text-base" />
                </template>
              </UButton>
            </NuxtLink>
            <NuxtLink to="/">
              <UButton
                :color="route.path === '/' ? 'navActive' : 'navMenu'"
                label="Landing Page"
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
        <UAvatar
          src="https://avatars.githubusercontent.com/u/739984?v=4"
          alt="Avatar"
          size="md"
          :ui="{ rounded: 'rounded-full' }"
        />
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
        <div class="whitespace-nowrap truncate">
          Map Title Here With Max Character
          <span class="ml-3 text-sm"
            >Map Subtitle Here can contain minimum and maximum character and
            with three dots if space not sufficient Lorem Ipsum Dolor sit
            ame</span
          >
        </div>
      </TransitionRoot>
    </div>
    <div
      class="absolute top-6 right-6 z-40 flex items-center gap-2 bg-grey-700 p-[6px] h-12 rounded-xs"
    >
      <UInput placeholder="Search Location">
        <template #trailing>
          <UButton
            color="grey"
            variant="link"
            icon="i-heroicons-magnifying-glass-20-solid"
            :padded="false"
          />
        </template>
      </UInput>
      <UButton label="Share Map">
        <template #trailing>
          <IcLink class="text-base" />
        </template>
      </UButton>
      <UAvatar
        src="https://avatars.githubusercontent.com/u/739984?v=4"
        alt="Avatar"
        size="md"
        :ui="{ rounded: 'rounded-full' }"
      />
    </div>
  </div>
</template>
