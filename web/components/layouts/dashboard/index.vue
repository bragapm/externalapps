<script lang="ts" setup>
import { useRoute } from "#imports";

const route = useRoute();

const isAuthPage = computed(() => route.path === "/signin");
</script>

<template>
  <div
    class="h-screen flex flex-col justify-center overflow-hidden max-w-[90rem] mx-auto"
  >
    <LayoutsDashboardNavbar />
    <div class="flex flex-1 overflow-hidden gap-3">
      <LayoutsDashboardSidebar v-if="!isAuthPage" />
      <div :class="['flex-1 overflow-auto', isAuthPage ? 'mr-0' : 'mr-6']">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
