<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from "vue";

// ===== Types =====
interface WorkPlan {
  id: number;
  title: string;
  description: string;
  status: string;
  date: string;
  pic?: string; // add PIC
}

interface WorkPlansResponse {
  data: WorkPlan[];
}

interface WorkPlanSingleResponse {
  data: WorkPlan;
}

// ===== Stores =====
const authStore = useAuth();
const toast = useToast();

// ===== Calendar refs =====
let calendar: Calendar | null = null;
const calendarEl = ref<HTMLElement | null>(null);
const selectedView = ref("Bulanan");
const currentMonthYear = ref("January 2025");

// ===== Slideover: Form =====
const isSlideoverOpen = ref(false);
const slideoverTitle = ref("Tambah Rencana Kerja");

// ===== Slideover: Day Review =====
const isDayReviewOpen = ref(false);
const selectedDate = ref<string | null>(null);
const eventsForSelectedDate = ref<any[]>([]);

// ===== Form state =====
const form = reactive({
  title: "",
  description: "",
  status: "open",
  date: "",
  pic: "",
});

const editingId = ref<number | null>(null);
const events = ref<any[]>([]);

// ===== API =====
async function fetchWorkPlans() {
  try {
    const res = await $fetch<WorkPlansResponse>(
      "/panel/items/work_plans?fields=*",
      {
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`,
        },
      }
    );

    events.value = res.data.map((item) => ({
      id: item.id,
      title: item.title,
      start: item.date,
      extendedProps: {
        description: item.description,
        status: item.status,
        pic: item.pic,
      },
      backgroundColor: item.status === "open" ? "#3B82F6" : "#6B7280",
      borderColor: item.status === "open" ? "#3B82F6" : "#6B7280",
      textColor: "#fff",
    }));

    if (calendar) {
      calendar.removeAllEvents();
      calendar.addEventSource(events.value);
    }
  } catch (err) {
    console.error("Failed to fetch work plans", err);
  }
}

async function submitForm() {
  try {
    const payload = {
      title: form.title,
      description: form.description,
      status: form.status,
      date: form.date,
      pic: form.pic,
    };

    let res: WorkPlanSingleResponse;

    if (editingId.value) {
      // Update existing
      res = await $fetch<WorkPlanSingleResponse>(
        `/panel/items/work_plans/${editingId.value}?fields=*`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${authStore.accessToken}` },
          body: payload,
        }
      );

      const ev = calendar?.getEventById(editingId.value.toString());
      if (ev) {
        ev.setProp("title", res.data.title);
        ev.setStart(res.data.date);
        ev.setProp(
          "backgroundColor",
          res.data.status === "open" ? "#3B82F6" : "#6B7280"
        );
        ev.setProp(
          "borderColor",
          res.data.status === "open" ? "#3B82F6" : "#6B7280"
        );
        ev.setExtendedProp("description", res.data.description);
        ev.setExtendedProp("status", res.data.status);
        ev.setExtendedProp("pic", res.data.pic);
      }

      toast.add({ title: "Berhasil update rencana kerja!" });
    } else {
      // Create new
      res = await $fetch<WorkPlanSingleResponse>(
        "/panel/items/work_plans?fields=*",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${authStore.accessToken}` },
          body: payload,
        }
      );

      calendar?.addEvent({
        id: res.data.id,
        title: res.data.title,
        start: res.data.date,
        backgroundColor: res.data.status === "open" ? "#3B82F6" : "#6B7280",
        borderColor: res.data.status === "open" ? "#3B82F6" : "#6B7280",
        textColor: "#fff",
        extendedProps: {
          description: res.data.description,
          status: res.data.status,
          pic: res.data.pic,
        },
      });

      toast.add({ title: "Berhasil simpan rencana kerja!" });
    }

    resetForm();
  } catch (err) {
    console.error("Failed to submit form", err);
    toast.add({ title: "Gagal simpan!" });
  }
}

async function deleteWorkPlan() {
  if (!editingId.value) return;

  try {
    await $fetch(`/panel/items/work_plans/${editingId.value}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
    });

    calendar?.getEventById(editingId.value.toString())?.remove();
    toast.add({ title: "Berhasil hapus rencana kerja!" });

    resetForm();
  } catch (err) {
    console.error("Failed to delete work plan", err);
    toast.add({ title: "Gagal hapus!" });
  }
}

function resetForm() {
  Object.assign(form, {
    title: "",
    description: "",
    status: "open",
    date: "",
    pic: "",
  });
  editingId.value = null;
  slideoverTitle.value = "Tambah Rencana Kerja";
  isSlideoverOpen.value = false;
}

