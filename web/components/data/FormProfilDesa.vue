<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";

// 🆕 Define props for edit functionality
interface VillageProfileData {
  id: number;
  user_created: string;
  date_created: string;
  user_updated: string | null;
  date_updated: string | null;
  name: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  attachments: any[];
}

interface Props {
  editData?: VillageProfileData | null;
  isEdit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  editData: null,
  isEdit: false,
});

// Define emits
const emit = defineEmits<{
  success: [];
  cancel: [];
}>();

const authStore = useAuth();
const queryClient = useQueryClient();

// Form fields
const namaDesa = ref("");
const coordinates = ref("");
const uploadedFiles = ref<File[]>([]);
const isUploading = ref(false);

// 🆕 Track existing attachments for edit mode
const existingAttachments = ref<any[]>([]);

// 🆕 Initialize form with edit data
const initializeForm = () => {
  if (props.isEdit && props.editData) {
    namaDesa.value = props.editData.name;

    // Convert coordinates back to "lat, lng" format for display
    const [lng, lat] = props.editData.location.coordinates;
    coordinates.value = `${lat}, ${lng}`;

    // Store existing attachments
    existingAttachments.value = props.editData.attachments || [];

    // Clear uploaded files for edit mode (user can add new files)
    uploadedFiles.value = [];
  } else {
    // Clear form for create mode
    namaDesa.value = "";
    coordinates.value = "";
    uploadedFiles.value = [];
    existingAttachments.value = [];
  }
};

// 🆕 Watch for changes in editData
watch(() => props.editData, initializeForm, { immediate: true });

// Initialize on mount
onMounted(() => {
  initializeForm();
});

// File handlers
const onFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (files) {
    // Convert FileList to Array and add to existing files
    const newFiles = Array.from(files);
    uploadedFiles.value = [...uploadedFiles.value, ...newFiles];
  }
};

const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1);
};

// 🆕 Remove existing attachment
const removeExistingAttachment = (index: number) => {
  existingAttachments.value.splice(index, 1);
};

// Validate coordinates format
const isValidCoordinates = (coords: string): boolean => {
  // Accept formats like: "lat,lng" or "lat, lng" with optional spaces
  const coordPattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/;
  return coordPattern.test(coords.trim());
};

// Parse coordinates string to [longitude, latitude] for GeoJSON
const parseCoordinates = (coords: string): [number, number] => {
  const [lat, lng] = coords.split(",").map((s) => parseFloat(s.trim()));
  return [lng, lat]; // GeoJSON format is [longitude, latitude]
};

// Upload files to Directus
const uploadFiles = async (files: File[]): Promise<string[]> => {
  if (files.length === 0) return [];

  const uploadPromises = files.map(async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await $fetch<{ data: { id: string } }>("/panel/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
      body: formData,
    });

    return response.data.id;
  });

  return Promise.all(uploadPromises);
};

// 🆕 Create village profile mutation
const { mutate: createVillageProfile, isPending: isCreating } = useMutation({
  mutationFn: async (payload: {
    name: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
    attachments: any[];
  }) => {
    await $fetch("/panel/items/village_profiles", {
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
      method: "POST",
      body: payload,
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["village-profiles"] });
    // Clear form
    namaDesa.value = "";
    coordinates.value = "";
    uploadedFiles.value = [];
    existingAttachments.value = [];
    emit("success");
  },
  onError: (error) => {
    console.error("Error creating village profile:", error);
  },
});

// 🆕 Update village profile mutation
const { mutate: updateVillageProfile, isPending: isUpdating } = useMutation({
  mutationFn: async (payload: {
    id: number;
    data: {
      name: string;
      location: {
        type: string;
        coordinates: [number, number];
      };
      attachments: any[];
    };
  }) => {
    await $fetch(`/panel/items/village_profiles/${payload.id}`, {
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
      method: "PATCH",
      body: payload.data,
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["village-profiles"] });
    emit("success");
  },
  onError: (error) => {
    console.error("Error updating village profile:", error);
  },
});

