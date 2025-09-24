<script lang="ts" setup>
definePageMeta({
  middleware: "auth",
});

import { h, ref, computed, watch } from "vue";
import type { TableColumn } from "@nuxt/ui";
import { useQuery } from "@tanstack/vue-query";

const selectedPublication = ref<any>(null);
const openDetail = ref(false);
const openEdit = ref(false);
const openCreate = ref(false);

function handleViewDetail(row: any) {
  selectedPublication.value = row.original;
  openDetail.value = true;
}

function handleEdit(row: any) {
  selectedPublication.value = row.original;
  openEdit.value = true;
}

function handleCloseEdit() {
  openEdit.value = false;
  selectedPublication.value = null;
}

function handleCloseCreate() {
  openCreate.value = false;
}

const page = ref(1);
const pageSize = ref(10);
const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);
const search = ref("");
const currentQueryParams = ref<Record<string, string>>();

const authStore = useAuth();

function handleDateUpdate(startDateInput?: string, endDateInput?: string) {
  startDate.value = startDateInput ?? null;
  endDate.value = endDateInput ?? null;
}

// Build query parameters reactively
const queryParams = computed(() => {
  const params = new URLSearchParams();
  params.append("limit", pageSize.value.toString());
  params.append("offset", ((page.value - 1) * pageSize.value).toString());

  if (search.value) {
    params.append("filter[title][_icontains]", search.value);
  }

  if (startDate.value) {
    params.append("filter[date_created][_gte]", startDate.value);
  }

  if (endDate.value) {
    params.append("filter[date_created][_lte]", endDate.value);
  }

  // Expand media relation fully
  params.append("fields", "*,media.*");

  return params.toString();
});

// Keep current query params for header controls
watch(
  queryParams,
  (newParams) => {
    currentQueryParams.value = Object.fromEntries(
      new URLSearchParams(newParams)
    );
  },
  { immediate: true }
);

// Fetch publications with better error handling and debugging
const { data: publicationsResponse, isPending: isLoading } = useQuery({
  queryKey: ["publications", queryParams],
  queryFn: async () => {
    try {
      const response = await $fetch(
        `/panel/items/publications?${queryParams.value}`,
        {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
        }
      );

      return response;
    } catch (error) {
      console.error("Publications fetch error:", error);
      throw error;
    }
  },
});

// Fetch chart data with corrected media aggregation
const { data: chartResponse } = useQuery({
  queryKey: ["publications-charts"],
  queryFn: async () => {
    try {
      // Fetch all publications for manual aggregation of both media and sentiment
      const allPublications = await $fetch(
        "/panel/items/publications?fields=*,media.*&limit=-1",
        {
          headers: { Authorization: `Bearer ${authStore.accessToken}` },
        }
      );

      console.log("Chart - All publications:", allPublications);

      // Manual aggregation for media stats
      const mediaCount = {};
      const sentimentCount = {};

      allPublications.data?.forEach((item) => {
        // Count media
        const mediaName = item.media?.name || "Unknown Media";
        mediaCount[mediaName] = (mediaCount[mediaName] || 0) + 1;

        // Count sentiment
        const status = item.status || "neutral";
        sentimentCount[status] = (sentimentCount[status] || 0) + 1;
      });

      const processedMediaStats = Object.entries(mediaCount).map(
        ([name, count]) => ({
          media: { name },
          count,
        })
      );

      const processedSentimentStats = Object.entries(sentimentCount).map(
        ([status, count]) => ({
          status,
          count,
        })
      );

      console.log("Processed media stats:", processedMediaStats);
      console.log("Processed sentiment stats:", processedSentimentStats);

      return {
        mediaStats: { data: processedMediaStats },
        sentimentStats: { data: processedSentimentStats },
      };
    } catch (error) {
      console.error("Chart data fetch error:", error);
      return { mediaStats: { data: [] }, sentimentStats: { data: [] } };
    }
  },
});

// Transform publications data for table display
const data = computed(() => {
  const publications =
    publicationsResponse.value?.data?.map((item: any) => ({
      id: item.id,
      nama_media: item.media?.name || "N/A",
      pic: item.media?.pic || "N/A",
      jabatan: item.media?.role || "N/A",
      jumlah_berita: 1, // This represents 1 publication per row
      lampiran: item.file ? item.file : item.link ? "Link" : "N/A",
      kontak: item.media?.phone_number || "N/A",
      email: item.media?.email || "N/A",
      title: item.title,
      status: item.status,
      link: item.link,
      file: item.file,
      date_created: item.date_created,
      media: item.media, // Keep full media object for editing
    })) || [];

  console.log("Transformed data for table:", publications);
  return publications;
});

// Total data count
const totalData = computed(() => {
  const total =
    publicationsResponse.value?.meta?.total_count ||
    publicationsResponse.value?.data?.length ||
    0;
  console.log("Total data count:", total);
  return total;
});

