<script lang="ts" setup>
definePageMeta({
  middleware: "auth",
});

import { ref, h, computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import type { TableColumn } from "@nuxt/ui";
import type { Table, Row } from "@tanstack/vue-table";

// State Management
const authStore = useAuth();
const page = ref(1);
const pageSize = ref<string>("10");
const startDate = ref();
const endDate = ref();
const search = ref("");
const currentQueryParams = ref<Record<string, string>>();

// Form state
const showAddForm = ref(false);
const showEditForm = ref(false);
const selectedStakeholder = ref<Stakeholder | null>(null);

// Types
interface Stakeholder {
  id: number;
  user_created: string;
  date_created: string;
  user_updated: string | null;
  date_updated: string | null;
  name: string;
  organization: string;
  address: string;
  phone_number: string;
  email: string;
  sentiment: "positive" | "negative";
  position: string;
  location: string;
}

interface ApiResponse {
  data: Stakeholder[];
}

// Date Handler
function handleDateUpdate(startDateInput?: string, endDateInput?: string) {
  startDate.value = startDateInput ?? null;
  endDate.value = endDateInput ?? null;
}

const UCheckbox = resolveComponent("UCheckbox");

// API Query
const { data: stakeholders, isLoading } = useQuery({
  queryKey: ["stakeholders"],
  queryFn: async (): Promise<Stakeholder[]> => {
    const res = await $fetch<ApiResponse>("/panel/items/stakeholders", {
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
    });
    return res.data;
  },
});

// Chart Data Computations
const stakeholderByLocation = computed(() => {
  if (!stakeholders.value) return { labels: [], data: [] };

  const locationCount = stakeholders.value.reduce((acc, stakeholder) => {
    acc[stakeholder.location] = (acc[stakeholder.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    labels: Object.keys(locationCount),
    data: Object.values(locationCount),
  };
});

const stakeholderByOrganization = computed(() => {
  if (!stakeholders.value) return { labels: [], data: [] };

  const orgCount = stakeholders.value.reduce((acc, stakeholder) => {
    acc[stakeholder.organization] = (acc[stakeholder.organization] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    labels: Object.keys(orgCount),
    data: Object.values(orgCount),
  };
});

const sentimentData = computed(() => {
  if (!stakeholders.value) return [];

  const sentimentCount = stakeholders.value.reduce((acc, stakeholder) => {
    const sentiment =
      stakeholder.sentiment === "positive" ? "Positif" : "Negatif";
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return [
    {
      label: "Positif",
      value: sentimentCount["Positif"] || 0,
      color: "#21D372",
    },
    {
      label: "Negatif",
      value: sentimentCount["Negatif"] || 0,
      color: "#D32E36",
    },
  ];
});

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Action handlers
function handleView(stakeholder: Stakeholder) {
  console.log("View stakeholder:", stakeholder);
  // You can implement view modal here
}

function handleEdit(stakeholder: Stakeholder) {
  selectedStakeholder.value = stakeholder;
  showEditForm.value = true;
}

function handleAddNew() {
  selectedStakeholder.value = null;
  showAddForm.value = true;
}

function handleSuccess() {
  // Form will auto-refetch data via TanStack Query
  showAddForm.value = false;
  showEditForm.value = false;
  selectedStakeholder.value = null;
}

// Table Columns
const columns: TableColumn<Record<string, any>>[] = [
  {
    id: "select",
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : table.getIsAllPageRowsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Select all",
        ui: { base: "rounded-sm ring-grey-500" },
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        "aria-label": "Select row",
        ui: { base: "rounded-sm ring-grey-500" },
      }),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "position",
    header: "Jabatan",
  },
  {
    accessorKey: "organization",
    header: "Organisasi",
  },
  {
    accessorKey: "location",
    header: "Lokasi",
  },
  {
    accessorKey: "address",
    header: "Alamat",
  },
  {
    accessorKey: "phone_number",
    header: "No Hp",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email");
      return h(
        "a",
        {
          // href: `mailto:${email}`,
          class: "text-blue-600 underline text-xs",
        },
        { default: () => email }
      );
    },
  },
  {
    accessorKey: "sentiment",
    header: "Sentimen",
    cell: ({ row }) => {
      const sentiment = row.getValue("sentiment");
      const isPositive = sentiment === "positive";
      const displayText = isPositive ? "Positif" : "Negatif";

      return h(
        "span",
        {
          class: `px-2 py-1 rounded text-xs font-medium ${
            isPositive
              ? "text-green-500 border border-green-500"
              : "text-red-500 border border-red-500"
          }`,
        },
        { default: () => displayText }
      );
    },
  },
  {
    accessorKey: "date_updated",
    header: "Last Update",
    cell: ({ row }) => {
      const dateUpdated = row.getValue("date_updated") as string | null;
      const dateCreated = row.getValue("date_created") as string | null;
      const lastUpdate = dateUpdated || dateCreated;

      return h(
        "span",
        { class: "text-xs text-gray-600" },
        { default: () => (lastUpdate ? formatDate(lastUpdate) : "") }
      );
    },
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }: { row: Row<any> }) =>
      h("div", { class: "flex gap-2 items-center" }, [
        // 🖊️ Edit icon
        h("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          class:
            "w-4 h-4 text-blue-600 cursor-pointer hover:text-blue-800 transition-colors",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          onClick: () => handleEdit(row.original),
          innerHTML: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>`,
          title: "Edit",
        }),

        // 🗑️ Delete icon
        h("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          class:
            "w-4 h-4 text-red-600 cursor-pointer hover:text-red-800 transition-colors",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",

          innerHTML: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>`,
          title: "Delete",
        }),
      ]),
  },
];
</script>

<template>
  <div class="p-6 bg-grey-100 rounded-lg space-y-3">
    <!-- Header Controls -->
    <DashboardTableHeaderControls
      v-model:search="search"
      @update-date="handleDateUpdate"
      :collection="'stakeholders'"
      :queryParams="currentQueryParams"
    >
      <template #slideover-button>
        <UButton
          icon="i-heroicons-plus"
          label="Tambah Stakeholder"
          size="xl"
          class="text-sm"
          @click="handleAddNew"
        />
      </template>
    </DashboardTableHeaderControls>

    <!-- Charts Section -->
    <section class="grid grid-cols-3 gap-3">
      <!-- Stakeholder by Location Chart -->
      <ChartBarChart
        title="Jumlah Stakeholder by Lokasi"
        :labels="stakeholderByLocation.labels"
        :datasets="[
          {
            label: 'stakeholder',
            data: stakeholderByLocation.data,
            backgroundColor: '#ED6C2B',
            borderRadius: 4,
          },
        ]"
        height="h-64"
        :showPeriodSelector="false"
        @periodChange="
        (period : any) => {
          console.log('Selected period:', period);
        }
      "
      />

      <!-- Stakeholder by Organization Chart -->
      <ChartBarChart
        title="Jumlah Stakeholder by Instansi"
        :labels="stakeholderByOrganization.labels"
        :datasets="[
          {
            label: 'stakeholder',
            data: stakeholderByOrganization.data,
            backgroundColor: '#ED6C2B',
            borderRadius: 4,
          },
        ]"
        height="h-64"
        :showPeriodSelector="false"
        @periodChange="
        (period : any) => {
          console.log('Selected period:', period);
        }
      "
      />

      <!-- Sentiment Pie Chart -->
      <ChartPieChart title="Sentimen Stakeholder" :data="sentimentData" />
    </section>

    <!-- Data Table -->
    <DashboardTable
      v-model:pageSize="pageSize"
      v-model:page="page"
      :data="stakeholders || []"
      :columns="columns"
      :totalData="stakeholders?.length || 0"
      :loading="isLoading"
    />

    <!-- Add Stakeholder Form -->
    <StakeholderFormStakeholder
      v-model="showAddForm"
      @success="handleSuccess"
    />

    <!-- Edit Stakeholder Form -->
    <StakeholderFormStakeholder
      v-model="showEditForm"
      :stakeholder="selectedStakeholder"
      @success="handleSuccess"
    />
  </div>
</template>
