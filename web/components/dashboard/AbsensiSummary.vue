<script setup lang="ts">
import type { SvgoIcCheck } from "#components";
import { ref, computed } from "vue";

// Indonesian day names
const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

// Today's date
const today = ref(new Date());

// Get current year, month, and week number
const year = computed(() => today.value.getFullYear());
const month = computed(() =>
  today.value.toLocaleString("id-ID", { month: "long" })
);

// Calculate week number in month
function getWeekOfMonth(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfWeek = start.getDay() || 7; // Make Sunday = 7
  const offsetDate = date.getDate() + dayOfWeek - 1;
  return Math.ceil(offsetDate / 7);
}

const weekNumber = computed(() => getWeekOfMonth(today.value));

// Get start of current week (Monday as start)
function getWeekDays(date: Date) {
  const day = date.getDay() || 7; // Make Sunday = 7
  const monday = new Date(date);
  monday.setDate(date.getDate() - (day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const weekDays = computed(() => getWeekDays(today.value));

// Dummy absen data: mark checked if date ≤ today
function isChecked(date: Date) {
  return date <= today.value;
}

function isToday(date: Date) {
  return (
    date.getDate() === today.value.getDate() &&
    date.getMonth() === today.value.getMonth() &&
    date.getFullYear() === today.value.getFullYear()
  );
}
</script>

<template>
  <div class="p-4 rounded-xl shadow bg-grey-100">
    <!-- Header -->
    <div class="text-center mb-4">
      <h2 class="font-medium text-lg">
        Week {{ weekNumber }} - {{ month }} {{ year }}
      </h2>
    </div>

    <!-- Week Days -->
    <div class="grid grid-cols-7 gap-2 text-center">
      <div
        v-for="(date, i) in weekDays"
        :key="i"
        class="flex flex-col items-center space-y-3 rounded-lg py-2"
        :class="isToday(date) ? 'border border-red-400' : ''"
      >
        <p
          class="text-sm"
          :class="isToday(date) || isChecked(date) ? 'text-red-600' : ''"
        >
          {{ days[i] }}
        </p>
        <div
          :class="[
            'w-10 h-10 flex items-center justify-center rounded-full border',
            isToday(date)
              ? 'border-red-500 text-red-500 font-bold'
              : isChecked(date)
              ? 'border-red-400 bg-red-100 text-red-600'
              : 'border-gray-300 text-gray-400',
          ]"
        >
          <SvgoIcCheck v-if="isChecked(date)" class="w-4 h-4" />
          <SvgoIcUser v-if="!isChecked(date)" class="w-4 h-4" />
        </div>
        <div
          class="text-xs mt-1"
          :class="
            isToday(date) ? 'text-red-500 font-semibold' : 'text-gray-500'
          "
        >
          {{ isToday(date) ? "Hari Ini" : "Hari " + (i + 1) }}
        </div>
      </div>
    </div>

    <!-- Button -->
    <div class="mt-4">
      <UButton block class="!text-white mt-4" size="lg">Daily Check-in</UButton>
    </div>
  </div>
</template>
