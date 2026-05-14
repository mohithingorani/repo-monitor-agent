"use client";
import { motion } from "framer-motion";
import { Cpu, GitCommit, Code2 } from "lucide-react";

const events = [
  { label: "Analyzer boot", time: "09:41:12", detail: "Loaded 12 detectors", icon: Cpu },
  { label: "Repo scan", time: "09:41:23", detail: "Traversed 214 files", icon: Code2 },
  { label: "Issue group", time: "09:41:34", detail: "Auth regression found", icon: GitCommit },
];

export function LiveActivityPanel() {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Live activity</p>
        <span className="text-[10px] text-zinc-500 font-mono">streaming</span>
      </div>
      <div className="space-y-2">
        {events.map((event, i) => (
          <motion.div
            key={event.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 rounded-md border border-zinc-100 bg-zinc-50 px-2 py-2 hover:border-zinc-200 transition-colors"
          >
            <div className="w-7 h-7 rounded-md bg-zinc-900 flex items-center justify-center">
              <event.icon className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-zinc-800 font-medium">{event.label}</p>
              <p className="text-[11px] text-zinc-500">{event.detail}</p>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">{event.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