// Submit handler
const handleSubmit = async () => {
  // Validate required fields
  if (!namaDesa.value.trim()) {
    alert("Nama Desa is required");
    return;
  }

  if (!coordinates.value.trim()) {
    alert("Lokasi coordinates are required");
    return;
  }

  if (!isValidCoordinates(coordinates.value)) {
    alert(
      "Invalid coordinates format. Please use: latitude,longitude (e.g., -6.2088, 106.8456)"
    );
    return;
  }

  try {
    isUploading.value = true;

    // Upload new files
    const newAttachmentIds = await uploadFiles(uploadedFiles.value);

    // Parse coordinates
    const parsedCoordinates = parseCoordinates(coordinates.value);

    // Combine existing attachments with new ones
    const allAttachments = [
      ...existingAttachments.value,
      ...newAttachmentIds.map((id) => ({ directus_files_id: id })),
    ];

    // Prepare payload
    const payloadData = {
      name: namaDesa.value.trim(),
      location: {
        type: "Point",
        coordinates: parsedCoordinates,
      },
      attachments: allAttachments,
    };

    if (props.isEdit && props.editData) {
      // Update existing village profile
      updateVillageProfile({
        id: props.editData.id,
        data: payloadData,
      });
    } else {
      // Create new village profile
      createVillageProfile(payloadData);
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("Error uploading files or saving village profile");
  } finally {
    isUploading.value = false;
  }
};

// Cancel handler
const handleCancel = () => {
  namaDesa.value = "";
  coordinates.value = "";
  uploadedFiles.value = [];
  existingAttachments.value = [];
  emit("cancel");
};

const isSubmitting = computed(
  () => isCreating.value || isUpdating.value || isUploading.value
);

// 🆕 Get button text based on mode
const submitButtonText = computed(() => {
  if (isSubmitting.value) {
    return props.isEdit ? "Memperbarui..." : "Menyimpan...";
  }
  return props.isEdit ? "Perbarui" : "Simpan";
});

// 🆕 Get form title
const formTitle = computed(() => {
  return props.isEdit ? "Edit Profil Desa" : "Tambah Profil Desa";
});
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Form Content - Scrollable -->
    <div class="flex-1 overflow-y-auto space-y-4 pb-32">
      <!-- Nama Desa -->
      <UFormField label="Nama Desa" required>
        <UInput
          v-model="namaDesa"
          size="lg"
          class="w-full"
          placeholder="Masukkan nama desa"
          :disabled="isSubmitting"
        />
      </UFormField>

      <!-- Lokasi -->
      <UFormField label="Lokasi (Koordinat)" required>
        <UInput
          v-model="coordinates"
          size="lg"
          class="w-full"
          placeholder="Contoh: -6.2088, 106.8456"
          :disabled="isSubmitting"
        />
        <div
          class="mt-2 text-xs text-gray-500 bg-blue-50 p-3 rounded-md border border-blue-200"
        >
          <div class="flex items-start gap-2">
            <UIcon
              name="i-heroicons-information-circle"
              class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"
            />
            <div>
              <p class="font-medium text-blue-800 mb-1">Format Koordinat:</p>
              <ul class="space-y-1 text-blue-700">
                <li>
                  • Format:
                  <code class="bg-blue-100 px-1 rounded"
                    >latitude, longitude</code
                  >
                </li>
                <li>
                  • Contoh:
                  <code class="bg-blue-100 px-1 rounded"
                    >-6.2088, 106.8456</code
                  >
                  (Jakarta)
                </li>
                <li>• Gunakan koma (,) sebagai pemisah</li>
                <li>• Koordinat negatif untuk belahan selatan dan barat</li>
              </ul>
            </div>
          </div>
        </div>
      </UFormField>

      <!-- 🆕 Existing Attachments (Edit Mode Only) -->
      <UFormField
        v-if="isEdit && existingAttachments.length > 0"
        label="Media/Dokumen Saat Ini"
      >
        <div class="space-y-2">
          <p class="text-sm font-medium text-gray-700">File yang sudah ada:</p>
          <div
            v-for="(attachment, index) in existingAttachments"
            :key="attachment.id || index"
            class="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div class="flex-shrink-0">
                <UIcon
                  name="i-heroicons-document"
                  class="w-5 h-5 text-green-600"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-gray-900">
                  {{
                    attachment.directus_files_id?.filename_download ||
                    attachment.filename_download ||
                    `File ${index + 1}`
                  }}
                </p>
                <p class="text-xs text-green-600">File existing</p>
              </div>
            </div>

            <button
              @click="removeExistingAttachment(index)"
              class="flex-shrink-0 p-1 text-red-600 hover:text-red-800 transition-colors"
              :disabled="isSubmitting"
              type="button"
            >
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </UFormField>

      <!-- Upload New Documents -->
      <UFormField
        :label="isEdit ? 'Tambah Media/Dokumen Baru' : 'Media/Dokumen'"
      >
        <UInput
          type="file"
          @change="onFileChange"
          size="lg"
          class="w-full"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          :disabled="isSubmitting"
        />
        <div class="mt-2 text-xs text-gray-500">
          <UIcon
            name="i-heroicons-information-circle"
            class="w-4 h-4 inline mr-1"
          />
          {{ isEdit ? "Tambahkan file baru jika diperlukan. " : "" }}Anda dapat
          memilih beberapa file sekaligus. Format yang didukung: gambar, PDF,
          Word, Excel
        </div>

        <!-- Display new uploaded files -->
        <div v-if="uploadedFiles.length > 0" class="mt-3 space-y-2">
          <p class="text-sm font-medium text-gray-700">
            {{ isEdit ? "File baru yang dipilih:" : "File yang dipilih:" }}
          </p>
          <div
            v-for="(file, index) in uploadedFiles"
            :key="index"
            class="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <!-- File type icon -->
              <div class="flex-shrink-0">
                <UIcon
                  v-if="file.type.startsWith('image/')"
                  name="i-heroicons-photo"
                  class="w-5 h-5 text-blue-600"
                />
                <UIcon
                  v-else-if="file.type === 'application/pdf'"
                  name="i-heroicons-document-text"
                  class="w-5 h-5 text-red-600"
                />
                <UIcon
                  v-else
                  name="i-heroicons-document"
                  class="w-5 h-5 text-gray-600"
                />
              </div>

              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ file.name }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ (file.size / 1024 / 1024).toFixed(2) }} MB
                </p>
              </div>
            </div>

            <button
              @click="removeFile(index)"
              class="flex-shrink-0 p-1 text-red-600 hover:text-red-800 transition-colors"
              :disabled="isSubmitting"
              type="button"
            >
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </UFormField>
    </div>

    <!-- Fixed Bottom Buttons -->
    <div class="absolute left-6 right-6 bottom-6 pt-4 mt-4 space-y-4 bg-white">
      <UButton
        color="primary"
        size="xl"
        class="w-full justify-center flex"
        @click="handleSubmit"
        :loading="isSubmitting"
        :disabled="isSubmitting || !namaDesa.trim() || !coordinates.trim()"
      >
        {{ submitButtonText }}
      </UButton>

      <UButton
        size="xl"
        class="w-full justify-center flex"
        variant="outline"
        @click="handleCancel"
        :disabled="isSubmitting"
      >
        Batal
      </UButton>
    </div>
  </div>
</template>
