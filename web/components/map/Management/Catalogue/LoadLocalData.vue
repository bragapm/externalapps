<script lang="ts" setup>
import LoadFileInput from "./LoadFileInput.vue";

const props = defineProps<{
  sortOrder: { id: "asc" | "desc"; name: string };
}>();

const emit = defineEmits<{
  (e: "handleCancel"): void;
  (e: "handleSuccess"): void;
}>();

const loadFileInput = ref<InstanceType<typeof LoadFileInput> | null>(null);

const cancel = () => {
  emit("handleCancel");
};
</script>

<template>
  <div class="h-full flex flex-col gap-4 max-h-[calc(100%-2.25rem)]">
    <div
      class="w-full h-full border border-neutral-700 py-10 px-5 overflow-y-auto"
    >
      <div class="m-auto max-w-2xl">
        <MapManagementCatalogueLoadFileInput
          ref="loadFileInput"
          :sortOrder="sortOrder"
          @handle-success="
            () => {
              emit('handleSuccess');
            }
          "
        />
        <div class="flex flex-col gap-1">
          <p class="text-sm text-neutral-400">Upload Data</p>
          <UButton
            :ui="{ rounded: 'rounded-xxs' }"
            label="Upload File"
            variant="outline"
            color="brand"
            class="w-full justify-between text-xs"
            @click="
              () => {
                loadFileInput?.input?.click();
              }
            "
          >
            <template #trailing>
              <IcCloudUpload class="w-3 h-3" :fontControlled="false" />
            </template>
          </UButton>
          <p class="text-xs text-neutral-400">
            Supported File Type: GeoJSON, .GPX, .KML, CSV (.wkt), .XLSX (.wkt),
            and GeoPackage
          </p>
        </div>
      </div>
    </div>
    <UButton
      @click="cancel"
      :ui="{ rounded: 'rounded-xs' }"
      label="Cancel"
      variant="outline"
      color="brand"
      class="w-44 text-sm justify-center"
    >
    </UButton>
  </div>
</template>
