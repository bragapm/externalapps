<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

import { useQuery } from "@tanstack/vue-query";

const props = defineProps<{ id: string }>();
const authStore = useAuth();

interface DirectusFile {
  id: string;
  title?: string | null;
}

interface DocumentItem {
  directus_files_id?: DirectusFile | null;
}

interface PicItem {
  directus_users_id?: {
    first_name?: string;
  };
}

interface ReportType {
  name?: string;
}

interface UserCreated {
  first_name?: string;
  last_name?: string;
}

interface DailyActivity {
  id: string;
  title: string;
  description?: string | null;
  location: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  report_type?: ReportType | null;
  user_created?: UserCreated | null;
  pics?: PicItem[] | null;
  documents?: DocumentItem[] | null;
}

const {
  data: result,
  isFetching,
  isError,
} = useQuery<DailyActivity>({
  queryKey: ["daily-activity-detail", props.id],
  queryFn: async () => {
    const res = await $fetch<{ data: DailyActivity }>(
      `/panel/items/daily_activities/${props.id}`,
      {
        params: {
          fields: [
            "id,title,description,location,date,start_time,end_time,status",
            "report_type.name",
            "user_created.first_name,user_created.last_name",
            "pics.directus_users_id.first_name",
            "documents.directus_files_id.id,documents.directus_files_id.title",
          ].join(","),
        },
      }
    );

    return res.data;
  },
});

const statusLabelMap: Record<string, string> = {
  approved: "Approved",
  in_progress: "In Progress",
  draft: "Draft",
  closed: "Closed",
  reject: "Rejected",
};

const statusColorMap: Record<string, string> = {
  approved: "bg-yellow-100 text-yellow-700 border-yellow-300",
  in_progress: "bg-blue-100 text-blue-700 border-blue-300",
  draft: "bg-orange-100 text-orange-700 border-orange-300",
  closed: "bg-green-100 text-green-700 border-green-300",
  reject: "bg-red-100 text-red-700 border-red-300",
};

// Helper function to get full image URL with auth token
const getImageUrl = (fileId: string) => {
  return `/panel/assets/${fileId}?access_token=${authStore.accessToken}`;
};
</script>

<template>
  <div v-if="isFetching" class="text-sm text-gray-500">Loading...</div>
  <div v-else-if="isError" class="text-sm text-red-500">
    Failed to load data.
  </div>
  <div v-else-if="result" class="space-y-4 text-sm text-gray-800">
    <!--  Status Badge -->
    <div>
      <span
        class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border"
        :class="
          statusColorMap[result.status] ||
          'bg-gray-100 text-gray-700 border-gray-300'
        "
      >
        {{ statusLabelMap[result.status] || result.status }}
      </span>
    </div>

    <!--  Title | Report Type -->
    <div class="text-lg font-semibold">
      {{ result.title }}
      <span v-if="result.report_type?.name" class="text-gray-500"
        >| {{ result.report_type.name }}</span
      >
    </div>

    <!--  Main Image -->
    <div
      v-if="
        result.documents?.length && result.documents[0]?.directus_files_id?.id
      "
      class="rounded-lg overflow-hidden relative"
    >
      <img
        class="w-full h-56 object-cover"
        :src="getImageUrl(result.documents[0].directus_files_id.id)"
        :alt="result.documents[0].directus_files_id.title || 'Document Image'"
      />
      <div
        class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-3 py-1"
      >
        {{ result.location }} •
        {{
          new Date(result.date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        }}
        • {{ result.start_time }}
      </div>
    </div>

    <!--  Gallery Thumbnails -->
    <div
      v-if="result.documents && result.documents.length > 1"
      class="flex gap-2 mt-2 flex-wrap"
    >
      <template v-for="(doc, idx) in result.documents" :key="idx">
        <img
          v-if="doc?.directus_files_id?.id"
          :src="getImageUrl(doc.directus_files_id.id)"
          :alt="doc.directus_files_id?.title || 'Image'"
          class="w-20 h-14 object-cover rounded border"
        />
      </template>
    </div>

    <!-- 📋 Detail Info -->
    <div class="space-y-2 mt-4">
      <div><strong>Tanggal:</strong> {{ result.date }}</div>

      <div v-if="result.pics?.length">
        <strong>PIC:</strong>
        {{
          result.pics
            .map((p) => p?.directus_users_id?.first_name || "")
            .filter(Boolean)
            .join(", ")
        }}
      </div>

      <div><strong>Jam Mulai:</strong> {{ result.start_time }}</div>
      <div><strong>Jam Selesai:</strong> {{ result.end_time }}</div>
      <div><strong>Lokasi:</strong> {{ result.location }}</div>

      <div>
        <strong>Deskripsi:</strong>
        <p class="whitespace-pre-line">{{ result.description || "-" }}</p>
      </div>
    </div>
  </div>
</template>
