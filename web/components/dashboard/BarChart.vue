<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
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
      backgroundColor: string;
      borderRadius?: number;
    }>;
  };
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({
    labels: [
      "Priya",
      "Angel",
      "Ilam",
      "David",
      "Nirina",
      "Alma",
      "Noah",
      "Olivia",
    ],
    datasets: [
      {
        label: "Total Cuti",
        data: [10.5, 9, 8.5, 9, 6, 10.5, 10.5, 10.5],
        backgroundColor: "#10B981",
        borderRadius: 4,
      },
    ],
  }),
});

const chartCanvas = ref<HTMLCanvasElement>();
const chartInstance = ref<ChartJS>();
const selectedPeriod = ref("Bulan");

const periodOptions = [
  { label: "Bulan", value: "Bulan" },
  { label: "Minggu", value: "Minggu" },
  { label: "Tahun", value: "Tahun" },
];

const createChart = () => {
  if (!chartCanvas.value) return;

  const config: ChartConfiguration = {
    type: "bar",
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
            pointStyle: "rect",
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
            display: false,
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
          max: 12,
          grid: {
            display: true,
            color: "#E5E7EB",
          },
          ticks: {
            stepSize: 2,
            font: {
              size: 11,
            },
            color: "#6B7280",
          },
        },
      },
      elements: {
        bar: {
          borderRadius: {
            topLeft: 4,
            topRight: 4,
            bottomLeft: 0,
            bottomRight: 0,
          },
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
      <h3 class="text-lg font-semibold text-gray-900">Total Cuti</h3>
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
