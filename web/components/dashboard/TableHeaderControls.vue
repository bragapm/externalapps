<script lang="ts" setup>
const props = defineProps<{
  collection?: string;
  queryParams?: Record<string, string> | undefined;
  showUserFilter?: boolean; // New prop to control user filter visibility
  userOptions?: Array<{ value: string | null; label: string }>; // User options for filter
  selectedUser?: string | null; // Selected user value
}>();

const emit = defineEmits<{
  updateDate: [startDate: string | undefined, endDate: string | undefined];
  // Renamed to follow the standard v-model pattern
  "update:selectedUser"?: [userId: string | null];
}>();

const toast = useToast();

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
// Removed debounce, now triggers on every input change
watch(searchInput, handleSearch);

const exportData = async () => {
  const { limit, page, ...restQuery } = props.queryParams ?? {};

  const queryString = new URLSearchParams({
    ...restQuery,
    export: "csv",
  });

  try {
    const response = await fetch(
      `/panel/items/${props.collection}?${queryString}`,
      {
        method: "GET",
      }
    );
    const resData = await response.blob();
    let anchor = document.createElement("a");
    const href = window.URL.createObjectURL(resData);
    anchor.download = props.collection!;
    anchor.href = href;
    anchor.click();
    window.URL.revokeObjectURL(href);
    anchor.remove();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    toast.add({
      title: "Error on downloading table data",
      description: message,
    });
  }
};
</script>

<template>
  <div class="flex justify-between gap-2">
    <div class="flex gap-2">
      <UInput v-model="startDate" type="date" size="lg" />
      <UInput v-model="endDate" type="date" size="lg" />
      <UButton
        @click="applyDateFilter"
        label="Tampilkan"
        size="lg"
        class="text-sm"
      />
    </div>
    <div class="flex gap-2">
      <UInput
        v-model="searchInput"
        trailing-icon="i-heroicons-magnifying-glass"
        placeholder="Search by"
        size="lg"
      />
      <USelectMenu
        v-if="showUserFilter && userOptions"
        :model-value="selectedUser"
        :items="userOptions"
        placeholder="Filter by user"
        value-attribute="value"
        option-attribute="label"
        searchable
        clearable
        @update:model-value="(userId) => emit('update:selectedUser', userId)"
        class="min-w-[200px]"
        size="lg"
      />
      <UButton
        @click="exportData"
        icon="i-heroicons-arrow-down-tray"
        size="lg"
        color="neutral"
        variant="outline"
      />
      <slot name="slideover-button" />
    </div>
  </div>
  <USeparator />
</template>
