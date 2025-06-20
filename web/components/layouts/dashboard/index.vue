<script lang="ts" setup></script>

<template>
  <div class="h-screen flex flex-col justify-center overflow-hidden max-w-[90rem] mx-auto">
    <LayoutsDashboardNavbar />
    <div class="flex flex-1 overflow-hidden gap-3">
      <LayoutsDashboardSidebar />
      <div class="flex-1 overflow-auto mr-6">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
