"use client";
import { motion } from "framer-motion";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { ObservationState } from "@/app/lib/types";
import { AlertOctagon, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface SeverityOverviewProps {
  observations: ObservationState[];
}

const config = {
  Critical: { label: "Critical", border: "border-red-200", text: "text-red-600", dot: "bg-red-500", icon: AlertOctagon },
  High: { label: "High", border: "border-orange-200", text: "text-orange-600", dot: "bg-orange-500", icon: AlertTriangle },
  Medium: { label: "Medium", border: "border-yellow-200", text: "text-yellow-700", dot: "bg-yellow-500", icon: AlertCircle },
  Low: { label: "Low", border: "border-green-200", text: "text-green-600", dot: "bg-green-500", icon: CheckCircle },
};

function countBySeverity(observations: ObservationState[]) {
  return {
    Critical: observations.filter((o) => o.severity === "Critical").length,
    High: observations.filter((o) => o.severity === "High").length,
    Medium: observations.filter((o) => o.severity === "Medium").length,
    Low: observations.filter((o) => o.severity === "Low").length,
  };
}

export function SeverityOverview({ observations }: SeverityOverviewProps) {
  const counts = countBySeverity(observations);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const doughnutData = {
    labels: ["Critical", "High", "Medium", "Low"],
    datasets: [{
      data: [counts.Critical, counts.High, counts.Medium, counts.Low],
      backgroundColor: ["rgba(239,68,68,0.8)", "rgba(249,115,22,0.8)", "rgba(234,179,8,0.8)", "rgba(34,197,94,0.8)"],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const barData = {
    labels: ["Critical", "High", "Medium", "Low"],
    datasets: [{
      data: [counts.Critical, counts.High, counts.Medium, counts.Low],
      backgroundColor: ["rgba(239,68,68,0.5)", "rgba(249,115,22,0.5)", "rgba(234,179,8,0.5)", "rgba(34,197,94,0.5)"],
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: "72%" };
  const barOptions = {
    responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#71717a", font: { size: 10 } }, border: { display: false } },
      y: { grid: { color: "rgba(63,63,70,0.1)" }, ticks: { color: "#71717a", font: { size: 10 }, stepSize: 1 }, border: { display: false } },
    },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {(Object.keys(config) as Array<keyof typeof config>).map((sev, i) => {
          const cfg = config[sev];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={sev}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`bg-white border ${cfg.border} rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Icon className={`w-3.5 h-3.5 ${cfg.text}`} />
                <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
              </div>
              <p className="text-2xl font-bold text-zinc-900">{counts[sev]}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-[1.2fr_1fr] gap-3">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-3">Severity Distribution</p>
          <div className="h-28 relative">
            <Doughnut data={doughnutData} options={chartOptions} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-xl font-bold text-zinc-900">{total}</p>
                <p className="text-[10px] text-zinc-500">total</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {(["Critical", "High", "Medium", "Low"] as const).map((sev) => (
              <div key={sev} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${config[sev].dot}`} />
                <span className="text-[10px] text-zinc-500">{sev}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-3">Issues by Severity</p>
          <div className="h-28">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
