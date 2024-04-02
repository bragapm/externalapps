<script lang="ts" setup>
import { RadioGroup } from "@headlessui/vue";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/vue";

const props = defineProps<{
  sortOrder: { id: "asc" | "desc"; name: string };
}>();

const emit = defineEmits<{
  (e: "handleCancel"): void;
  (e: "handleSuccess"): void;
}>();

const cancel = () => {
  emit("handleCancel");
};

const selectedFile = ref<File | null>(null);

const dataType = ref<string>("");

const selectedTab = ref(0);

function changeTab(index: number) {
  selectedTab.value = index;
}

const handleBack = () => {
  if (selectedTab.value !== 0) {
    changeTab(selectedTab.value - 1);
  }
};
const handleNext = () => {
  if (selectedTab.value !== 1) {
    changeTab(selectedTab.value + 1);
  }
};
</script>

<template>
  <div class="h-full flex flex-col gap-4 max-h-[calc(100%-2.25rem)]">
    <div
      class="w-full h-full border border-grey-700 py-10 px-5 overflow-y-auto"
    >
      <div class="m-auto max-w-3xl">
        <TabGroup :selectedIndex="selectedTab" @change="changeTab">
          <TabList class="flex gap-3 justify-evenly mb-3">
            <Tab
              v-for="(item, index) in [
                { step: 1, title: 'Select Data Type' },
                { step: 2, title: 'Upload Data' },
              ]"
              v-slot="{ selected }"
              class="flex flex-col flex-1 text-grey-200"
            >
              <p>{{ item.step }}</p>
              <p>{{ item.title }}</p>
              <div
                :class="[
                  selected ? 'bg-brand-500' : 'bg-grey-400',
                  'h-[2px] w-full rounded-lg mt-2',
                ]"
              />
            </Tab>
          </TabList>
          <TabPanels
            ><TabPanel class="space-y-3">
              <p class="text-sm text-grey-400">Upload To</p>
              <div class="flex flex-col gap-3">
                <p class="text-sm text-grey-400">Data Format</p>
                <RadioGroup v-model="dataType">
                  <div class="grid grid-cols-3 gap-3">
                    <MapManagementCatalogueUploadTypeCard
                      desc=".XYZ .ABC, .PNG, .PDF"
                      optLabel="Vector Data"
                      optValue="loadlocal"
                    />
                    <MapManagementCatalogueUploadTypeCard
                      desc=".XYZ .ABC, .PNG, .PDF"
                      optLabel="Raster Data"
                      optValue="upload"
                    />
                  </div>
                </RadioGroup>
              </div>
            </TabPanel>
            <TabPanel class="space-y-3">
              <p class="text-sm text-grey-400">Upload Data</p>
              <MapManagementCatalogueLoadFileInput
                :selectedFile="selectedFile"
                @set-selected-file="
                  (value: File|null) => {
                    selectedFile = value;
                  }
                "
                @handle-success="
                  () => {
                    emit('handleSuccess');
                  }
                "
              /> </TabPanel
          ></TabPanels>
        </TabGroup>
      </div>
    </div>
    <div class="flex justify-between">
      <UButton
        @click="cancel"
        :ui="{ rounded: 'rounded-xs' }"
        label="Cancel"
        variant="outline"
        color="brand"
        class="w-44 text-sm justify-center"
      >
      </UButton>
      <div class="space-x-2">
        <UButton
          :disabled="selectedTab === 0"
          @click="handleBack"
          :ui="{ rounded: 'rounded-xs' }"
          label="Back"
          variant="outline"
          :color="selectedTab === 0 ? 'grey' : 'brand'"
          class="w-44 text-sm justify-center"
        >
        </UButton>
        <UButton
          :disabled="selectedTab === 1"
          @click="handleNext"
          :ui="{ rounded: 'rounded-xs' }"
          label="Next"
          :color="selectedTab === 1 ? 'grey' : 'brand'"
          class="w-44 text-sm justify-center"
        >
        </UButton>
      </div>
    </div>
  </div>
</template>
