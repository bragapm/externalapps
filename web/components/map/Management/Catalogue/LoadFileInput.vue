<script setup lang="ts">
import IcCloudUpload from "~/assets/icons/ic-cloud-upload.svg";
import IcTrash from "~/assets/icons/ic-trash.svg";
import IcInfo from "~/assets/icons/ic-info.svg";

const props = defineProps<{
  selectedFile: File | null;
}>();

const emit = defineEmits<{
  (e: "handleSuccess"): void;
  (e: "setSelectedFile", value: File | null): void;
}>();

const input = ref<HTMLInputElement | null>(null);

const handleFileUploadChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (!target.files || !target.files.length) return;
  const file = target.files[0];
  emit("setSelectedFile", file);
};

const handleDelete = (e: Event) => {
  if (props.selectedFile) {
    e.stopPropagation();
    emit("setSelectedFile", null);
  }
};

const onDragOver = ref(false);

const handleDragOver = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();

  if (onDragOver.value) return;
  onDragOver.value = true;
};

const handleDragLeave = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
  onDragOver.value = false;
};

const handleDrop = (e: any) => {
  e.preventDefault();
  e.stopPropagation();
  onDragOver.value = false;
  const files: File[] = [...e.dataTransfer.files];

  const file = files[0];
  emit("setSelectedFile", file);
};
</script>

<template>
  <input
    ref="input"
    type="file"
    accept=".geojson,application/geo+json,.zip,application/zip,application/x-zip-compressed,.csv,text/csv,.xls,application/vnd.ms-excel,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.kml,application/vnd.google-earth.kml+xml,.gpx,application/gpx+xml,.tcx,application/vnd.garmin.tcx+xml,.gpkg,application/geopackage+sqlite3,.fgb"
    hidden
    @change="handleFileUploadChange"
  />
  <div
    class="flex flex-col gap-1"
    @drop="handleDrop"
    @dragleave="handleDragLeave"
    @dragover="handleDragOver"
  >
    <div
      @click="
        () => {
          input?.click();
        }
      "
      :class="[
        onDragOver || selectedFile ? 'border-brand-500' : 'border-grey-600',
        selectedFile ? 'bg-brand-950' : 'bg-grey-700',
        'p-1 border rounded-xxs cursor-pointer',
      ]"
    >
      <p class="text-2xs text-grey-400 ml-2 mb-1 mt-2">Dataset File</p>
      <div
        class="flex items-center justify-between bg-black/30 rounded-xxs px-2 py-4"
      >
        <div>
          <p
            :class="[
              selectedFile ? 'text-brand-500' : 'text-grey-200',
              'text-xs',
            ]"
          >
            {{ selectedFile?.name || "Select Dataset File" }}
          </p>
          <p
            :class="[
              selectedFile ? 'text-brand-400' : 'text-grey-400',
              'text-xs',
            ]"
          >
            Please select or drag file from your storage here
          </p>
        </div>

        <button @click="handleDelete">
          <component
            :is="selectedFile ? IcTrash : IcCloudUpload"
            :class="[
              selectedFile ? 'text-brand-500' : 'text-grey-400',
              'w-6 h-6',
            ]"
            :fontControlled="false"
          ></component>
        </button>
      </div>
    </div>
    <div class="flex items-center gap-2 mt-2">
      <IcInfo class="text-grey-400" />
      <p class="text-xs text-grey-400">Maximum File Size: 999 MB</p>
    </div>
  </div>
</template>
