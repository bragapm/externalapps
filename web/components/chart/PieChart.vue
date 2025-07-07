<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from "vue";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DataItem {
  label: string;
  value: number;
  color: string;
}

interface Props {
  title?: string;
  data: DataItem[];
  height?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Report Summary",
  height: "h-64",
});

const chartCanvas = ref<HTMLCanvasElement | null>(null);
const chartContainer = ref<HTMLDivElement | null>(null);
let chartInstance: ChartJS | null = null;

const total = computed(() =>
  props.data.reduce((sum, item) => sum + item.value, 0)
);

const createChart = async () => {
  // Wait for DOM to be ready
  await nextTick();

  if (!chartCanvas.value || !chartContainer.value) {
    console.warn("Chart canvas or container not available");
    return;
  }

  // Check if container is visible
  const containerRect = chartContainer.value.getBoundingClientRect();
  if (containerRect.width === 0 || containerRect.height === 0) {
    console.warn("Chart container has zero dimensions");
    // Retry after a short delay
    setTimeout(createChart, 100);
    return;
  }

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  // Ensure we have data
  if (!props.data || props.data.length === 0) {
    console.warn("No data available for chart");
    return;
  }

  try {
    const config: ChartConfiguration = {
      type: "pie",
      data: {
        labels: props.data.map((d) => d.label),
        datasets: [
          {
            data: props.data.map((d) => d.value),
            backgroundColor: props.data.map((d) => d.color),
            borderWidth: 2,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.formattedValue}`,
            },
          },
        },
      },
    };

    chartInstance = new ChartJS(chartCanvas.value, config);
    console.log("Chart created successfully");
  } catch (error) {
    console.error("Error creating chart:", error);
  }
};

// Watch for data changes with immediate flag
watch(() => props.data, createChart, { deep: true, immediate: false });

// Use multiple lifecycle hooks for better compatibility
onMounted(async () => {
  // Small delay to ensure DOM is fully rendered
  await nextTick();
  setTimeout(createChart, 50);
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>

<template>
  <div class="bg-grey-100 rounded-lg border border-gray-300 p-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-8">{{ title }}</h2>
    <!-- Chart Section -->
    <div class="flex gap-4">
      <div ref="chartContainer" class="relative w-52 h-52">
        <canvas ref="chartCanvas" :style="{ width: '100%', height: '100%' }" />
      </div>
      <!-- Summary Section -->
      <div class="">
        <div class="">
          <p class="text-xs text-gray-500">Summary Data</p>
          <p class="text-xl font-bold text-gray-900">{{ total }}</p>
        </div>

        <div class="grid grid-cols-2 gap-x-6 mt-2 gap-y-2">
          <div
            v-for="item in props.data"
            :key="item.label"
            class="flex items-center gap-3"
          >
            <div
              :style="{ backgroundColor: item.color }"
              class="w-1 h-6 rounded-full"
            ></div>
            <div class="flex-1">
              <div class="text-xs text-gray-600">{{ item.label }}</div>
              <div class="text-lg font-bold text-gray-900">
                {{ item.value }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Legend below chart -->
    <div class="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
      <div
        v-for="item in props.data"
        :key="item.label"
        class="flex items-center gap-2"
      >
        <div
          :style="{ backgroundColor: item.color }"
          class="w-2 h-2 rounded-sm"
        ></div>
        <span class="text-xs text-gray-700">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>
