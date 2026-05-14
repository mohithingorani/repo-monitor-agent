"use client";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

const timeline = [
  { label: "Parse URL", time: "09:41:07", status: "done" },
  { label: "Scan repository", time: "09:41:18", status: "done" },
  { label: "Filter files", time: "09:41:22", status: "done" },
  { label: "Run analyzers", time: "09:41:33", status: "active" },
  { label: "Generate report", time: "09:41:39", status: "pending" },
];

export function AnalysisTimeline() {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Timeline</p>
        <span className="text-[10px] text-zinc-400 font-mono">ETA 28s</span>
      </div>
      <div className="space-y-2">
        {timeline.map((step, i) => {
          const active = step.status === "active";
          const done = step.status === "done";
          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-2"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {done ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : active ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}>
                    <Loader2 className="w-4 h-4 text-blue-600" />
                  </motion.div>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-zinc-300" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-xs ${done ? "text-zinc-800" : active ? "text-blue-600" : "text-zinc-500"}`}>
                  {step.label}
                </p>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">{step.time}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
