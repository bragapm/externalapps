<script setup lang="ts">
const emit = defineEmits<{
  (e: "filterClick"): void;
  (e: "downloadClick"): void;
  (e: "updateSearch", value: string): void;
}>();

// Two-way search binding with debounce
const search = defineModel<string>("search");
const searchInput = ref(search.value || "");
watch(
  searchInput,
  debounce((val: any) => emit("updateSearch", val), 500)
);
</script>

<template>
  <div class="flex justify-between items-center gap-2">
    <!-- Left: Filter button -->
    <UButton
      label="Filter"
      icon="i-lucide-chevron-down"
      variant="outline"
      class="w-[8rem]"
      color="gray"
      @click="emit('filterClick')"
    />

    <div class="flex items-center gap-2">
      <UInput
        v-model="searchInput"
        size="lg"
        placeholder="Cari"
        trailing-icon="i-heroicons-magnifying-glass"
      />

      <UButton
        icon="i-heroicons-arrow-down-tray"
        variant="outline"
        color="gray"
        size="lg"
        @click="emit('downloadClick')"
      />

      <!-- Optional slideover or any injected button -->
      <slot name="slideover-button" />
    </div>
  </div>
</template>
