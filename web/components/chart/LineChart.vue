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

interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
}

interface Props {
  title?: string;
  height?: string;
  data?: {
    labels: string[];
    datasets: Dataset[];
  };
  showPeriodSelector?: boolean;
  periodOptions?: Array<{ label: string; value: string }>;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Line Chart",
  height: "h-64",
  showPeriodSelector: true,
  periodOptions: () => [
    { label: "Default", value: "Default" },
    { label: "Weekly", value: "Weekly" },
    { label: "Monthly", value: "Monthly" },
    { label: "Yearly", value: "Yearly" },
  ],
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
    ],
  }),
});

const emit = defineEmits<{
  periodChange: [value: string];
}>();

const chartCanvas = ref<HTMLCanvasElement>();
let chartInstance: ChartJS | null = null;
const selectedPeriod = ref(props.periodOptions[0]?.value || "Default");

const createChart = () => {
  if (!chartCanvas.value) return;

  // Destroy previous chart if exists
  if (chartInstance) chartInstance.destroy();

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
            padding: 16,
            boxWidth: 6,
            boxHeight: 6,
            font: { size: 12 },
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
          grid: { display: true, color: "#E5E7EB" },
          ticks: { font: { size: 11 }, color: "#6B7280" },
        },
        y: {
          display: true,
          beginAtZero: true,
          max: 25,
          grid: { display: true, color: "#E5E7EB" },
          ticks: { stepSize: 5, font: { size: 11 }, color: "#6B7280" },
        },
      },
      elements: {
        line: {
          borderWidth: 2,
          tension: 0.1,
        },
        point: {
          radius: 1,
          hoverRadius: 3,
          borderWidth: 1,
        },
      },
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },
    },
  };

  chartInstance = new ChartJS(chartCanvas.value, config);
};

watch(
  () => props.data,
  () => {
    createChart();
  },
  { deep: true }
);

watch(selectedPeriod, (value) => {
  emit("periodChange", value);
});

onMounted(() => {
  setTimeout(createChart, 100);
});

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy();
});
</script>

<template>
  <div class="bg-grey-100 rounded-lg border border-gray-300 p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
      <USelectMenu
        v-if="showPeriodSelector"
        v-model="selectedPeriod"
        :options="periodOptions"
        variant="ghost"
        class="w-32 border-gray-300 py-2 border text-xs text-gray-900"
      />
    </div>
    <div class="relative" :class="height">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>