// ===== Calendar setup =====
onMounted(async () => {
  await nextTick();

  if (!calendarEl.value) return;

  calendar = new Calendar(calendarEl.value, {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: "dayGridMonth",
    headerToolbar: false,
    locale: "id",
    firstDay: 1,
    height: "auto",
    events: events.value,
    dayHeaderFormat: { weekday: "long" },
    dayHeaderClassNames: "text-sm font-medium text-gray-700 py-3",
    dayCellClassNames: "border-gray-200 min-h-[120px]",
    eventClassNames: "text-xs rounded px-2 py-1 mb-1 cursor-pointer",
    dayMaxEvents: false,
    moreLinkClick: "popover",

    eventClick(info) {
      const ev = info.event;

      editingId.value = Number(ev.id);
      slideoverTitle.value = "Edit Rencana Kerja";

      form.title = ev.title;
      form.description = ev.extendedProps.description;
      form.status = ev.extendedProps.status;
      form.date = ev.startStr;
      form.pic = ev.extendedProps.pic;

      isSlideoverOpen.value = true;
    },

    dateClick(info) {
      const dateStr = info.dateStr;
      selectedDate.value = dateStr;

      eventsForSelectedDate.value =
        calendar?.getEvents().filter((ev) => ev.startStr === dateStr) || [];

      isDayReviewOpen.value = true;
    },

    datesSet(info) {
      updateMonthYear(calendar!.getDate());
    },

    dayHeaderContent(arg) {
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
    dayCellContent(arg) {
      return arg.date.getDate();
    },
  });

  calendar.render();
  await fetchWorkPlans();
});

function updateMonthYear(date: Date) {
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
  currentMonthYear.value = `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function previousMonth() {
  calendar?.prev();
}
function nextMonth() {
  calendar?.next();
}

onUnmounted(() => {
  calendar?.destroy();
  calendar = null;
});

watch(selectedView, (newView) => {
  if (!calendar) return;
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
          :items="[
            { label: 'Bulanan', value: 'Bulanan' },
            { label: 'Mingguan', value: 'Mingguan' },
            { label: 'Harian', value: 'Harian' },
          ]"
          size="lg"
          variant="ghost"
          class="border border-gray-300"
        />
        <UButton
          icon="i-heroicons-plus"
          label="Tambah Rencana Kerja"
          class="text-sm"
          size="lg"
          @click="
            resetForm();
            isSlideoverOpen = true;
          "
        />
      </div>
    </header>

    <!-- Calendar -->
    <div>
      <div ref="calendarEl" class="p-6"></div>
    </div>

    <!-- Slideover: Add/Edit -->
    <USlideover
      v-model:open="isSlideoverOpen"
      :title="slideoverTitle"
      :ui="{ content: 'w-full max-w-[40vw] m-9 rounded-lg' }"
    >
      <template #body>
        <form class="flex flex-col h-full" @submit.prevent="submitForm">
          <div class="flex-1 overflow-y-auto space-y-4 pr-2">
            <UFormField label="Tanggal" required>
              <UInput
                v-model="form.date"
                type="date"
                size="lg"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Judul" required>
              <UInput
                v-model="form.title"
                size="lg"
                placeholder="Masukkan judul"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Deskripsi">
              <UTextarea
                v-model="form.description"
                size="lg"
                placeholder="Masukkan deskripsi"
                class="w-full"
              />
            </UFormField>

            <UFormField label="PIC">
              <UInput
                v-model="form.pic"
                size="lg"
                placeholder="Masukkan PIC"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Status" required>
              <USelect
                v-model="form.status"
                :items="[
                  { label: 'Open', value: 'open' },
                  { label: 'Closed', value: 'closed' },
                ]"
                class="w-full"
              />
            </UFormField>
          </div>
          <div
            class="absolute left-6 right-6 bottom-6 pt-4 mt-4 space-y-4 bg-white border-t"
          >
            <UButton
              type="submit"
              color="primary"
              size="xl"
              class="w-full flex justify-center"
              >{{ editingId ? "Update" : "Simpan" }}</UButton
            >
            <UButton
              v-if="editingId"
              type="button"
              variant="outline"
              size="xl"
              class="w-full flex justify-center"
              @click="deleteWorkPlan"
              >Hapus</UButton
            >
          </div>
        </form>
      </template>
    </USlideover>

    <!-- Slideover: Review Day -->
    <USlideover
      v-model:open="isDayReviewOpen"
      title="Review Rencana Kerja Hari ini"
      :ui="{ content: 'w-full max-w-[40vw] m-9 rounded-lg' }"
    >
      <template #body>
        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-gray-900">
            {{
              new Date(selectedDate!).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
            }}
          </h2>

          <div v-if="eventsForSelectedDate.length > 0" class="space-y-4">
            <div
              v-for="ev in eventsForSelectedDate"
              :key="ev.id"
              class="p-4 rounded-lg border bg-white shadow-sm"
            >
              <h3 class="text-md font-semibold text-gray-800">
                {{ ev.title }}
              </h3>
              <p class="text-sm text-gray-600">
                <strong>PIC:</strong> {{ ev.extendedProps.pic || "-" }}
              </p>
              <p class="text-sm text-gray-700 mt-1">
                <strong>Description:</strong>
                {{ ev.extendedProps.description || "-" }}
              </p>
              <p
                class="text-xs mt-2 inline-block px-2 py-1 rounded"
                :class="
                  ev.extendedProps.status === 'open'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-200 text-gray-600'
                "
              >
                {{ ev.extendedProps.status }}
              </p>
            </div>
          </div>

          <p v-else class="text-sm text-gray-500">
            Tidak ada rencana kerja hari ini.
          </p>
        </div>
      </template>
    </USlideover>
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
