<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  data?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }>;
  };
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sept",
      "Okt",
      "Nov",
      "Des",
    ],
    datasets: [
      {
        label: "Priya",
        data: [18, 5, 12, 19, 5, 5, 4, 18, 12, 12, 20, 19],
        borderColor: "#3B82F6",
        backgroundColor: "#3B82F6",
      },
      {
        label: "Angel",
        data: [4, 1, 5, 2, 1, 1, 5, 2, 2, 5, 6, 4],
        borderColor: "#EF4444",
        backgroundColor: "#EF4444",
      },
      {
        label: "Ilam",
        data: [15, 15, 8, 15, 15, 15, 15, 8, 10, 10, 5, 6],
        borderColor: "#10B981",
        backgroundColor: "#10B981",
      },
      {
        label: "David",
        data: [12, 8, 12, 15, 10, 10, 3, 15, 14, 6, 11, 10],
        borderColor: "#F59E0B",
        backgroundColor: "#F59E0B",
      },
      {
        label: "Nirina",
        data: [6, 12, 18, 12, 15, 18, 20, 16, 15, 18, 20, 18],
        borderColor: "#EC4899",
        backgroundColor: "#EC4899",
      },
      {
        label: "Noah",
        data: [5, 10, 15, 18, 12, 15, 18, 20, 16, 15, 18, 20],
        borderColor: "#8B5CF6",
        backgroundColor: "#8B5CF6",
      },
      {
        label: "Olivia",
        data: [8, 12, 16, 14, 18, 16, 19, 17, 18, 19, 20, 18],
        borderColor: "#06B6D4",
        backgroundColor: "#06B6D4",
      },
    ],
  }),
});

const chartCanvas = ref<HTMLCanvasElement>();
const chartInstance = ref<ChartJS>();
const selectedPeriod = ref("Default");

const periodOptions = [
  { label: "Default", value: "Default" },
  { label: "Weekly", value: "Weekly" },
  { label: "Monthly", value: "Monthly" },
  { label: "Yearly", value: "Yearly" },
];

const createChart = () => {
  if (!chartCanvas.value) return;

  const config: ChartConfiguration = {
    type: "line",
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            padding: 20,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: true,
            color: "#E5E7EB",
          },
          ticks: {
            font: {
              size: 11,
            },
            color: "#6B7280",
          },
        },
        y: {
          display: true,
          beginAtZero: true,
          max: 25,
          grid: {
            display: true,
            color: "#E5E7EB",
          },
          ticks: {
            stepSize: 5,
            font: {
              size: 11,
            },
            color: "#6B7280",
          },
        },
      },
      elements: {
        line: {
          borderWidth: 2,
          tension: 0.1,
        },
        point: {
          radius: 4,
          hoverRadius: 6,
          borderWidth: 2,
        },
      },
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },
    },
  };

  chartInstance.value = new ChartJS(chartCanvas.value, config);
};

const destroyChart = () => {
  if (chartInstance.value) {
    chartInstance.value.destroy();
    chartInstance.value = undefined;
  }
};

watch(
  () => props.data,
  () => {
    if (chartInstance.value) {
      chartInstance.value.data = props.data;
      chartInstance.value.update();
    }
  },
  { deep: true }
);

watch(selectedPeriod, () => {
  // Handle period change logic here
  console.log("Period changed to:", selectedPeriod.value);
});

onMounted(() => {
  createChart();
});

onUnmounted(() => {
  destroyChart();
});
</script>

<template>
  <div class="bg-gray-100 rounded-lg border border-gray-300 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900">Tren Cuti</h3>
      <USelectMenu
        v-model="selectedPeriod"
        :options="periodOptions"
        class="w-32"
      />
    </div>

    <!-- Chart Container -->
    <div class="relative h-80">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>
