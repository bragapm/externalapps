<script setup lang="ts">
definePageMeta({ middleware: "auth" });

import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  ref,
  reactive,
  onMounted,
  onUnmounted,
  nextTick,
  watch,
  computed,
} from "vue";

interface WorkPlan {
  id: number;
  title: string;
  description: string;
  status: string;
  date: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface LeaveRequest {
  id: number;
  user_created: string;
  date_created: string;
  user_updated: string | null;
  date_updated: string | null;
  start_date: string;
  end_date: string;
  status: string;
  reason: string;
  leave_type: string;
  document: string | null;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

interface WorkPlansResponse {
  data: WorkPlan[];
}

interface LeaveRequestsResponse {
  data: LeaveRequest[];
}

interface WorkPlanSingleResponse {
  data: WorkPlan;
}

interface DirectusUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface FormItem {
  title: string;
  description: string;
  status: string;
  date: string;
  user: any;
}

const authStore = useAuth();
const toast = useToast();

// Tab management
const activeTab = ref("rencana-kerja");

// Calendar instances for each tab
let workPlanCalendar: Calendar | null = null;
let leaveCalendar: Calendar | null = null;

const workPlanCalendarEl = ref<HTMLElement | null>(null);
const leaveCalendarEl = ref<HTMLElement | null>(null);

const selectedView = ref("Bulanan");
const currentMonthYear = ref("January 2025");

// Work Plans related
const isSlideoverOpen = ref(false);
const slideoverTitle = ref("Tambah Rencana Kerja");
const isDayReviewOpen = ref(false);
const selectedDate = ref<string | null>(null);
const eventsForSelectedDate = ref<any[]>([]);

const forms = ref<FormItem[]>([
  {
    title: "",
    description: "",
    status: "open",
    date: "",
    user: null,
  },
]);

const editingId = ref<number | null>(null);
const workPlanEvents = ref<any[]>([]);
const leaveEvents = ref<any[]>([]);
const users = ref<DirectusUser[]>([]);

// Leave requests related
const isLeaveDayReviewOpen = ref(false);
const leaveEventsForSelectedDate = ref<any[]>([]);

// Computed property to get user options for dropdown
const userOptions = computed(() => {
  return users.value.map((u) => ({
    label: `${u.first_name} ${u.last_name || ""}`.trim() || u.email,
    value: u.id,
  }));
});

// Helper function to get user display name
function getUserDisplayName(userId: string): string {
  const user = users.value.find((u) => u.id === userId);
  if (!user) return "-";
  return `${user.first_name} ${user.last_name || ""}`.trim() || user.email;
}

// Add new form
function addNewForm() {
  forms.value.push({
    title: "",
    description: "",
    status: "open",
    date: "",
    user: null,
  });
}

// Remove form by index
function removeForm(index: number) {
  if (forms.value.length > 1) {
    forms.value.splice(index, 1);
  }
}

async function fetchUsers() {
  try {
    const res = await $fetch<{ data: DirectusUser[] }>("/panel/users", {});
    users.value = res.data;
  } catch (err) {
    console.error("Failed to fetch users", err);
  }
}

async function fetchWorkPlans() {
  try {
    const res = await $fetch<WorkPlansResponse>(
      "/panel/items/work_plans?fields=*,user.*",
      {}
    );

    workPlanEvents.value = res.data.map((item) => ({
      id: item.id,
      title: item.title,
      start: item.date,
      extendedProps: {
        description: item.description,
        status: item.status,
        user: item.user,
      },
      backgroundColor: item.status === "open" ? "#3B82F6" : "#6B7280",
      borderColor: item.status === "open" ? "#3B82F6" : "#6B7280",
      textColor: "#fff",
    }));

    if (workPlanCalendar) {
      workPlanCalendar.removeAllEvents();
      workPlanCalendar.addEventSource(workPlanEvents.value);
    }
  } catch (err) {
    console.error("Failed to fetch work plans", err);
  }
}

async function fetchLeaveRequests() {
  try {
    const res = await $fetch<LeaveRequestsResponse>(
      "/panel/items/leave_requests?fields=*,user.*",
      {}
    );

    leaveEvents.value = res.data.map((item) => {
      // Calculate duration for multi-day leaves
      const startDate = new Date(item.start_date);
      const endDate = new Date(item.end_date);
      const duration =
        Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;

      return {
        id: item.id,
        title: `${item.leave_type} - ${
          item.user ? getUserDisplayName(item.user.id) : "Unknown"
        }`,
        start: item.start_date,
        end:
          item.end_date !== item.start_date
            ? new Date(new Date(item.end_date).getTime() + 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
            : undefined,
        extendedProps: {
          reason: item.reason,
          status: item.status,
          leave_type: item.leave_type,
          user: item.user,
          duration: duration,
          start_date: item.start_date,
          end_date: item.end_date,
        },
        backgroundColor: getLeaveStatusColor(item.status),
        borderColor: getLeaveStatusColor(item.status),
        textColor: "#fff",
      };
    });

    if (leaveCalendar) {
      leaveCalendar.removeAllEvents();
      leaveCalendar.addEventSource(leaveEvents.value);
    }
  } catch (err) {
    console.error("Failed to fetch leave requests", err);
  }
}

function getLeaveStatusColor(status: string): string {
  switch (status) {
    case "approved":
      return "#10B981"; // green
    case "rejected":
      return "#EF4444"; // red
    case "waiting":
      return "#F59E0B"; // yellow
    default:
      return "#6B7280"; // gray
  }
}

async function submitForm() {
  try {
    // Validate forms
    const validForms = forms.value.filter(
      (form) => form.title.trim() && form.date
    );

    if (validForms.length === 0) {
      toast.add({
        title: "Minimal satu form harus diisi dengan lengkap!",
      });
      return;
    }

    if (editingId.value) {
      // Edit mode - only update single item
      const payload = {
        title: forms.value[0].title,
        description: forms.value[0].description,
        status: forms.value[0].status,
        date: forms.value[0].date,
        user: forms.value[0].user?.value || null,
      };

      const res = await $fetch<WorkPlanSingleResponse>(
        `/panel/items/work_plans/${editingId.value}?fields=*,user.*`,
        {
          method: "PATCH",

          body: payload,
        }
      );

      const ev = workPlanCalendar?.getEventById(editingId.value.toString());
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
        ev.setExtendedProp("user", res.data.user);
      }

      toast.add({
        title: "Berhasil update rencana kerja!",
      });
    } else {
      // Create mode - submit multiple items
      const promises = validForms.map((form) => {
        const payload = {
          title: form.title,
          description: form.description,
          status: form.status,
          date: form.date,
          user: form.user?.value || null,
        };

        return $fetch<WorkPlanSingleResponse>(
          "/panel/items/work_plans?fields=*,user.*",
          {
            method: "POST",
            body: payload,
          }
        );
      });

      const results = await Promise.all(promises);

      // Add all new events to calendar
      results.forEach((res) => {
        workPlanCalendar?.addEvent({
          id: res.data.id,
          title: res.data.title,
          start: res.data.date,
          backgroundColor: res.data.status === "open" ? "#3B82F6" : "#6B7280",
          borderColor: res.data.status === "open" ? "#3B82F6" : "#6B7280",
          textColor: "#fff",
          extendedProps: {
            description: res.data.description,
            status: res.data.status,
            user: res.data.user,
          },
        });
      });

      toast.add({
        title: `Berhasil simpan ${results.length} rencana kerja!`,
      });
    }

    resetForm();

    // Refresh day review events if applicable
    if (isDayReviewOpen.value && selectedDate.value) {
      eventsForSelectedDate.value =
        workPlanCalendar
          ?.getEvents()
          .filter((ev) => ev.startStr === selectedDate.value) || [];
    }
  } catch (err) {
    console.error("Failed to submit form", err);
    toast.add({
      title: "Gagal simpan!",
    });
  }
}

async function deleteWorkPlan() {
  if (!editingId.value) return;

  try {
    await $fetch(`/panel/items/work_plans/${editingId.value}`, {
      method: "DELETE",
    });

    workPlanCalendar?.getEventById(editingId.value.toString())?.remove();

    toast.add({
      title: "Berhasil hapus rencana kerja!",
    });

    resetForm();
  } catch (err) {
    console.error("Failed to delete work plan", err);
    toast.add({
      title: "Gagal hapus!",
    });
  }
}

function resetForm() {
  forms.value = [
    {
      title: "",
      description: "",
      status: "open",
      date: "",
      user: null,
    },
  ];
  editingId.value = null;
  slideoverTitle.value = "Tambah Rencana Kerja";
  isSlideoverOpen.value = false;
}

function initializeCalendar(
  calendarEl: HTMLElement,
  events: any[],
  isWorkPlan: boolean = true
) {
  const calendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: "dayGridMonth",
    headerToolbar: false,
    locale: "id",
    firstDay: 1,
    height: "auto",
    events: events,
    dayHeaderFormat: { weekday: "long" },
    dayHeaderClassNames: "text-sm font-medium text-gray-700 py-3",
    dayCellClassNames: "border-gray-200 min-h-[120px]",
    eventClassNames: "text-xs rounded px-2 py-1 mb-1 cursor-pointer",
    dayMaxEvents: false,
    moreLinkClick: "popover",
    eventClick(info) {
      if (isWorkPlan) {
        const ev = info.event;
        editingId.value = Number(ev.id);
        slideoverTitle.value = "Edit Rencana Kerja";

        // Reset to single form for editing
        forms.value = [
          {
            title: ev.title,
            description: ev.extendedProps.description,
            status: ev.extendedProps.status,
            date: ev.startStr,
            user:
              userOptions.value.find(
                (option) => option.value === ev.extendedProps.user?.id
              ) || null,
          },
        ];
        isSlideoverOpen.value = true;
      }
    },
    dateClick(info) {
      const dateStr = info.dateStr;
      selectedDate.value = dateStr;

      if (isWorkPlan) {
        eventsForSelectedDate.value =
          workPlanCalendar
            ?.getEvents()
            .filter((ev) => ev.startStr === dateStr) || [];
        isDayReviewOpen.value = true;
      } else {
        leaveEventsForSelectedDate.value =
          leaveCalendar?.getEvents().filter((ev) => {
            const eventStart = new Date(ev.startStr);
            const eventEnd = ev.endStr ? new Date(ev.endStr) : eventStart;
            const clickedDate = new Date(dateStr);

            // Check if clicked date is within the leave period
            return clickedDate >= eventStart && clickedDate <= eventEnd;
          }) || [];
        isLeaveDayReviewOpen.value = true;
      }
    },
    datesSet(info) {
      updateMonthYear(calendar.getDate());
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

  return calendar;
}

// ===== Calendar setup =====
onMounted(async () => {
  await nextTick();
  await fetchUsers();

  if (workPlanCalendarEl.value) {
    workPlanCalendar = initializeCalendar(
      workPlanCalendarEl.value,
      workPlanEvents.value,
      true
    );
    workPlanCalendar.render();
    await fetchWorkPlans();
  }

  if (leaveCalendarEl.value) {
    leaveCalendar = initializeCalendar(
      leaveCalendarEl.value,
      leaveEvents.value,
      false
    );
    leaveCalendar.render();
    await fetchLeaveRequests();
  }
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
  if (activeTab.value === "rencana-kerja") {
    workPlanCalendar?.prev();
  } else {
    leaveCalendar?.prev();
  }
}

function nextMonth() {
  if (activeTab.value === "rencana-kerja") {
    workPlanCalendar?.next();
  } else {
    leaveCalendar?.next();
  }
}

onUnmounted(() => {
  workPlanCalendar?.destroy();
  leaveCalendar?.destroy();
  workPlanCalendar = null;
  leaveCalendar = null;
});

watch(selectedView, (newView) => {
  const calendar =
    activeTab.value === "rencana-kerja" ? workPlanCalendar : leaveCalendar;
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

// Watch for tab changes to update current date display
watch(activeTab, async (newTab) => {
  await nextTick();
  const calendar =
    newTab === "rencana-kerja" ? workPlanCalendar : leaveCalendar;
  if (calendar) {
    updateMonthYear(calendar.getDate());
  }
});
</script>

<template>
  <div class="min-h-screen bg-grey-100 rounded-lg">
    <!-- Tabs -->
    <div class="px-6 pt-6 pb-4">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'rencana-kerja'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'rencana-kerja'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
          >
            Rencana Kerja
          </button>
          <button
            @click="activeTab = 'cuti'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'cuti'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
          >
            Rencana Cuti
          </button>
        </nav>
      </div>
    </div>

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
          v-if="activeTab === 'rencana-kerja'"
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

    <!-- Calendar Content -->
    <div class="mt-6">
      <!-- Work Plan Calendar -->
      <div v-show="activeTab === 'rencana-kerja'">
        <div ref="workPlanCalendarEl" class="p-6"></div>
      </div>

      <!-- Leave Calendar -->
      <div v-show="activeTab === 'cuti'">
        <div ref="leaveCalendarEl" class="p-6"></div>
      </div>
    </div>

    <!-- Slideover: Add/Edit Work Plan -->
    <USlideover
      v-model:open="isSlideoverOpen"
      :title="slideoverTitle"
      :ui="{ content: 'w-full max-w-[50vw] m-9 rounded-lg' }"
    >
      <template #body>
        <form class="flex flex-col h-full" @submit.prevent="submitForm">
          <div class="flex-1 overflow-y-auto space-y-6 pr-2">
            <!-- Multiple Forms Section -->
            <div
              v-for="(form, index) in forms"
              :key="index"
              class="border rounded-lg p-4 space-y-4"
              :class="
                forms.length > 1
                  ? 'border-gray-300 bg-gray-50'
                  : 'border-transparent'
              "
            >
              <!-- Form Header with Remove Button -->
              <div
                v-if="forms.length > 1"
                class="flex items-center justify-between pb-2 border-b border-gray-200"
              >
                <h3 class="text-sm font-medium text-gray-700">
                  Rencana Kerja #{{ index + 1 }}
                </h3>
                <UButton
                  icon="i-heroicons-trash"
                  variant="ghost"
                  size="sm"
                  @click="removeForm(index)"
                  :disabled="forms.length === 1"
                />
              </div>

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
                  rows="3"
                />
              </UFormField>

              <UFormField label="PIC">
                <USelectMenu
                  v-model="form.user"
                  :items="userOptions"
                  size="lg"
                  placeholder="Pilih PIC"
                  class="w-full"
                  searchable
                  by="value"
                />
              </UFormField>

              <UFormField label="Status" required>
                <USelect
                  v-model="form.status"
                  :items="[
                    { label: 'Open', value: 'open' },
                    { label: 'Closed', value: 'closed' },
                  ]"
                  size="lg"
                  class="w-full"
                />
              </UFormField>
            </div>

            <!-- Add New Form Button (only show in create mode) -->
            <div v-if="!editingId" class="flex justify-center pt-4">
              <UButton
                icon="i-heroicons-plus"
                label="Tambah Form Lain"
                variant="outline"
                color="primary"
                @click="addNewForm"
                type="button"
              />
            </div>
          </div>

          <!-- Action Buttons -->
          <div
            class="sticky bottom-0 left-0 right-0 pt-4 mt-4 space-y-4 bg-white border-t border-gray-200 px-6"
          >
            <UButton
              type="submit"
              color="primary"
              size="xl"
              class="w-full flex justify-center"
            >
              {{
                editingId ? "Update" : `Simpan ${forms.length} Rencana Kerja`
              }}
            </UButton>
            <UButton
              v-if="editingId"
              type="button"
              variant="outline"
              size="xl"
              class="w-full flex justify-center"
              @click="deleteWorkPlan"
            >
              Hapus
            </UButton>
          </div>
        </form>
      </template>
    </USlideover>

    <!-- Slideover: Review Work Plan Day -->
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
              class="p-4 rounded-lg border-l-2 border-green-300"
            >
              <h3 class="text-md font-medium text-gray-900">
                {{ ev.title }}
              </h3>
              <p class="text-xs text-gray-900 mt-2">
                PIC:
                {{
                  ev.extendedProps.user
                    ? getUserDisplayName(ev.extendedProps.user.id)
                    : "-"
                }}
              </p>
              <p class="text-xs text-gray-900 mt-1">
                Description: {{ ev.extendedProps.description || "-" }}
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

    <!-- Slideover: Review Leave Day -->
    <USlideover
      v-model:open="isLeaveDayReviewOpen"
      title="Review Cuti Hari ini"
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
          <div v-if="leaveEventsForSelectedDate.length > 0" class="space-y-4">
            <div
              v-for="ev in leaveEventsForSelectedDate"
              :key="ev.id"
              class="p-4 rounded-lg border-l-2"
              :class="[
                ev.extendedProps.status === 'approved'
                  ? 'border-green-300 bg-green-50'
                  : ev.extendedProps.status === 'rejected'
                  ? 'border-red-300 bg-red-50'
                  : 'border-yellow-300 bg-yellow-50',
              ]"
            >
              <h3 class="text-md font-medium text-gray-900">
                {{ ev.extendedProps.leave_type }}
              </h3>
              <p class="text-xs text-gray-900 mt-2">
                Karyawan:
                {{
                  ev.extendedProps.user
                    ? getUserDisplayName(ev.extendedProps.user.id)
                    : "-"
                }}
              </p>
              <p class="text-xs text-gray-900 mt-1">
                Alasan: {{ ev.extendedProps.reason || "-" }}
              </p>
              <p class="text-xs text-gray-900 mt-1">
                Durasi:
                {{
                  ev.extendedProps.start_date === ev.extendedProps.end_date
                    ? "1 hari"
                    : `${ev.extendedProps.duration} hari (${new Date(
                        ev.extendedProps.start_date
                      ).toLocaleDateString("id-ID")} - ${new Date(
                        ev.extendedProps.end_date
                      ).toLocaleDateString("id-ID")})`
                }}
              </p>
              <p
                class="text-xs mt-2 inline-block px-2 py-1 rounded font-medium"
                :class="[
                  ev.extendedProps.status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : ev.extendedProps.status === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700',
                ]"
              >
                {{
                  ev.extendedProps.status === "approved"
                    ? "Disetujui"
                    : ev.extendedProps.status === "rejected"
                    ? "Ditolak"
                    : "Menunggu"
                }}
              </p>
            </div>
          </div>
          <p v-else class="text-sm text-gray-500">Tidak ada cuti hari ini.</p>
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
