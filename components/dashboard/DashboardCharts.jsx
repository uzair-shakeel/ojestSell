"use client";

import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardCharts({
  recentCars = [],
  chatsCountByDay = [],
}) {
  const carLabels = useMemo(() => {
    const items = recentCars.slice(-7);
    return items.map((c) =>
      new Date(c.createdAt || c.updatedAt).toLocaleDateString()
    );
  }, [recentCars]);

  const carCounts = useMemo(() => {
    const items = recentCars.slice(-7);
    return items.map(() => 1);
  }, [recentCars]);

  const lineData = useMemo(() => {
    return {
      labels: carLabels,
      datasets: [
        {
          label: "Cars posted",
          data: carCounts,
          borderColor: "#2563eb",
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, "rgba(37, 99, 235, 0.35)");
            gradient.addColorStop(1, "rgba(37, 99, 235, 0.02)");
            return gradient;
          },
          pointBackgroundColor: "#2563eb",
          pointBorderColor: "#fff",
          pointRadius: 3,
          fill: true,
          tension: 0.35,
        },
      ],
    };
  }, [carLabels, carCounts]);

  const barLabels = useMemo(
    () => chatsCountByDay.map((d) => d.label),
    [chatsCountByDay]
  );
  const barCounts = useMemo(
    () => chatsCountByDay.map((d) => d.count),
    [chatsCountByDay]
  );

  const barData = useMemo(
    () => ({
      labels: barLabels,
      datasets: [
        {
          label: "New chats",
          data: barCounts,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, "rgba(16, 185, 129, 0.8)");
            gradient.addColorStop(1, "rgba(16, 185, 129, 0.2)");
            return gradient;
          },
          borderColor: "#10b981",
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 26,
        },
      ],
    }),
    [barLabels, barCounts]
  );

  const statusCounts = useMemo(() => {
    const counts = { Approved: 0, Pending: 0, Rejected: 0 };
    (recentCars || []).forEach((c) => {
      const s = (c?.status || "Pending").toLowerCase();
      if (s === "approved") counts.Approved += 1;
      else if (s === "rejected") counts.Rejected += 1;
      else counts.Pending += 1;
    });
    return counts;
  }, [recentCars]);

  const doughnutData = useMemo(() => {
    const labels = Object.keys(statusCounts);
    const values = labels.map((k) => statusCounts[k]);
    return {
      labels,
      datasets: [
        {
          label: "Status",
          data: values,
          backgroundColor: [
            "rgba(16, 185, 129, 0.9)",
            "rgba(245, 158, 11, 0.9)",
            "rgba(244, 63, 94, 0.9)",
          ],
          borderColor: ["#10b981", "#f59e0b", "#f43f5e"],
          borderWidth: 1,
        },
      ],
    };
  }, [statusCounts]);

  const axisOptions = {
    x: {
      grid: { color: "rgba(0,0,0,0.05)" },
      ticks: { color: "#64748b", maxRotation: 0, autoSkip: true },
      border: { display: false },
    },
    y: {
      grid: { color: "rgba(0,0,0,0.05)" },
      ticks: { color: "#64748b", precision: 0 },
      border: { display: false },
    },
  };

  const commonOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    interaction: { mode: "nearest", intersect: false },
    maintainAspectRatio: false,
    scales: axisOptions,
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="p-4 bg-white dark:bg-black shadow rounded-xl ring-1 ring-black/5 dark:ring-gray-700 border border-gray-200 dark:border-gray-700 h-80 lg:col-span-2 transition-colors duration-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">Cars activity</h3>
        </div>
        <Line data={lineData} options={commonOptions} />
      </div>
      <div className="p-4 bg-white dark:bg-black shadow rounded-xl ring-1 ring-black/5 dark:ring-gray-700 border border-gray-200 dark:border-gray-700 h-80 transition-colors duration-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">Status mix</h3>
        </div>
        <Doughnut
          data={doughnutData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "bottom" } },
            cutout: "65%",
          }}
        />
      </div>
      <div className="p-4 bg-white dark:bg-black shadow rounded-xl ring-1 ring-black/5 dark:ring-gray-700 border border-gray-200 dark:border-gray-700 h-80 lg:col-span-3 transition-colors duration-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">Chats last 7 days</h3>
        </div>
        <Bar data={barData} options={commonOptions} />
      </div>
    </div>
  );
}
