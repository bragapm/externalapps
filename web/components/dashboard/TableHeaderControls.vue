<script lang="ts" setup>
const emit = defineEmits<{
  updateDate: [startDate: string | undefined, endDate: string | undefined];
}>();

const intervalValue = ref<string>("Mingguan");
const intervalOptions = ref(["Harian", "Mingguan", "Bulanan"]);

const startDate = ref<string>();
const endDate = ref<string>();

const applyDateFilter = () => {
  emit("updateDate", startDate.value, endDate.value);
};

const search = defineModel<string>("search");
const searchInput = ref(search.value);

const handleSearch = (input: string) => {
  search.value = input;
};
watch(searchInput, debounce(handleSearch, 500));
</script>

<template>
  <div class="flex justify-between gap-2">
    <div class="flex gap-2">
      <UInput v-model="startDate" type="date" size="xl" />
      <UInput v-model="endDate" type="date" size="xl" />
      <UButton @click="applyDateFilter" label="Tampilkan" size="xl" />
    </div>
    <div class="flex gap-2">
      <UInput
        v-model="searchInput"
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
