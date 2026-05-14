"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { streamRequest } from "@/app/lib/api";
import { ObservationState, RepoMetaData, StreamChunk } from "@/app/lib/types";
import { isValidGitHubUrl } from "@/app/lib/utils";
import { Navbar } from "@/app/components/Navbar";
import { AnimatedBackground } from "@/app/components/AnimatedBackground";
import { RepoInput } from "@/app/components/RepoInput";
import { IssueCard } from "@/app/components/ObservationList";
import { ToastProvider } from "@/app/components/ToastProvider";
import { HowItWorks, Examples, Footer } from "@/app/components/HowItWorks";
import { EmptyState } from "@/app/components/EmptyState";
import { UnifiedAnalysisPanel } from "@/app/components/UnifiedAnalysisPanel";
import { RotateCcw } from "lucide-react";

type AppState = "idle" | "analyzing" | "done" | "error";

interface ActivityEntry {
  id: string;
  text: string;
  type: "info" | "success" | "warning" | "error";
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const [streamStatus, setStreamStatus] = useState<Record<string, boolean>>({});
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [observations, setObservations] = useState<ObservationState[]>([]);
  const [metadata, setMetadata] = useState<RepoMetaData | null>(null);
  const [filesFound, setFilesFound] = useState(0);
  const [filesAnalyzed, setFilesAnalyzed] = useState(0);
  const [skippedFiles, setSkippedFiles] = useState<string[]>([]);
  const [response, setResponse] = useState("");
  const [repoName, setRepoName] = useState("");

  function addLog(text: string, type: ActivityEntry["type"] = "info") {
    setActivityLog((prev) => [...prev, { id: crypto.randomUUID(), text, type }]);
  }

  function resetAll() {
    setAppState("idle");
    setStreamStatus({});
    setActivityLog([]);
    setObservations([]);
    setMetadata(null);
    setFilesFound(0);
    setFilesAnalyzed(0);
    setSkippedFiles([]);
    setResponse("");
    setRepoName("");
    setError("");
  }