// Transform chart data
const chartData = computed(() => {
  if (!chartResponse.value) {
    console.log("No chart response data");
    return { mediaCount: [], sentimentData: [] };
  }

  const mediaCount =
    chartResponse.value.mediaStats?.data?.map((item: any) => ({
      label: item.media?.name || "Unknown",
      count: item.count,
    })) || [];

  const sentimentData =
    chartResponse.value.sentimentStats?.data?.map((item: any) => {
      const status = item.status;
      return {
        label:
          status === "positive"
            ? "Positif"
            : status === "negative"
            ? "Negatif"
            : "Netral",
        value: item.count,
        color:
          status === "positive"
            ? "#21D372"
            : status === "negative"
            ? "#D32E36"
            : "#FFA500",
      };
    }) || [];

  console.log("Chart data - Media count:", mediaCount);
  console.log("Chart data - Sentiment:", sentimentData);

  return { mediaCount, sentimentData };
});

// Format date for display
function formatDate(dateString: string) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Get status label
function getStatusLabel(status: string) {
  switch (status) {
    case "positive":
      return "Positif";
    case "negative":
      return "Negatif";
    case "neutral":
      return "Netral";
    default:
      return "Tidak Diketahui";
  }
}

// Get status color
function getStatusColor(status: string) {
  switch (status) {
    case "positive":
      return "text-green-600 bg-green-100";
    case "negative":
      return "text-red-600 bg-red-100";
    case "neutral":
      return "text-yellow-600 bg-yellow-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

// Table columns
const columns: TableColumn<Record<string, any>>[] = [
  {
    id: "select",
    header: () => h("input", { type: "checkbox", class: "form-checkbox" }),
    cell: () =>
      h("input", {
        type: "checkbox",
        class: "form-checkbox",
      }),
  },
  {
    accessorKey: "nama_media",
    header: "Nama Media",
  },
  {
    accessorKey: "title",
    header: "Judul Publikasi",
    cell: ({ row }) =>
      h("div", { class: "max-w-xs truncate" }, row.getValue("title")),
  },
  {
    accessorKey: "pic",
    header: "PIC",
  },
  {
    accessorKey: "jabatan",
    header: "Jabatan",
  },
  {
    accessorKey: "status",
    header: "Sentimen",
    cell: ({ row }) => {
      const status = row.getValue("status");
      const colorClass = getStatusColor(status);
      const label = getStatusLabel(status);

      return h(
        "span",
        {
          class: `px-2 py-1 rounded-full text-xs font-medium ${colorClass}`,
        },
        label
      );
    },
  },
  {
    accessorKey: "lampiran",
    header: "Lampiran",
    cell: ({ row }) => {
      const file = row.original.file;
      const link = row.original.link;

      if (file) {
        return h(
          "a",
          {
            href: `/assets/${file}`,
            target: "_blank",
            class: "text-blue-500 underline text-sm",
          },
          { default: () => "File" }
        );
      } else if (link) {
        return h(
          "a",
          {
            href: link,
            target: "_blank",
            class: "text-blue-500 underline text-sm",
          },
          { default: () => "Link" }
        );
      }

      return h("span", { class: "text-gray-400 text-sm" }, "N/A");
    },
  },
  {
    accessorKey: "kontak",
    header: "Kontak",
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }) =>
      h("div", { class: "flex items-center gap-2" }, [
        h("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          class:
            "w-4 h-4 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          onClick: () => handleViewDetail(row),
          innerHTML: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>`,
          title: "View",
        }),

        h("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          class:
            "w-4 h-4 text-blue-600 cursor-pointer hover:text-blue-800 transition-colors",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          onClick: () => handleEdit(row),
          innerHTML: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>`,
          title: "Edit",
        }),
      ]),
  },
];

// Computed properties for charts
const mediaLabels = computed(() =>
  chartData.value.mediaCount.map((item) => item.label)
);

const mediaDatasets = computed(() => [
  {
    label: "Publikasi",
    data: chartData.value.mediaCount.map((item) => item.count),
    backgroundColor: "#ED6C2B",
    borderRadius: 4,
  },
]);

const sentimentChartData = computed(() => chartData.value.sentimentData);
</script>

