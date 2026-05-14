"use client";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ObservationState, RepoMetaData } from "@/app/lib/types";

interface ActivityEntry {
  id: string;
  text: string;
  type: "info" | "success" | "warning" | "error";
}

interface UnifiedAnalysisPanelProps {
  repoName: string;
  appState: "idle" | "analyzing" | "done" | "error";
  streamStatus: Record<string, boolean>;
  observations: ObservationState[];
  activityLog: ActivityEntry[];
  metadata: RepoMetaData | null;
  filesFound: number;
  filesAnalyzed: number;
  skippedFiles: string[];
  error?: string;
}

const STEPS = ["parse_repo", "get-all-files", "important_files", "get_metadata", "analyze", "summarizer"];
const STEP_LABELS: Record<string, string> = {
  parse_repo: "Parsing URL",
  "get-all-files": "Scanning repository",
  important_files: "Selecting important files",
  get_metadata: "Inferring metadata",
  analyze: "Analyzing files",
  summarizer: "Generating report",
};

function statusLabel(state: UnifiedAnalysisPanelProps["appState"]) {
  if (state === "error") return "Error";
  if (state === "done") return "Complete";
  if (state === "analyzing") return "Running";
  return "Idle";
}

function statusTone(state: UnifiedAnalysisPanelProps["appState"]) {
  if (state === "error") return "bg-red-50 text-red-700 border-red-200";
  if (state === "done") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (state === "analyzing") return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-zinc-50 text-zinc-600 border-zinc-200";
}

function countBySeverity(observations: ObservationState[]) {
  return {
    Critical: observations.filter((o) => o.severity === "Critical").length,
    High: observations.filter((o) => o.severity === "High").length,
    Medium: observations.filter((o) => o.severity === "Medium").length,
    Low: observations.filter((o) => o.severity === "Low").length,
  };
}

function riskLabel(counts: ReturnType<typeof countBySeverity>) {
  if (counts.Critical > 0 || counts.High > 4) return "Elevated risk";
  if (counts.High > 0 || counts.Medium > 4) return "Moderate risk";
  if (counts.Medium > 0 || counts.Low > 6) return "Low risk";
  return "No findings";
}

export function UnifiedAnalysisPanel({
  repoName,
  appState,
  streamStatus,
  observations,
  activityLog,
  metadata,
  filesFound,
  filesAnalyzed,
  skippedFiles,
  error,
}: UnifiedAnalysisPanelProps) {
  const counts = useMemo(() => countBySeverity(observations), [observations]);
  const completed = STEPS.filter((step) => streamStatus[step]).length;
  const progress = STEPS.length > 0 ? Math.round((completed / STEPS.length) * 100) : 0;
  const logs = activityLog.slice(-3);
  const displayRepo = repoName || "owner/repo";
  const activeStep = STEPS.find((step) => !streamStatus[step]);
  const stageLabel = appState === "done" ? "Complete" : activeStep ? STEP_LABELS[activeStep] : "Idle";

  return (
    <section className="bg-white border border-zinc-200 rounded-2xl shadow-sm">
      <div className="p-3 md:px-6 md:py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-400">Repository</p>
            <h2 className="text-lg font-semibold text-zinc-950 mt-1 font-mono">{displayRepo}</h2>
            <p className="text-xs text-zinc-500 mt-2">{stageLabel}</p>
          </div>
          <div className={`inline-flex items-center gap-2 text-[11px] px-2.5 py-1 rounded-full border ${statusTone(appState)}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="font-medium">{statusLabel(appState)}</span>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>Scan progress</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full bg-blue-600"
            />
          </div>
        </div>

        {(filesFound > 0 || filesAnalyzed > 0) && (
          <div className="mt-4 text-xs text-zinc-500">
            <span>{filesFound} files scanned</span>
            <span className="mx-2">·</span>
            <span>{filesAnalyzed} analyzed</span>
            {skippedFiles.length > 0 && (
              <>
                <span className="mx-2">·</span>
                <span>{skippedFiles.length} skipped</span>
              </>
            )}
          </div>
        )}

        {metadata && (
          <div className="mt-3 text-xs text-zinc-500">
            <span>{metadata.tech_stack.join(", ")}</span>
            <span className="mx-2">·</span>
            <span>{metadata.project_maturity}</span>
            {metadata.license && (
              <>
                <span className="mx-2">·</span>
                <span>{metadata.license}</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-zinc-100" />

      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-wider text-zinc-400">Live log</p>
          <span className="text-[11px] text-zinc-400">{logs.length > 0 ? "streaming" : "idle"}</span>
        </div>
        <div className="mt-3 space-y-1.5 font-mono text-[11px] text-zinc-500">
          {logs.length === 0 && <p className="text-zinc-400">Waiting for a repository…</p>}
          {logs.map((entry) => (
            <p key={entry.id} className="truncate">{entry.text}</p>
          ))}
          {error && <p className="text-red-600">{error}</p>}
        </div>
      </div>

    </section>
  );
}
