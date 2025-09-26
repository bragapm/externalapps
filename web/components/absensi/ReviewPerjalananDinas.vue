<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import { ref, computed } from "vue";

interface User {
  first_name?: string;
  last_name?: string;
}

interface BusinessTrip {
  id: string;
  user?: User | null;
  nik?: string | null;
  role?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  destination?: string | null;
  transportation?: string | null;
  purpose?: string | null;
  duration?: string | null;
  attachment?: {
    directus_files_id?: { id: string; filename_download: string };
  }[];
  status?: string | null;
  rejection_reason?: string | null;
}

const props = defineProps<{ id: string }>();

const auth = useAuth();

const { data, isFetching } = useQuery<BusinessTrip>({
  queryKey: ["business-trip-detail", props.id],
  queryFn: async () => {
    return await $fetch<BusinessTrip>(
      `/panel/items/business_trips/${props.id}`,
      {
        params: {
          fields: [
            "id",
            "user.first_name",
            "user.last_name",
            "start_date",
            "end_date",
            "destination",
            "transportation",
            "purpose",
            "status",
            "attachment.directus_files_id.id",
            "attachment.directus_files_id.filename_download",
          ].join(","),
        },
      }
    );
  },
  enabled: !!props.id,
});

const infoItems = computed(() => {
  if (!data.value) return [];

  return [
    {
      label: "Nama",
      value:
        `${data.value.user?.first_name || ""} ${
          data.value.user?.last_name || ""
        }`.trim() || "-",
    },
    { label: "ID pegawai", value: data.value.nik || "-" },
    { label: "Role", value: data.value.role || "-" },
    {
      label: "Tanggal Mulai",
      value: data.value.start_date
        ? new Date(data.value.start_date).toLocaleDateString("id-ID")
        : "-",
    },
    {
      label: "Tanggal Selesai",
      value: data.value.end_date
        ? new Date(data.value.end_date).toLocaleDateString("id-ID")
        : "-",
    },
    { label: "Tujuan", value: data.value.destination || "-" },
    { label: "Transport", value: data.value.transportation || "-" },
    { label: "Agenda", value: data.value.purpose || "-" },
    { label: "Durasi", value: data.value.duration || "-" },
    {
      label: "Lampiran",
      value: data.value.attachment?.length
        ? data.value.attachment
            .map(
              (att) =>
                `<a href="/assets/${att.directus_files_id?.id}" class="text-blue-500 underline" target="_blank">${att.directus_files_id?.filename_download}</a>`
            )
            .join(", ")
        : "-",
    },
    { label: "Status", value: data.value.status || "-" },
  ];
});
</script>

<template>
  <DashboardProfileCard />

  <!-- Loading State -->
  <div v-if="isFetching" class="p-4 text-sm text-gray-500">Loading...</div>

  <!-- Details -->
  <div v-else class="mt-3 p-4 rounded-lg border border-grey-200">
    <div
      v-for="item in infoItems"
      :key="item.label"
      class="grid grid-cols-2 gap-2 items-center"
    >
      <p class="text-xs text-grey-500 font-medium">{{ item.label }}</p>
      <p
        v-if="item.label !== 'Lampiran'"
        class="text-sm text-grey-950 font-medium"
      >
        {{ item.value }}
      </p>
      <p
        v-else
        class="text-sm text-grey-950 font-medium"
        v-html="item.value"
      ></p>
    </div>
  </div>

  <!-- Rejection reason -->
  <div
    v-if="data?.rejection_reason"
    class="mt-3 p-4 rounded-lg border border-grey-200"
  >
    <p class="text-xs text-grey-600">Alasan Penolakan</p>
    <p class="text-base text-grey-800">
      {{ data.rejection_reason }}
    </p>
  </div>
</template>