  const handleSubmit = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    if (!isValidGitHubUrl(trimmed)) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }

    setError("");
    setAppState("analyzing");
    setStreamStatus({});
    setActivityLog([{ id: crypto.randomUUID(), text: "Starting analysis...", type: "info" }]);
    setRepoName(trimmed.split("github.com/")[1] ?? trimmed);

    try {
      const gen = streamRequest(trimmed);

      for await (const line of gen) {
        try {
          const chunk = JSON.parse(line) as StreamChunk;

          if (chunk.parse_repo) {
            setStreamStatus((s) => ({ ...s, parse_repo: true }));
            addLog(`URL parsed: ${chunk.parse_repo.owner}/${chunk.parse_repo.repo}`, "success");
          }

          if (chunk["get-all-files"]) {
            setStreamStatus((s) => ({ ...s, "get-all-files": true }));
            const count = chunk["get-all-files"].files?.length ?? 0;
            setFilesFound(count);
            addLog(`Scanned ${count} text files`, "success");
          }

          if (chunk.important_files) {
            setStreamStatus((s) => ({ ...s, important_files: true }));
            const count = chunk.important_files.files?.length ?? 0;
            setFilesFound(count);
            addLog(`Selected ${count} important files`, "success");
          }

          if (chunk.get_metadata) {
            setStreamStatus((s) => ({ ...s, get_metadata: true }));
            const meta = chunk.get_metadata.repo_metadata;
            if (meta) {
              setMetadata(meta);
              addLog(`Tech stack: ${meta.tech_stack.join(", ")}`, "info");
              addLog(`Maturity: ${meta.project_maturity}`, "info");
            }
          }

          if (chunk.analyze) {
            setStreamStatus((s) => ({ ...s, analyze: true }));
            const obs = chunk.analyze.observations ?? [];
            const analyzed = Object.keys(chunk.analyze.file_contents ?? {}).length;
            setObservations(obs);
            setFilesAnalyzed(analyzed);
            setSkippedFiles(chunk.analyze.skipped_files ?? []);
            if (chunk.analyze.errors?.length) addLog(`${chunk.analyze.errors.length} file(s) failed to fetch`, "warning");
            addLog(`Found ${obs.length} issue(s) across ${analyzed} file(s)`, obs.length > 0 ? "warning" : "success");
          }

          if (chunk.summarizer) {
            setStreamStatus((s) => ({ ...s, summarizer: true }));
            const msgs = chunk.summarizer.messages;
            if (msgs && msgs.length > 0) {
              const last = msgs[msgs.length - 1];
              if (typeof last?.content === "string") setResponse(last.content);
            }
            addLog("Report generated", "success");
            setAppState("done");
          }
        } catch {
          continue;
        }
      }
    } catch (e: any) {
      addLog(`Error: ${e?.message ?? "Unknown error"}`, "error");
      setError(e?.message ?? "Analysis failed. Please try again.");
      setAppState("error");
    }
  }, [prompt]);

  const isAnalyzing = appState === "analyzing";
  const isDone = appState === "done";
  const showAnalysis = appState !== "idle";

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-[#f5f5f2] text-zinc-950">
        <Navbar />

        <main className="flex-1 relative">
          <motion.div
            key="hero"
            initial={{ opacity: 1 }}
            className="relative"
          >
            <AnimatedBackground />

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-10 sm:pb-12">
              <div className={showAnalysis ? "grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-start" : "max-w-3xl mx-auto text-center"}>
                <div className={showAnalysis ? "space-y-6 sm:space-y-8" : "space-y-6 sm:space-y-8"}>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="space-y-5"
                  >
                    <div className={showAnalysis ? "inline-flex items-center gap-2 px-2.5 py-1 bg-white border border-zinc-200 rounded-md text-[11px] text-zinc-600 shadow-[0_1px_0_rgba(15,23,42,0.04)]" : "inline-flex items-center gap-2 px-3 py-1 bg-white border border-zinc-200 rounded-md text-[11px] text-zinc-600 shadow-[0_1px_0_rgba(15,23,42,0.04)]"}>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span>AI code intelligence · built for engineering teams</span>
                    </div>

                    <h1 className={showAnalysis ? "text-3xl sm:text-4xl md:text-[44px] font-semibold text-zinc-950 tracking-tight leading-tight" : "text-3xl sm:text-4xl md:text-[48px] font-semibold text-zinc-950 tracking-tight leading-tight"}>
                      Repository security analysis
                      <br />
                      for engineering teams
                    </h1>

                    <p className={showAnalysis ? "text-sm text-zinc-700 leading-relaxed max-w-md" : "text-sm text-zinc-700 leading-relaxed max-w-xl mx-auto"}>
                      Scan public GitHub repositories and generate structured findings: security, architecture,
                      and engineering risk—ranked by severity with actionable recommendations.
                    </p>
                  </motion.div>

                  <div className={showAnalysis ? "space-y-5 sm:space-y-6" : "space-y-5 sm:space-y-6 max-w-2xl mx-auto"}>
                    <RepoInput
                      value={prompt}
                      onChange={setPrompt}
                      onSubmit={handleSubmit}
                      disabled={isAnalyzing}
                      error={error}
                    />
                  </div>
                </div>

                {showAnalysis && (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="space-y-6"
                      id="analysis"
                    >
                      <UnifiedAnalysisPanel
                        repoName={repoName}
                        appState={appState}
                        streamStatus={streamStatus}
                        observations={observations}
                        activityLog={activityLog}
                        metadata={metadata}
                        filesFound={filesFound}
                        filesAnalyzed={filesAnalyzed}
                        skippedFiles={skippedFiles}
                        error={error}
                      />
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {isDone && (
              <motion.section
                key="results"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-zinc-400">Findings</p>
                    <h2 className="text-2xl font-semibold text-zinc-950 mt-1">
                      {observations.length} issue{observations.length === 1 ? "" : "s"} detected
                    </h2>
                    <p className="text-xs text-zinc-500 mt-2 font-mono">
                      {repoName} · {filesAnalyzed} files analyzed
                    </p>
                  </div>
                  <button
                    onClick={resetAll}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 transition-colors px-3 py-1.5 rounded-md border border-zinc-200 hover:bg-zinc-50"
                  >
                    <RotateCcw className="w-3 h-3" />
                    New analysis
                  </button>
                </div>

                <div className="space-y-6">
                  {observations.length === 0 && <EmptyState />}

                  {observations.length > 0 && (
                    <div className="space-y-4">
                      <div className="border-b border-zinc-100 pb-3">
                        <p className="text-[11px] uppercase tracking-wider text-zinc-400">Issue groups</p>
                      </div>
                      <div className="space-y-3">
                        {observations.map((obs, i) => (
                          <IssueCard key={`${obs.file}-${i}`} obs={obs} index={i} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </main>

        <div className="max-w-6xl mx-auto px-6">
          <div className="border-t border-zinc-200 pt-8 pb-4">
            <HowItWorks />
            <Examples onSelect={setPrompt} disabled={isAnalyzing} />
          </div>
          <Footer />
        </div>
      </div>
    </ToastProvider>
  );
}
