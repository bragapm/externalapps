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

interface DailyActivity {
  id: string;
  title: string;
  date: string;
  report_type?: ReportType | null;
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
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`,
        },
        params: {
          fields: [
            "id,title,summary,date_created",
            "user_created.first_name,user_created.last_name",
            "daily_activities.id,daily_activities.title,daily_activities.date,daily_activities.report_type.name",
          ].join(","),
        },
      }
    );

    return res.data;
  },
});
</script>

<template>
  <div v-if="isFetching" class="text-sm text-gray-500">Loading...</div>
  <div v-else-if="isError" class="text-sm text-red-500">
    Failed to load data.
  </div>
  <div v-else-if="result" class="space-y-4 text-sm text-gray-800">
    <!-- Status -->

    <!-- Title -->
    <div class="text-lg font-semibold">
      {{ result.title }}
    </div>

    <!-- Summary -->
    <div>
      <strong>Summary:</strong>
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
      <h3 class="font-semibold">Daily Activities</h3>
      <ul class="mt-2 space-y-2">
        <li
          v-for="act in result.daily_activities"
          :key="act.id"
          class="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
        >
          <div class="font-medium">{{ act.title }}</div>
          <div class="text-xs text-gray-500">
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
        </li>
      </ul>
    </div>
  </div>
</template>