<template>
  <div class="p-6 bg-gray-100 rounded-lg space-y-3">
    <DashboardTableHeaderControls
      v-model:search="search"
      @update-date="handleDateUpdate"
      :collection="'publications'"
      :queryParams="currentQueryParams"
    >
      <template #slideover-button>
        <UButton
          icon="i-heroicons-plus"
          label="Tambah Media & Publikasi"
          size="xl"
          class="text-sm"
          @click="openCreate = true"
        />
      </template>
    </DashboardTableHeaderControls>

    <section class="grid grid-cols-2 gap-3">
      <ChartBarChart
        title="Jumlah Media dan Publikasi"
        :labels="mediaLabels"
        :datasets="mediaDatasets"
        height="h-64"
        :showPeriodSelector="false"
        @periodChange="(period: any) => console.log('Selected period:', period)"
      />
      <ChartPieChart title="Sentimen Media" :data="sentimentChartData" />
    </section>

    <DashboardTable
      v-model:pageSize="pageSize"
      v-model:page="page"
      :data="data"
      :columns="columns"
      :totalData="totalData"
      :loading="isLoading"
    />

    <!-- Create Publikasi Slideover -->
    <USlideover
      v-model:open="openCreate"
      title="Tambah Publikasi"
      :ui="{
        content: 'w-full max-w-[40vw] m-9 rounded-lg',
        body: 'relative',
        title: 'text-sm font-semibold text-gray-900',
      }"
    >
      <template #body>
        <div class="w-full">
          <MediaFormMedia mode="create" @close="handleCloseCreate" />
        </div>
      </template>
    </USlideover>

    <!-- Detail Slideover -->
    <USlideover
      v-model:open="openDetail"
      title="Detail Publikasi"
      :ui="{
        content: 'w-full max-w-[40vw] m-9 rounded-lg',
        body: 'relative',
        title: 'text-sm font-semibold text-gray-900',
      }"
    >
      <template #body>
        <div v-if="selectedPublication" class="space-y-4 p-4">
          <div class="grid grid-cols-1 gap-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-semibold text-gray-900 mb-3">
                Informasi Publikasi
              </h3>

              <div class="space-y-3">
                <div>
                  <label class="text-sm font-medium text-gray-700"
                    >Judul:</label
                  >
                  <p class="text-gray-900">
                    {{ selectedPublication.title || "N/A" }}
                  </p>
                </div>

                <div>
                  <label class="text-sm font-medium text-gray-700"
                    >Media:</label
                  >
                  <p class="text-gray-900">
                    {{ selectedPublication.nama_media || "N/A" }}
                  </p>
                </div>

                <div>
                  <label class="text-sm font-medium text-gray-700">PIC:</label>
                  <p class="text-gray-900">
                    {{ selectedPublication.pic || "N/A" }}
                  </p>
                </div>

                <div>
                  <label class="text-sm font-medium text-gray-700"
                    >Jabatan:</label
                  >
                  <p class="text-gray-900">
                    {{ selectedPublication.jabatan || "N/A" }}
                  </p>
                </div>

                <div>
                  <label class="text-sm font-medium text-gray-700"
                    >Status:</label
                  >
                  <span
                    :class="`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      selectedPublication.status
                    )}`"
                  >
                    {{ getStatusLabel(selectedPublication.status) }}
                  </span>
                </div>

                <div>
                  <label class="text-sm font-medium text-gray-700"
                    >Kontak:</label
                  >
                  <p class="text-gray-900">
                    {{ selectedPublication.kontak || "N/A" }}
                  </p>
                </div>

                <div>
                  <label class="text-sm font-medium text-gray-700"
                    >Email:</label
                  >
                  <p class="text-gray-900">
                    {{ selectedPublication.email || "N/A" }}
                  </p>
                </div>

                <div>
                  <label class="text-sm font-medium text-gray-700"
                    >Lampiran:</label
                  >
                  <div class="mt-1">
                    <a
                      v-if="selectedPublication.file"
                      :href="`/assets/${selectedPublication.file}`"
                      target="_blank"
                      class="inline-flex items-center text-blue-500 hover:text-blue-600 underline"
                    >
                      <i class="i-heroicons-document w-4 h-4 mr-1"></i>
                      Lihat File
                    </a>
                    <a
                      v-else-if="selectedPublication.link"
                      :href="selectedPublication.link"
                      target="_blank"
                      class="inline-flex items-center text-blue-500 hover:text-blue-600 underline"
                    >
                      <i class="i-heroicons-link w-4 h-4 mr-1"></i>
                      Buka Link
                    </a>
                    <span v-else class="text-gray-500">Tidak ada lampiran</span>
                  </div>
                </div>

                <div>
                  <label class="text-sm font-medium text-gray-700"
                    >Dibuat:</label
                  >
                  <p class="text-gray-900">
                    {{ formatDate(selectedPublication.date_created) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </USlideover>

    <!-- Edit Slideover -->
    <USlideover
      v-model:open="openEdit"
      title="Edit Publikasi"
      :ui="{
        content: 'w-full max-w-[40vw] m-9 rounded-lg',
        body: 'relative',
        title: 'text-sm font-semibold text-gray-900',
      }"
    >
      <template #body>
        <div v-if="selectedPublication" class="p-4">
          <MediaFormMedia
            :publication="selectedPublication"
            mode="edit"
            @close="handleCloseEdit"
          />
        </div>
      </template>
    </USlideover>
  </div>
</template>
