<script lang="ts" setup>
const intervalValue = ref<string>("Mingguan");
const intervalOptions = ref(["Harian", "Mingguan", "Bulanan"]);
</script>

<template>
  <div class="flex justify-between gap-2">
    <div class="flex gap-2">
      <UInput type="date" size="xl" />
      <UInput type="date" size="xl" />
      <UButton label="Tampilkan" size="xl" />
    </div>
    <div class="flex gap-2">
      <UInput
        trailing-icon="i-heroicons-magnifying-glass"
        placeholder="Search by"
        size="xl"
      />
      <USelectMenu
        v-model="intervalValue"
        :items="intervalOptions"
        class="w-32"
        :searchInput="false"
      />
      <UButton
        icon="i-heroicons-arrow-down-tray"
        size="xl"
        color="neutral"
        variant="outline"
      />
      <slot name="slideover-button" />
    </div>
  </div>
  <USeparator />
</template>
