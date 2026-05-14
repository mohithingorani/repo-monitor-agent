"use client";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

const STEPS = [
  { key: "parse_repo", label: "Parsing URL", sub: "Extracting owner and repo" },
  { key: "get-all-files", label: "Scanning repository", sub: "Fetching file tree" },
  { key: "important_files", label: "Filtering files", sub: "Selecting key files" },
  { key: "get_metadata", label: "Analyzing metadata", sub: "Inferring tech stack" },
  { key: "analyze", label: "Running analysis", sub: "Detecting issues" },
  { key: "summarizer", label: "Generating report", sub: "Compiling findings" },
];

interface AnalysisProgressProps {
  status: Record<string, boolean>;
  currentStep: string | null;
}

export function AnalysisProgress({ status }: AnalysisProgressProps) {
  return (
    <div className="space-y-0.5">
      {STEPS.map((step, i) => {
        const done = status[step.key];
        const active = !done && (i === 0 ? status[step.key] : status[STEPS[i - 1].key] !== undefined && !status[STEPS[i - 1].key]);
        const pending = !done && !active;

        return (
          <motion.div
            key={step.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
              done ? "bg-green-50" : active ? "bg-blue-50" : "bg-transparent"
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              {done ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </motion.div>
              ) : active ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                  <Loader2 className="w-4 h-4 text-blue-600" />
                </motion.div>
              ) : (
                <Circle className="w-4 h-4 text-zinc-300" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium ${done ? "text-green-600" : active ? "text-blue-600" : "text-zinc-400"}`}>
                {step.label}
              </p>
              <p className="text-[10px] text-zinc-400">{step.sub}</p>
            </div>

            {done && <span className="text-[10px] text-green-500/60">Done</span>}
            {active && (
              <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-[10px] text-blue-600">
                Working...
              </motion.span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
