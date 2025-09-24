<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { registerChartJS, ChartJS } from "@/utils/chartjs";
import type { ChartConfiguration } from "chart.js";

registerChartJS();

interface Dataset {
  label: string;
  data: number[];
  backgroundColor: string | string[];
  borderRadius?: number;
  stack?: string;
}

interface Props {
  title?: string;
  labels: string[];
  datasets: Dataset[];
  height?: string;
  maxValue?: number;
  showPeriodSelector?: boolean;
  periodOptions?: Array<{ label: string; value: string }>;
  stacked?: boolean;
  showDataLabels?: boolean; // New prop to control data labels visibility
}

const props = withDefaults(defineProps<Props>(), {
  title: "Chart",
  height: "h-64",
  maxValue: undefined,
  showPeriodSelector: false,
  stacked: false,
  showDataLabels: true, // Default to true
  periodOptions: () => [
    { label: "Bulan", value: "Bulan" },
    { label: "Minggu", value: "Minggu" },
    { label: "Tahun", value: "Tahun" },
  ],
});

const emit = defineEmits<{
  periodChange: [value: string];
}>();

const chartCanvas = ref<HTMLCanvasElement>();
let chartInstance: ChartJS | null = null;
const selectedPeriod = ref(props.periodOptions[0]?.value || "");

const createChart = () => {
  if (!chartCanvas.value) return;

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy();
  }

  const config: ChartConfiguration = {
    type: "bar",
    data: {
      labels: props.labels,
      datasets: props.datasets.map((dataset) => ({
        ...dataset,
        stack: props.stacked ? dataset.stack || "default" : undefined,
      })),
    },
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
            font: { size: 12 },
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
        // Add data labels plugin configuration
        datalabels: {
          display: props.showDataLabels,
          color: "#374151", // Dark gray color
          font: {
            size: 11,
            weight: "bold",
          },
          align: "end",
          anchor: "end",
          offset: 4,
          formatter: (value: number) => {
            // Format the value (you can customize this)
            if (value === 0) return ""; // Don't show label for zero values
            return value.toLocaleString(); // Add thousand separators
          },
          // Hide labels that would overlap or be too close to chart edges
          clip: true,
        },
      },
      scales: {
        x: {
          display: true,
          grid: { display: false },
          ticks: {
            font: { size: 11 },
            color: "#6B7280",
          },
          stacked: props.stacked,
        },
        y: {
          display: true,
          beginAtZero: true,
          max: props.maxValue ?? undefined,
          grid: {
            display: true,
            color: "#E5E7EB",
          },
          ticks: {
            stepSize: 2,
            font: { size: 11 },
            color: "#6B7280",
          },
          stacked: props.stacked,
        },
      },
      elements: {
        bar: {
          borderRadius: props.stacked
            ? 0
            : {
                topLeft: 4,
                topRight: 4,
                bottomLeft: 0,
                bottomRight: 0,
              },
        },
      },
      // Reduced padding since labels are now inside bars
      layout: {
        padding: {
          top: 10,
        },
      },
    },
  };

  chartInstance = new ChartJS(chartCanvas.value, config);
};

watch(
  [
    () => props.labels,
    () => props.datasets,
    () => props.stacked,
    () => props.showDataLabels,
  ],
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
  if (chartInstance) {
    chartInstance.destroy();
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
    <div class="relative" :class="height">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>
