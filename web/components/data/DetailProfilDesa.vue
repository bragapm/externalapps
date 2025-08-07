<script setup lang="ts">
const props = defineProps<{ id: string }>();
import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";

const authStore = useAuth();

interface DirectusFile {
  id: string;
  title?: string | null;
  filename_download?: string;
  type?: string;
}
interface DocumentItem {
  directus_files_id?: DirectusFile | null;
}
interface VillageProfile {
  id: string;
  name: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  attachments?: DocumentItem[] | null;
}

const profileId = computed(() => props.id);

const {
  data: result,
  isFetching,
  isError,
  error,
} = useQuery<VillageProfile>({
  queryKey: ["village-profile-detail", profileId],
  queryFn: async () => {
    const res = await $fetch<{ data: VillageProfile }>(
      `/panel/items/village_profiles/${props.id}`,
      {
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`,
        },
        params: {
          fields: [
            "id,name,location",
            "attachments.directus_files_id.id",
            "attachments.directus_files_id.title",
            "attachments.directus_files_id.filename_download",
            "attachments.directus_files_id.type",
          ].join(","),
        },
      }
    );
    return res.data;
  },
  enabled: !!props.id,
});

const getImageUrl = (fileId: string) => {
  return `https://externalapps.braga.co.id/panel/assets/${fileId}?access_token=${authStore.accessToken}`;
};

const isImageFile = (file: DirectusFile) => {
  return (
    file.type?.startsWith("image/") ||
    file.filename_download?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
  );
};

const imageAttachments = computed(() => {
  if (!result.value?.attachments) return [];
  return result.value.attachments.filter(
    (doc) => doc?.directus_files_id && isImageFile(doc.directus_files_id)
  );
});

const formattedCoordinates = computed(() => {
  if (!result.value?.location?.coordinates) return "No coordinates";
  const [lng, lat] = result.value.location.coordinates;
  return `${lat.toFixed(4)}° S, ${lng.toFixed(4)}° E`;
});
</script>

<template>
  <!-- Loading state -->
  <div
    v-if="isFetching"
    class="flex flex-col items-center justify-center py-16 text-gray-500"
  >
    <div
      class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"
    ></div>
    <p class="mt-2 text-sm">Loading...</p>
  </div>

  <!-- Error state -->
  <div
    v-else-if="isError"
    class="p-4 bg-red-50 border border-red-200 rounded-md text-red-700"
  >
    <h3 class="text-sm font-semibold">Failed to load data</h3>
    <p class="text-sm mt-1">{{ error?.message || "Unknown error" }}</p>
  </div>

  <!-- Main content -->
  <div v-else-if="result" class="p-4 space-y-4">
    <!-- Main image -->
    <div
      v-if="imageAttachments.length > 0"
      class="w-full overflow-hidden rounded-md shadow"
    >
      <img
        class="w-full h-52 object-cover"
        :src="getImageUrl(imageAttachments[0].directus_files_id!.id)"
        :alt="imageAttachments[0].directus_files_id?.title || 'Main image'"
        @error="(e) => {
          const target = e.target as HTMLImageElement | null;
          if (target) {
            target.src = 'data:image/svg+xml;base64,...'; // fallback base64 placeholder
          }
        }"
      />
    </div>

    <!-- Gallery thumbnails -->
    <div v-if="imageAttachments.length > 1" class="grid grid-cols-3 gap-2">
      <div
        v-for="(doc, idx) in imageAttachments.slice(1)"
        :key="doc.directus_files_id?.id || idx"
        class="rounded overflow-hidden border"
      >
        <img
          :src="getImageUrl(doc.directus_files_id!.id)"
          :alt="doc.directus_files_id?.title || `Image ${idx + 1}`"
          class="w-full h-20 object-cover"
          @error="(e) => {
            const el = e.target as HTMLElement | null;
            if (el?.parentElement) el.parentElement.style.display = 'none';
          }"
        />
      </div>
    </div>

    <!-- Tag & Location Info -->
    <div>
      <!-- <span
        class="inline-block text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full"
        >Negative</span
      > -->
      <div class="mt-2">
        <p class="font-medium text-gray-900">{{ result.name }}</p>
        <p class="text-gray-500 text-sm">{{ formattedCoordinates }}</p>
      </div>
    </div>
  </div>

  <!-- No data fallback -->
  <div v-else class="text-center text-gray-400 py-8 text-sm">
    No profile data available.
  </div>
</template>
