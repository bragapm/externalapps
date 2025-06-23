<script lang="ts" setup>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Bar } from "vue-chartjs";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const organic = 10;
const nonOrganic = 10;
const total = organic + nonOrganic;

const chartData = {
  labels: [""],
  datasets: [
    {
      label: "Organic",
      data: [organic],
      backgroundColor: "#3B82F6",
      borderRadius: 0,
      barThickness: 40,
    },
    {
      label: "Non-Organic",
      data: [nonOrganic],
      backgroundColor: "#EF4444",
      borderRadius: 0,
      barThickness: 40,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: "y" as const, // Horizontal bar
  scales: {
    x: {
      stacked: true,
      beginAtZero: true,
      max: 20,
      ticks: {
        stepSize: 5,
        font: {
          size: 12,
        },
      },
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
    },
    y: {
      stacked: true,
      display: false,
      grid: {
        display: false,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      mode: "index" as const,
      intersect: false,
      callbacks: {
        title: () => "Total Employee",
        label: (context: any) => {
          return `${context.dataset.label}: ${context.parsed.x}`;
        },
      },
    },
  },
  layout: {
    padding: {
      top: 10,
      bottom: 10,
    },
  },
  elements: {
    bar: {
      borderWidth: 0,
    },
  },
};
</script>

<template>
  <div class="w-full">
    <div class="h-16 mb-4">
      <Bar :data="chartData" :options="chartOptions" />
    </div>

    <!-- Legend -->
    <div class="space-y-2 text-xs">
      <div class="flex justify-between items-center">
        <span class="font-medium">Total</span>
        <span class="font-medium">{{ total }}</span>
      </div>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <div class="w-4 h-3 bg-red-500"></div>
          <span>Non-Organic</span>
        </div>
        <span>{{ nonOrganic }}</span>
      </div>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <div class="w-4 h-3 bg-blue-500"></div>
          <span>Organic</span>
        </div>
        <span>{{ organic }}</span>
      </div>
    </div>
  </div>
</template>
