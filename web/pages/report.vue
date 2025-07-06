<script lang="ts" setup>
definePageMeta({
  middleware: "auth",
});

const startDate = ref<string>();
const endDate = ref<string>();
</script>

<template>
  <div class="bg-grey-100 rounded-lg p-6 mb-16">
    <section class="flex justify-between mb-3">
      <div class="flex gap-3">
        <UInput
          v-model="startDate"
          type="date"
          size="lg"
          variant="ghost"
          class="border-gray-300 border text-xs text-gray-900 rounded-sm"
        />
        <UInput
          v-model="endDate"
          type="date"
          size="lg"
          variant="ghost"
          class="border-gray-300 border text-xs text-gray-900 rounded-sm"
        />
        <UButton label="Terapkan" size="lg" />
      </div>
      <div class="flex gap-3">
        <UButton
          trailing-icon="i-lucide-chevron-down"
          variant="outline"
          color="gray"
          label="Filter"
          size="lg"
        />
        <UButton
          icon="i-lucide-download"
          variant="outline"
          color="gray"
          size="lg"
        />
      </div>
    </section>
    <section class="space-y-3">
      <div class="flex gap-3">
        <ChartBarChart
          class="w-full"
          title="Report Issue Summary"
          :stacked="false"
          :labels="[
            'General',
            'Collaboration',
            'Land dispute',
            'Environmental',
          ]"
          :datasets="[
            {
              label: 'Open',
              data: [12, 28, 6, 24],
              backgroundColor: '#3B82F6',
            },
            {
              label: 'Close',
              data: [25, 10, 22, 15],
              backgroundColor: '#22C55E',
            },
          ]"
        />

        <ChartPieChart
          class="w-[80%]"
          title="Report Summary"
          :data="[
            { label: 'General', value: 20, color: '#84cc16' },
            { label: 'Collaboration', value: 40, color: '#eab308' },
            { label: 'Land dispute', value: 40, color: '#f97316' },
            { label: 'Environmental', value: 20, color: '#ef4444' },
          ]"
        />
      </div>

      <ChartBarChart
        :height="'h-72'"
        title="Report Status"
        :labels="[
          'Priya',
          'Angel',
          'Ilam',
          'David',
          'Nirina',
          'Alma',
          'Noah',
          'Olivia',
        ]"
        :datasets="[
          {
            label: 'Open',
            data: [6, 6, 6, 6, 5, 5, 5, 5],
            backgroundColor: '#3B82F6',
          },
          {
            label: 'Close',
            data: [5, 3, 2, 3, 2, 6, 6, 6],
            backgroundColor: '#22C55E',
            borderRadius: 4,
          },
        ]"
        :stacked="true"
        :showPeriodSelector="true"
        :periodOptions="[
          { label: 'Tidak Hadir', value: 'Tidak Hadir' },
          { label: 'Hadir', value: 'Hadir' },
        ]"
      />
    </section>
  </div>
</template>
