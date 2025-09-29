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

// NOTE: useAuth() is assumed to be defined elsewhere and is left for context.
// const auth = useAuth();

const { data, isLoading, error } = useQuery<BusinessTripDetail>({
  queryKey: ["business-trip-detail", props.id],
  queryFn: async (): Promise<BusinessTripDetail> => {
    // This is a placeholder for the actual fetch call.
    // Assuming a successful fetch returns the data you provided:
    // "destination": "medan", "purpose": "Seminar", "user": { "first_name": "Mobile", "last_name": "Developer" }
    const mockData = {
      id: props.id,
      user: { first_name: "Mobile", last_name: "Developer" },
      start_date: "2025-09-09",
      end_date: "2025-09-10",
      destination: "medan",
      purpose: "Seminar",
      transportation: "air",
      status: "in_progress",
      document: null,
    } as BusinessTripDetail;

    // In a real application, you would use:
    // return await $fetch<BusinessTripDetail>(`/panel/items/business_trips/${props.id}?fields=*,user.first_name,user.last_name`);

    // Using mock data for demonstration since the fetch function is commented out/simulated
    return mockData;
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
    air: "Udara", // Maps 'air' from your data to 'Udara'
    train: "Kereta Api",
    bus: "Bus",
    motorcycle: "Motor",
    car: "Mobil",
  };

  // Convert to lowercase for reliable lookup, then use the map or fallback to capitalized original
  const normalizedTransportation = transportation.toLowerCase().trim();
  return (
    transportationMap[normalizedTransportation] || capitalize(transportation)
  );
}
</script>

<template>
  <div class="rounded-lg">
    <div v-if="data && !isLoading" class="space-y-6">
      <div class="border border-gray-200 rounded-lg px-4 py-2">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">
          Detail Personil
        </h2>
        <div class="grid grid-cols-2 gap-y-2 text-xs">
          <span class="text-gray-600">Nama</span>
          <span class="text-gray-800 font-medium">{{ fullName }}</span>

          <span class="text-gray-600">NIK</span>
          <span class="text-gray-800 font-medium">1234543I80004</span>

          <span class="text-gray-600">iSafe Number</span>
          <span class="text-gray-800 font-medium">IDT01A5JWADPKZA999</span>

          <span class="text-gray-600">Role</span>
          <span class="text-gray-800 font-medium">Geologist</span>
        </div>
      </div>

      <div class="py-4 border border-gray-200 rounded-lg px-4">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">
          Detail Perjalanan Dinas
        </h2>
        <div class="grid grid-cols-2 gap-y-2 text-xs">
          <span class="text-gray-600">Tujuan</span>
          <span class="text-gray-800 font-medium">{{
            data.destination ? capitalize(data.destination) : "-"
          }}</span>

          <span class="text-gray-600">Jenis Perjalanan Dinas</span>
          <span class="text-gray-800 font-medium">{{
            data.purpose || "-"
          }}</span>

          <span class="text-gray-600">Tanggal Mulai</span>
          <span class="text-gray-800 font-medium">{{
            formatDate(data.start_date)
          }}</span>

          <span class="text-gray-600">Tanggal Selesai</span>
          <span class="text-gray-800 font-medium">{{
            formatDate(data.end_date)
          }}</span>

          <span class="text-gray-600">Total Hari</span>
          <span class="text-gray-800 font-medium">{{ totalDays }}</span>

          <span class="text-gray-600">Negara</span>
          <span class="text-gray-800 font-medium">Indonesia</span>

          <span class="text-gray-600">Kota</span>
          <span class="text-gray-800 font-medium">Ketapang</span>

          <span class="text-gray-600">Transportasi</span>
          <span class="text-gray-800 font-medium">{{
            formatTransportation(data.transportation)
          }}</span>

          <span class="text-gray-600">Approver</span>
          <span class="text-gray-800 font-medium">Jerry Anwar Halim</span>

          <span class="text-gray-600">Alasan untuk Approver</span>
          <span class="text-gray-800 font-medium">
            Perjalanan dinas Urgent
          </span>

          <span class="text-gray-600">Status</span>
          <span
            class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
            :class="badgeClass(data.status)"
          >
            {{ data.status ? capitalize(data.status) : "Pending" }}
          </span>
        </div>
      </div>

      <div class="mt-8 pt-4 flex justify-center">
        <button
          class="px-8 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium w-full"
        >
          Edit
        </button>
      </div>
    </div>

    <div v-else-if="isLoading" class="flex items-center justify-center py-8">
      <div class="text-sm text-gray-500">Memuat data...</div>
    </div>

    <div v-else class="flex items-center justify-center py-8">
      <div class="text-sm text-gray-500">Data tidak ditemukan.</div>
    </div>
  </div>
</template>
