<script lang="ts" setup>
import { RadioGroup } from "@headlessui/vue";

defineProps<{ mode: UploadModeEnum }>();

const emit = defineEmits<{
  (e: "handleCancel"): void;
  (e: "handleNext", modeValue: UploadModeEnum): void;
}>();

const modeRef = ref<UploadModeEnum>("");

const cancel = () => {
  emit("handleCancel");
};
const next = (modeValue: UploadModeEnum) => {
  emit("handleNext", modeValue);
};
</script>

<template>
  <div class="flex-1 px-10 py-6">
    <p class="text-grey-50">View Local Data/Upload Data</p>
    <p class="text-grey-500 text-2xs">
      Load from local storage to view data or upload and save data to the
      GeoDashboard
    </p>
    <hr class="border-grey-700 my-3" />
    <RadioGroup v-model="modeRef">
      <div class="grid grid-cols-2 gap-4">
        <MapManagementCatalogueUploadOptionCard
          title="View Local Data"
          desc="The data will only be displayed on the data catalog and map pages. Data is not stored and cannot be shared."
          optLabel="View Local Data"
          optValue="loadlocal"
        />
        <MapManagementCatalogueUploadOptionCard
          title="Upload Data"
          desc="The data will be saved in the database and then displayed on the catalog page and map page. Uploaded data can be shared and viewed by other users."
          optLabel="Upload Data"
          optValue="upload"
        />
      </div>
    </RadioGroup>
  </div>
  <div class="p-4 flex gap-2 justify-end">
    <UButton
      @click="cancel"
      :ui="{ rounded: 'rounded-xs' }"
      label="Cancel"
      variant="outline"
      color="brand"
      class="w-44 text-sm justify-center"
    >
    </UButton>
    <UButton
      :disabled="modeRef === ''"
      @click="next(modeRef)"
      :ui="{ rounded: 'rounded-xxs' }"
      label="Next"
      color="brand"
      class="w-44 text-sm justify-center"
    >
    </UButton>
  </div>
</template>
