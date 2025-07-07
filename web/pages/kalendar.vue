<script setup>
definePageMeta({
  middleware: "auth",
});

import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

// Calendar instance
let calendar = null;
const calendarEl = ref(null);

// Reactive data
const selectedView = ref("Bulanan");
const currentMonthYear = ref("January 2025");

const viewOptions = [
  { label: "Bulanan", value: "Bulanan" },
  { label: "Mingguan", value: "Mingguan" },
  { label: "Harian", value: "Harian" },
];

// Sample events data
const events = [
  {
    id: "1",
    title: "PDC - Anggil I Jadal Rencana Kerja",
    start: "2025-07-08",
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
    textColor: "#ffffff",
  },
  {
    id: "2",
    title: "PDC - Anggil I Jadal Rencana Kerja",
    start: "2025-07-07",
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
    textColor: "#ffffff",
  },
  {
    id: "3",
    title: "PDC - Anggil I Jadal Rencana Kerja",
    start: "2025-07-07",
    backgroundColor: "#10B981",
    borderColor: "#10B981",
    textColor: "#ffffff",
  },
  {
    id: "4",
    title: "PDC - Anggil I Jadal Rencana Kerja",
    start: "2025-07-08",
    backgroundColor: "#F59E0B",
    borderColor: "#F59E0B",
    textColor: "#ffffff",
  },
];

// Initialize calendar
onMounted(async () => {
  await nextTick();

  // Double check the element exists before creating calendar
  if (!calendarEl.value) {
    console.error("Calendar element not found");
    return;
  }

  try {
    calendar = new Calendar(calendarEl.value, {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: "dayGridMonth",
      headerToolbar: false, // We'll use our custom header
      locale: "id", // Indonesian locale
      firstDay: 1, // Monday as first day
      height: "auto",
      events: events,
      dayHeaderFormat: { weekday: "long" },
      dayHeaderClassNames: "text-sm font-medium text-gray-700 py-3",
      dayCellClassNames: "border-gray-200 min-h-[120px]",
      eventClassNames: "text-xs rounded px-2 py-1 mb-1 cursor-pointer",
      dayMaxEvents: false, // Show all events
      moreLinkClick: "popover",
      eventClick: function (info) {
        // Handle event click
        console.log("Event clicked:", info.event.title);
      },
      dateClick: function (info) {
        // Handle date click
        console.log("Date clicked:", info.dateStr);
      },
      datesSet: function (info) {
        // Update month/year display when view changes
        updateMonthYear(info.start);
      },
      // Custom day header content
      dayHeaderContent: function (arg) {
        const dayNames = [
          "Minggu",
          "Senin",
          "Selasa",
          "Rabu",
          "Kamis",
          "Jumat",
          "Sabtu",
        ];
        return dayNames[arg.date.getDay()];
      },
      // Custom day cell content
      dayCellContent: function (arg) {
        return arg.date.getDate();
      },
    });

    calendar.render();
    updateMonthYear(calendar.getDate());
  } catch (error) {
    console.error("Error initializing calendar:", error);
  }
});

// Update month/year display
function updateMonthYear(date) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  currentMonthYear.value = `${month} ${year}`;
}

// Navigation functions
function previousMonth() {
  if (calendar) {
    calendar.prev();
  }
}

function nextMonth() {
  if (calendar) {
    calendar.next();
  }
}

// Cleanup
onUnmounted(() => {
  if (calendar) {
    calendar.destroy();
    calendar = null;
  }
});

// Watch for view changes
watch(selectedView, (newView) => {
  if (calendar) {
    switch (newView) {
      case "Mingguan":
        calendar.changeView("dayGridWeek");
        break;
      case "Harian":
        calendar.changeView("dayGridDay");
        break;
      default:
        calendar.changeView("dayGridMonth");
    }
  }
});
</script>

<template>
  <div class="min-h-screen bg-grey-100 rounded-lg">
    <!-- Header -->
    <header class="flex items-center justify-between p-6">
      <div class="flex items-center gap-3">
        <h1 class="text-4xl font-semibold text-gray-900">
          {{ currentMonthYear }}
        </h1>

        <UButton
          icon="i-lucide-chevron-left"
          variant="ghost"
          color="gray"
          class="border border-gray-300"
          size="lg"
          @click="previousMonth"
        />
        <UButton
          icon="i-lucide-chevron-right"
          variant="ghost"
          color="gray"
          class="border border-gray-300"
          size="lg"
          @click="nextMonth"
        />
      </div>
      <div class="flex gap-3">
        <USelect
          v-model="selectedView"
          :items="viewOptions"
          size="lg"
          variant="ghost"
          placeholder="Pilih Tampilan"
          class="border border-gray-300"
          :ui="{
            content: 'bg-grey-100 rounded-lg border border-gray-300',
          }"
        />
        <UButton
          icon="i-lucide-download"
          variant="outline"
          color="gray"
          size="lg"
        />
        <UButton size="lg"> + Buat Rencana Kerja </UButton>
      </div>
    </header>

    <!-- Calendar Container -->
    <div class="">
      <div ref="calendarEl" class="p-6"></div>
    </div>
  </div>
</template>

<style>
/* Custom FullCalendar styles */
.fc {
  font-family: inherit;
}

.fc-theme-standard td,
.fc-theme-standard th {
  border: 1px solid #e5e7eb;
}

.fc-col-header-cell {
  background-color: #f4f3f1;
  font-weight: 600;
  color: #9b9b9b;
  font-size: 12px;
}

.fc-daygrid-day {
  background-color: #f4f3f1;
  height: 8rem;
}

.fc-daygrid-day-number {
  color: #161414;
  font-weight: 400;
  font-size: 16px;
}

.fc-daygrid-day.fc-day-today {
  background-color: #fef3c7;
}

.fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
  color: #92400e;
  font-weight: 600;
}

.fc-event {
  font-size: 11px;
  border: none;
  border-radius: 4px;
  padding: 2px 6px;
  margin-bottom: 2px;
  cursor: pointer;
}

.fc-event:hover {
  opacity: 0.8;
}

.fc-daygrid-event {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Hide default more link */
.fc-more-link {
  display: none;
}

/* Custom scrollbar for events */
.fc-daygrid-day-events {
  max-height: 90px;
  overflow-y: auto;
}

.fc-daygrid-day-events::-webkit-scrollbar {
  width: 4px;
}

.fc-daygrid-day-events::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.fc-daygrid-day-events::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}
</style>
