<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

const startDate = ref<string>();
const endDate = ref<string>();

const items = [
  {
    label: "Absensi",
    slot: "absensi" as const,
  },
  {
    label: "Cuti",
    slot: "cuti" as const,
  },
  {
    label: "Perjalanan Dinas",
    slot: "dinas" as const,
  },
] satisfies TabsItem[];
</script>

<template>
  <UTabs
    :items="items"
    variant="link"
    class="gap-4 w-full"
    :ui="{
      trigger:
        'font-medium text-base text-grey-800 data-[state=inactive]:text-gray-800 mr-4 last:mr-0',
      label: 'font-medium text-base',
    }"
  >
    <template #absensi="{ item }">
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
        <UButton
          icon="i-lucide-download"
          variant="outline"
          color="gray"
          label="Download All"
          size="lg"
        />
      </section>
      <section class="grid grid-cols-2 gap-3">
        <ChartLineChart
          title="Tren Absensi"
          :data="{
            labels: [
              'Jan',
              'Feb',
              'Mar',
              'Apr',
              'Mei',
              'Jun',
              'Jul',
              'Agu',
              'Sept',
              'Okt',
              'Nov',
              'Des',
            ],
            datasets: [
              {
                label: 'Priya',
                data: [18, 12, 20, 15, 9, 5, 10, 20, 15, 18, 22, 21],
                borderColor: '#3B82F6',
                backgroundColor: '#3B82F6',
              },
              {
                label: 'Angel',
                data: [4, 2, 1, 0, 1, 2, 3, 4, 5, 5, 6, 5],
                borderColor: '#EF4444',
                backgroundColor: '#EF4444',
              },
              {
                label: 'Ilam',
                data: [14, 15, 16, 15, 15, 15, 15, 15, 12, 10, 8, 9],
                borderColor: '#10B981',
                backgroundColor: '#10B981',
              },
              {
                label: 'David',
                data: [10, 12, 15, 14, 13, 10, 11, 13, 14, 16, 18, 17],
                borderColor: '#F59E0B',
                backgroundColor: '#F59E0B',
              },
              {
                label: 'Nirina',
                data: [19, 14, 13, 18, 20, 18, 20, 16, 19, 18, 20, 18],
                borderColor: '#EC4899',
                backgroundColor: '#EC4899',
              },
              {
                label: 'Noah',
                data: [5, 8, 10, 8, 7, 6, 7, 8, 6, 7, 8, 6],
                borderColor: '#8B5CF6',
                backgroundColor: '#8B5CF6',
              },
              {
                label: 'Olivia',
                data: [10, 15, 14, 16, 15, 17, 18, 19, 18, 20, 20, 19],
                borderColor: '#06B6D4',
                backgroundColor: '#06B6D4',
              },
            ],
          }"
          :showPeriodSelector="true"
          :periodOptions="[
            { label: 'Tidak Hadir', value: 'Tidak Hadir' },
            { label: 'Hadir', value: 'Hadir' },
          ]"
          @periodChange="(val) => console.log('Period changed:', val)"
        />
        <ChartBarChart
          title="Total Absensi"
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
              label: 'Tidak Hadir',
              data: [6, 6, 6, 6, 5, 5, 5, 5],
              backgroundColor: '#EF4444',
            },
            {
              label: 'Hadir',
              data: [5, 3, 2, 3, 2, 6, 6, 6],
              backgroundColor: '#3B82F6',
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
    </template>

    <template #cuti="{ item }">
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
        <UButton
          icon="i-lucide-download"
          variant="outline"
          color="gray"
          label="Download All"
          size="lg"
        />
      </section>
      <section class="grid grid-cols-2 gap-3">
        <ChartLineChart
          title="Tren Absensi"
          :data="{
            labels: [
              'Jan',
              'Feb',
              'Mar',
              'Apr',
              'Mei',
              'Jun',
              'Jul',
              'Agu',
              'Sept',
              'Okt',
              'Nov',
              'Des',
            ],
            datasets: [
              {
                label: 'Priya',
                data: [18, 12, 20, 15, 9, 5, 10, 20, 15, 18, 22, 21],
                borderColor: '#3B82F6',
                backgroundColor: '#3B82F6',
              },
              {
                label: 'Angel',
                data: [4, 2, 1, 0, 1, 2, 3, 4, 5, 5, 6, 5],
                borderColor: '#EF4444',
                backgroundColor: '#EF4444',
              },
              {
                label: 'Ilam',
                data: [14, 15, 16, 15, 15, 15, 15, 15, 12, 10, 8, 9],
                borderColor: '#10B981',
                backgroundColor: '#10B981',
              },
              {
                label: 'David',
                data: [10, 12, 15, 14, 13, 10, 11, 13, 14, 16, 18, 17],
                borderColor: '#F59E0B',
                backgroundColor: '#F59E0B',
              },
              {
                label: 'Nirina',
                data: [19, 14, 13, 18, 20, 18, 20, 16, 19, 18, 20, 18],
                borderColor: '#EC4899',
                backgroundColor: '#EC4899',
              },
              {
                label: 'Noah',
                data: [5, 8, 10, 8, 7, 6, 7, 8, 6, 7, 8, 6],
                borderColor: '#8B5CF6',
                backgroundColor: '#8B5CF6',
              },
              {
                label: 'Olivia',
                data: [10, 15, 14, 16, 15, 17, 18, 19, 18, 20, 20, 19],
                borderColor: '#06B6D4',
                backgroundColor: '#06B6D4',
              },
            ],
          }"
          :showPeriodSelector="true"
          :periodOptions="[
            { label: 'Tidak Hadir', value: 'Tidak Hadir' },
            { label: 'Hadir', value: 'Hadir' },
          ]"
          @periodChange="(val) => console.log('Period changed:', val)"
        />
        <ChartBarChart
          title="Total Cuti"
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
              label: 'Total Cuti',
              data: [10.5, 9, 8.5, 9, 6, 10.5, 10.5, 10.5],
              backgroundColor: '#20D372',
              borderRadius: 4,
            },
          ]"
          :show-period-selector="true"
          @period-change="(value) => console.log('Period changed:', value)"
        />
      </section>
    </template>
    <template #dinas="{ item }">
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
        <UButton
          icon="i-lucide-download"
          variant="outline"
          color="gray"
          label="Download All"
          size="lg"
        />
      </section>
      <section class="grid grid-cols-2 gap-3">
        <ChartLineChart
          title="Tren Perjalanan Dinas"
          :data="{
            labels: [
              'Jan',
              'Feb',
              'Mar',
              'Apr',
              'Mei',
              'Jun',
              'Jul',
              'Agu',
              'Sept',
              'Okt',
              'Nov',
              'Des',
            ],
            datasets: [
              {
                label: 'Priya',
                data: [18, 12, 20, 15, 9, 5, 10, 20, 15, 18, 22, 21],
                borderColor: '#3B82F6',
                backgroundColor: '#3B82F6',
              },
              {
                label: 'Angel',
                data: [4, 2, 1, 0, 1, 2, 3, 4, 5, 5, 6, 5],
                borderColor: '#EF4444',
                backgroundColor: '#EF4444',
              },
              {
                label: 'Ilam',
                data: [14, 15, 16, 15, 15, 15, 15, 15, 12, 10, 8, 9],
                borderColor: '#10B981',
                backgroundColor: '#10B981',
              },
              {
                label: 'David',
                data: [10, 12, 15, 14, 13, 10, 11, 13, 14, 16, 18, 17],
                borderColor: '#F59E0B',
                backgroundColor: '#F59E0B',
              },
              {
                label: 'Nirina',
                data: [19, 14, 13, 18, 20, 18, 20, 16, 19, 18, 20, 18],
                borderColor: '#EC4899',
                backgroundColor: '#EC4899',
              },
              {
                label: 'Noah',
                data: [5, 8, 10, 8, 7, 6, 7, 8, 6, 7, 8, 6],
                borderColor: '#8B5CF6',
                backgroundColor: '#8B5CF6',
              },
              {
                label: 'Olivia',
                data: [10, 15, 14, 16, 15, 17, 18, 19, 18, 20, 20, 19],
                borderColor: '#06B6D4',
                backgroundColor: '#06B6D4',
              },
            ],
          }"
          :showPeriodSelector="true"
          :periodOptions="[
            { label: 'Tidak Hadir', value: 'Tidak Hadir' },
            { label: 'Hadir', value: 'Hadir' },
          ]"
          @periodChange="(val) => console.log('Period changed:', val)"
        />
        <ChartBarChart
          title="Total Perjalanan Dinas"
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
              label: 'Total Perjalanan Dinas',
              data: [10.5, 9, 8.5, 9, 6, 10.5, 10.5, 10.5],
              backgroundColor: '#EDB82E',
              borderRadius: 4,
            },
          ]"
          :show-period-selector="true"
          @period-change="(value) => console.log('Period changed:', value)"
        />
      </section>
    </template>
  </UTabs>
</template>
