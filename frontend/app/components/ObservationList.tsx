"use client";
import { motion } from "framer-motion";
import { ObservationState } from "@/app/lib/types";
import { Badge } from "@/app/components/ui/Badge";

const severityConfig = {
  Critical: { label: "Critical", bg: "bg-red-50 border-red-200", text: "text-red-600", dot: "bg-red-500" },
  High: { label: "High", bg: "bg-orange-50 border-orange-200", text: "text-orange-600", dot: "bg-orange-500" },
  Medium: { label: "Medium", bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700", dot: "bg-yellow-500" },
  Low: { label: "Low", bg: "bg-green-50 border-green-200", text: "text-green-600", dot: "bg-green-500" },
};

export function LiveObservationList({ observations }: { observations: ObservationState[] }) {
  if (observations.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Live Issues ({observations.length})</span>
      </div>
      <div className="space-y-1.5 max-h-60 overflow-y-auto">
        {observations.map((obs, i) => {
          const cfg = severityConfig[obs.severity] ?? severityConfig.Low;
          return (
            <motion.div
              key={`${obs.file}-${i}`}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 30 }}
              className={`flex items-start gap-2 px-3 py-2 rounded-md border ${cfg.bg}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono text-zinc-500 truncate">{obs.file}</span>
                  <Badge variant={obs.severity.toLowerCase() as any}>{cfg.label}</Badge>
                </div>
                <p className={`text-xs leading-relaxed ${cfg.text}`}>
                  {obs.issue.length > 100 ? obs.issue.slice(0, 100) + "..." : obs.issue}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function IssueCard({ obs, index }: { obs: ObservationState; index: number }) {
  const cfg = severityConfig[obs.severity] ?? severityConfig.Low;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-white border border-zinc-200 rounded-xl overflow-hidden hover:border-zinc-300 transition-colors"
    >
      <div className={`px-4 py-2.5 border-b border-zinc-100 flex items-center gap-3 ${cfg.bg}`}>
        <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        <Badge variant={obs.severity.toLowerCase() as any}>{cfg.label}</Badge>
        <span className="text-xs font-mono text-zinc-500 flex-1 truncate">{obs.file}</span>
      </div>
      <div className="p-4 overflow-hidden">
        <p className={`text-sm leading-relaxed ${cfg.text} break-words`}>{obs.issue}</p>
      </div>
    </motion.div>
  );
}
