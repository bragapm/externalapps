<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
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

const chartCanvas = ref<HTMLCanvasElement | null>(null);
const chartContainer = ref<HTMLDivElement | null>(null);
let chartInstance: ChartJS | null = null;
let resizeObserver: ResizeObserver | null = null;
const selectedPeriod = ref(props.periodOptions[0]?.value || "Default");

const createChart = async () => {
  console.log("Creating chart...");

  // Multiple DOM readiness checks
  await nextTick();

  if (!chartCanvas.value || !chartContainer.value) {
    console.warn("Chart canvas or container not available, retrying...");
    setTimeout(createChart, 200);
    return;
  }

  // Check if container is visible and has dimensions
  const containerRect = chartContainer.value.getBoundingClientRect();
  console.log("Container dimensions:", containerRect);

  if (containerRect.width === 0 || containerRect.height === 0) {
    console.warn("Chart container has zero dimensions, retrying...");
    setTimeout(createChart, 200);
    return;
  }

  // Destroy previous chart if exists
  if (chartInstance) {
    console.log("Destroying previous chart instance");
    chartInstance.destroy();
    chartInstance = null;
  }

  // Ensure we have data
  if (!props.data || !props.data.labels || props.data.labels.length === 0) {
    console.warn("No data available for chart");
    return;
  }

  console.log("Chart data:", props.data);

  try {
    // Force canvas dimensions
    const canvas = chartCanvas.value;
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;

    const config: ChartConfiguration = {
      type: "line",
      data: {
        labels: props.data.labels,
        datasets: props.data.datasets.map((dataset) => ({
          ...dataset,
          tension: 0.1,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: window.devicePixelRatio || 1,
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

    chartInstance = new ChartJS(canvas, config);
    console.log("Line chart created successfully:", chartInstance);
  } catch (error) {
    console.error("Error creating line chart:", error);
    console.error("Chart.js available:", !!ChartJS);
    console.error(
      "Canvas context available:",
      !!chartCanvas.value?.getContext("2d")
    );
  }
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

onMounted(async () => {
  console.log("Component mounted");
  await nextTick();

  // Set up ResizeObserver to handle dynamic container sizing
  if (chartContainer.value && typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          console.log("Container resized, creating chart");
          createChart();
        }
      }
    });
    resizeObserver.observe(chartContainer.value);
  }

  // Multiple attempts with increasing delays
  const attempts = [100, 300, 500, 1000];

  for (const delay of attempts) {
    setTimeout(() => {
      if (!chartInstance) {
        console.log(`Attempting to create chart (delay: ${delay}ms)`);
        createChart();
      }
    }, delay);
  }
});

onUnmounted(() => {
  console.log("Component unmounting");
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
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
    <div ref="chartContainer" class="relative" :class="height">
      <canvas
        ref="chartCanvas"
        :style="{ width: '100%', height: '100%' }"
      ></canvas>
    </div>
  </div>
</template>
