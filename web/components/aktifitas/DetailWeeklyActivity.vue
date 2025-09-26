<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

import { useQuery } from "@tanstack/vue-query";

const props = defineProps<{ id: string }>();
const authStore = useAuth();

interface ReportType {
  name?: string;
}

interface UserCreated {
  first_name?: string;
  last_name?: string;
}

interface Attachment {
  id: string;
  filename_download: string;
  type: string;
}

interface DocumentFile {
  id: string;
  directus_files_id: Attachment;
}

interface DailyActivity {
  id: string;
  title: string;
  date: string;
  report_type?: ReportType | null;
  documents?: DocumentFile[] | null;
}

interface WeeklyActivity {
  id: string;
  title: string;
  summary?: string | null;
  status: string;
  date_created: string;
  user_created?: UserCreated | null;
  daily_activities?: DailyActivity[] | null;
}

const {
  data: result,
  isFetching,
  isError,
} = useQuery<WeeklyActivity>({
  queryKey: ["weekly-activity-detail", props.id],
  queryFn: async () => {
    const res = await $fetch<{ data: WeeklyActivity }>(
      `/panel/items/weekly_activities/${props.id}`,
      {
        params: {
          fields: [
            "id,title,summary,date_created",
            "user_created.first_name,user_created.last_name",
            "daily_activities.id,daily_activities.title,daily_activities.date,daily_activities.report_type.name",
            "daily_activities.documents.directus_files_id.id",
            "daily_activities.documents.directus_files_id.filename_download",
            "daily_activities.documents.directus_files_id.type",
          ].join(","),
          deep: {
            daily_activities: { _limit: -1, documents: { _limit: -1 } },
          },
        },
      }
    );

    return res.data;
  },
});

// Document preview functionality
const selectedDocument = ref<Attachment | null>(null);
const isPreviewOpen = ref(false);

const openPreview = (attachment: Attachment) => {
  selectedDocument.value = attachment;
  isPreviewOpen.value = true;
};

const closePreview = () => {
  selectedDocument.value = null;
  isPreviewOpen.value = false;
};

const getFileIcon = (type: string) => {
  if (type.includes("pdf")) return "📄";
  if (type.includes("image")) return "🖼️";
  if (type.includes("word") || type.includes("document")) return "📝";
  if (type.includes("excel") || type.includes("sheet")) return "📊";
  if (type.includes("powerpoint") || type.includes("presentation")) return "📋";
  return "📎";
};

const isImageFile = (type: string) => {
  return type.includes("image");
};

const isPdfFile = (type: string) => {
  return type.includes("pdf");
};

const getFileUrl = (fileId: string) => {
  return `/panel/assets/${fileId}?access_token=${authStore.accessToken}`;
};

const downloadFile = (attachment: Attachment) => {
  const link = document.createElement("a");
  link.href = getFileUrl(attachment.id);
  link.download = attachment.filename_download;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<template>
  <div>
    <div v-if="isFetching" class="text-sm text-gray-500">Loading...</div>
    <div v-else-if="isError" class="text-sm text-red-500">
      Failed to load data.
    </div>
    <div v-else-if="result" class="space-y-4 text-sm text-gray-900">
      <!-- Title -->
      <div class="font-semibold">
        {{ result.title }}
      </div>

      <!-- Summary -->
      <div>
        <p class="font-medium">Summary</p>
        <p class="whitespace-pre-line">{{ result.summary || "-" }}</p>
      </div>

      <!-- Created Info -->
      <div class="text-xs text-gray-500">
        Dibuat pada:
        {{
          new Date(result.date_created).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        }}
        oleh {{ result.user_created?.first_name || "Unknown" }}
        {{ result.user_created?.last_name || "" }}
      </div>

      <!-- Linked Daily Activities -->
      <div v-if="result.daily_activities?.length" class="mt-4">
        <h3 class="text-sm font-medium">Daily Activities</h3>
        <ul class="mt-2 space-y-2">
          <li
            v-for="act in result.daily_activities"
            :key="act.id"
            class="border border-gray-300 rounded-lg p-3 hover:bg-gray-50"
          >
            <div class="font-medium">{{ act.title }}</div>
            <div class="text-xs text-gray-500 mb-2">
              {{
                new Date(act.date).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              }}
              <span v-if="act.report_type?.name">
                • {{ act.report_type.name }}
              </span>
            </div>

            <!-- Documents Section -->
            <div v-if="act.documents?.length" class="mt-2 space-y-2">
              <div
                v-for="doc in act.documents"
                :key="doc.directus_files_id.id"
                class="p-2 bg-gray-50 rounded border"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <span class="text-lg">
                      {{ getFileIcon(doc.directus_files_id.type) }}
                    </span>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium text-gray-900 truncate">
                        {{ doc.directus_files_id.filename_download }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ doc.directus_files_id.type }}
                      </p>
                    </div>
                  </div>
                  <div class="flex space-x-1">
                    <button
                      @click="openPreview(doc.directus_files_id)"
                      class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Preview
                    </button>
                    <button
                      @click="downloadFile(doc.directus_files_id)"
                      class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Document Preview Modal -->
    <div
      v-if="isPreviewOpen && selectedDocument"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="closePreview"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-4 border-b">
          <div class="flex items-center space-x-2">
            <span class="text-xl">{{
              getFileIcon(selectedDocument.type)
            }}</span>
            <h3 class="text-lg font-medium text-gray-900 truncate">
              {{ selectedDocument.filename_download }}
            </h3>
          </div>
          <div class="flex space-x-2">
            <button
              @click="downloadFile(selectedDocument)"
              class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              Download
            </button>
            <button
              @click="closePreview"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="flex-1 overflow-hidden">
          <!-- Image Preview -->
          <div
            v-if="isImageFile(selectedDocument.type)"
            class="h-full flex items-center justify-center p-4"
          >
            <img
              :src="getFileUrl(selectedDocument.id)"
              :alt="selectedDocument.filename_download"
              class="max-w-full max-h-full object-contain"
            />
          </div>

          <!-- PDF Preview -->
          <div v-else-if="isPdfFile(selectedDocument.type)" class="h-full">
            <iframe
              :src="getFileUrl(selectedDocument.id)"
              class="w-full h-full border-0"
              title="PDF Preview"
            />
          </div>

          <!-- Other File Types -->
          <div v-else class="h-full flex items-center justify-center p-8">
            <div class="text-center">
              <div class="text-6xl mb-4">
                {{ getFileIcon(selectedDocument.type) }}
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                {{ selectedDocument.filename_download }}
              </h3>
              <p class="text-gray-500 mb-4">
                Preview not available for this file type
              </p>
              <button
                @click="downloadFile(selectedDocument)"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Download to View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
