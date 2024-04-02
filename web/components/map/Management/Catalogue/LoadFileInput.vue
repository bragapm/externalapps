<script setup lang="ts">
import IcCloudUpload from "~/assets/icons/ic-cloud-upload.svg";
import IcTrash from "~/assets/icons/ic-trash.svg";

const props = defineProps<{
  selectedFile: File | null;
  sortOrder: { id: "asc" | "desc"; name: string };
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
</script>

<template>
  <input
    ref="input"
    type="file"
    accept=".geojson,application/geo+json,.zip,application/zip,application/x-zip-compressed,.csv,text/csv,.xls,application/vnd.ms-excel,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.kml,application/vnd.google-earth.kml+xml,.gpx,application/gpx+xml,.tcx,application/vnd.garmin.tcx+xml,.gpkg,application/geopackage+sqlite3,.fgb"
    hidden
    @change="handleFileUploadChange"
  />
  <div class="flex flex-col gap-1">
    <div
      @click="
        () => {
          input?.click();
        }
      "
      :class="[
        selectedFile ? 'border-brand-500 bg-brand-950' : 'border-neutral-600 bg-neutral-700',
        'p-1 border rounded-xxs cursor-pointer',
      ]"
    >
      <p class="text-2xs text-neutral-400 ml-2 mb-1 mt-2">Dataset File</p>
      <div
        class="flex items-center justify-between bg-black/30 rounded-xxs px-2 py-4"
      >
        <div>
          <p
            :class="[
              selectedFile ? 'text-brand-500' : 'text-neutral-200',
              'text-xs',
            ]"
          >
            {{ selectedFile?.name || "Upload Data" }}
          </p>
          <p
            :class="[
              selectedFile ? 'text-brand-400' : 'text-neutral-400',
              'text-xs',
            ]"
          >
            Maximum File Size: 999 MB
          </p>
        </div>

        <button @click="handleDelete">
          <component
            :is="selectedFile ? IcTrash : IcCloudUpload"
            :class="[
              selectedFile ? 'text-brand-500' : 'text-neutral-400',
              'w-6 h-6',
            ]"
            :fontControlled="false"
          ></component>
        </button>
      </div>
    </div>
    <p class="text-xs text-neutral-400">
      Supported File Type: GeoJSON, .GPX, .KML, CSV (.wkt), .XLSX (.wkt), and
      GeoPackage
    </p>
  </div>
</template>
