<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";

// Define proper types
interface User {
  first_name?: string;
  last_name?: string;
}

interface BusinessTripDetail {
  id: string;
  user: User | null;
  start_date: string | null;
  end_date: string | null;
  destination: string | null;
  purpose: string | null;
  transportation: string | null;
  status: "waiting" | "approved" | "rejected" | "in_progress" | null;
  document: string | null;
  user_created?: string;
  date_created?: string;
  user_updated?: string;
  date_updated?: string;
}

const props = defineProps<{ id: string }>();

const auth = useAuth();

const { data, isLoading, error } = useQuery<BusinessTripDetail>({
  queryKey: ["business-trip-detail", props.id],
  queryFn: async (): Promise<BusinessTripDetail> => {
    return await $fetch<BusinessTripDetail>(
      `/panel/items/business_trips/${props.id}?fields=*,user.first_name,user.last_name`
    );
  },
  enabled: !!props.id, // Only run query if id is provided
});

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";

  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

// Function to calculate total days between dates
function calculateTotalDays(
  startDate?: string | null,
  endDate?: string | null
): string {
  if (!startDate || !endDate) return "1 Hari";

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both dates
    return `${diffDays} Hari`;
  } catch {
    return "1 Hari";
  }
}

const fullName = computed((): string => {
  if (!data.value?.user) return "-";

  const { first_name = "", last_name = "" } = data.value.user;
  const name = `${first_name} ${last_name}`.trim();

  return name || "-";
});

const totalDays = computed((): string => {
  if (!data.value) return "1 Hari";

  return calculateTotalDays(data.value.start_date, data.value.end_date);
});

function capitalize(str?: string | null): string {
  if (!str || str === "" || str === null || str === undefined) return "Pending";
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
}

function badgeClass(status?: string | null): string {
  if (!status || status === "" || status === null || status === undefined) {
    return "bg-gray-100 text-gray-800";
  }

  const statusMap: Record<string, string> = {
    waiting: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    in_progress: "bg-blue-100 text-blue-800",
  };

  const normalizedStatus = status.toLowerCase().trim();
  return statusMap[normalizedStatus] || "bg-gray-100 text-gray-800";
}

function formatTransportation(transportation?: string | null): string {
  if (!transportation) return "-";

  const transportationMap: Record<string, string> = {
    rent_car: "Rental Mobil",
    plane: "Pesawat",
    air: "Udara",
    train: "Kereta Api",
    bus: "Bus",
    motorcycle: "Motor",
    car: "Mobil",
  };

  return transportationMap[transportation] || transportation;
}
</script>

<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <div class="text-sm text-gray-500">Memuat data...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center py-8">
      <div class="text-sm text-red-500">
        Gagal memuat data. Silakan coba lagi.
      </div>
    </div>

    <!-- Data Display -->
    <div v-else-if="data" class="bg-gray-50 rounded-lg p-6">
      <div class="space-y-4">
        <!-- Each row as a flex container -->
        <div class="flex justify-between items-center">
          <span class="text-gray-600 text-sm">Nama Personil</span>
          <span class="text-gray-900 font-medium text-sm">{{ fullName }}</span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-gray-600 text-sm">iSafe ID</span>
          <span class="text-gray-900 font-medium text-sm">IDT01A5</span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-gray-600 text-sm">NIK</span>
          <span class="text-gray-900 font-medium text-sm">1234567890111</span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-gray-600 text-sm">Tanggal Mulai</span>
          <span class="text-gray-900 font-medium text-sm">{{
            formatDate(data.start_date)
          }}</span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-gray-600 text-sm">Tanggal Selesai</span>
          <span class="text-gray-900 font-medium text-sm">{{
            formatDate(data.end_date)
          }}</span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-gray-600 text-sm">Total Hari</span>
          <span class="text-gray-900 font-medium text-sm">{{ totalDays }}</span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-gray-600 text-sm">Tujuan</span>
          <span class="text-gray-900 font-medium text-sm">{{
            data.destination || "-"
          }}</span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-gray-600 text-sm">Jenis Perjalanan Dinas</span>
          <span class="text-gray-900 font-medium text-sm">{{
            data.purpose || "-"
          }}</span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-gray-600 text-sm">Transport</span>
          <span class="text-gray-900 font-medium text-sm">{{
            formatTransportation(data.transportation)
          }}</span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-gray-600 text-sm">Dokumen</span>
          <span class="text-gray-900 font-medium text-sm">
            <span
              v-if="data.document"
              class="text-blue-600 underline cursor-pointer"
            >
              Lihat Dokumen
            </span>
            <span v-else>-</span>
          </span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-gray-600 text-sm">Approver</span>
          <span class="text-gray-900 font-medium text-sm"
            >Jerry Anwar Halim</span
          >
        </div>

        <div class="flex justify-between items-center">
          <span class="text-gray-600 text-sm">Status Perjalanan</span>
          <span
            class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
            :class="badgeClass(data.status)"
          >
            {{ data.status ? capitalize(data.status) : "Pending" }}
          </span>
        </div>
      </div>

      <!-- Additional Actions Section (if needed) -->
      <div class="pt-6 mt-6 border-t border-gray-200">
        <div class="flex justify-end space-x-3">
          <button
            v-if="data.status === 'waiting'"
            class="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Setujui
          </button>
          <button
            v-if="data.status === 'waiting'"
            class="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tolak
          </button>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else class="flex items-center justify-center py-8">
      <div class="text-sm text-gray-500">Data tidak ditemukan.</div>
    </div>
  </div>
</template>
