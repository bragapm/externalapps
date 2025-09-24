// utils/chartjs.ts
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PieController,
  BarController,
} from "chart.js";

import ChartDataLabels from "chartjs-plugin-datalabels";

// Register only once and globally
let isRegistered = false;

export function registerChartJS() {
  if (isRegistered) return;

  ChartJS.register(
    ArcElement,
    BarElement,
    PieController,
    BarController,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    ChartDataLabels
  );

  isRegistered = true;
}

export { ChartJS };
