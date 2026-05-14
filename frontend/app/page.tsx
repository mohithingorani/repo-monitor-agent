"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { streamRequest } from "@/app/lib/api";
import { ObservationState, RepoMetaData, StreamChunk, ActivityEntry, AppError } from "@/app/lib/types";
import { validateGitHubInput, parseError, getErrorMessage, addToHistory } from "@/app/lib/utils";
import { Navbar } from "@/app/components/Navbar";
import { AnimatedBackground } from "@/app/components/AnimatedBackground";
import { RepoInput } from "@/app/components/RepoInput";
import { IssueCard } from "@/app/components/ObservationList";
import { ToastProvider } from "@/app/components/ToastProvider";
import { HowItWorks, Examples, Footer } from "@/app/components/HowItWorks";
import { EmptyState } from "@/app/components/EmptyState";
import { UnifiedAnalysisPanel } from "@/app/components/UnifiedAnalysisPanel";
import { HistoryPanel } from "@/app/components/HistoryPanel";
import { RotateCcw } from "lucide-react";

type AppState = "idle" | "analyzing" | "done" | "error";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<AppError | null>(null);
  const [streamStatus, setStreamStatus] = useState<Record<string, boolean>>({});
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [observations, setObservations] = useState<ObservationState[]>([]);
  const [metadata, setMetadata] = useState<RepoMetaData | null>(null);
  const [filesFound, setFilesFound] = useState(0);
  const [filesAnalyzed, setFilesAnalyzed] = useState(0);
  const [skippedFiles, setSkippedFiles] = useState<string[]>([]);
  const [response, setResponse] = useState("");
  const [repoName, setRepoName] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [historyTrigger, setHistoryTrigger] = useState(0);

  function addLog(text: string, type: ActivityEntry["type"] = "info") {
    setActivityLog((prev) => [...prev.slice(-50), { id: crypto.randomUUID(), text, type }]);
  }

  function resetAll() {
    setAppState("idle");
    setError(null);
    setStreamStatus({});
    setActivityLog([]);
    setObservations([]);
    setMetadata(null);
    setFilesFound(0);
    setFilesAnalyzed(0);
    setSkippedFiles([]);
    setResponse("");
    setRepoName("");
    setRetryCount(0);
  }

  function handleHistorySelect(url: string) {
    setPrompt(url);
  }

  const handleAnalysisError = (err: unknown, currentRetry: number): AppError => {
    const appError = parseError(err);
    
    if (appError.recoverable && currentRetry < MAX_RETRIES) {
      return { ...appError, message: `${appError.message} (Attempt ${currentRetry + 1}/${MAX_RETRIES})` };
    }
    
    return appError;
  };

  const processStreamChunk = (chunk: StreamChunk) => {
    if (chunk.parse_repo) {
      setStreamStatus((s) => ({ ...s, parse_repo: true }));
      const owner = chunk.parse_repo.owner || "";
      const repo = chunk.parse_repo.repo || "";
      if (owner && repo) {
        addLog(`URL parsed: ${owner}/${repo}`, "success");
      }
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
      if (chunk.analyze.errors?.length) {
        addLog(`${chunk.analyze.errors.length} file(s) failed to fetch`, "warning");
      }
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

      if (repoName) {
        const [owner, repo] = repoName.split("/");
        addToHistory({
          repoName,
          owner: owner || "",
          repo: repo || "",
          observationCount: observations.length,
          fileCount: filesAnalyzed,
          techStack: metadata?.tech_stack || [],
          maturity: metadata?.project_maturity || null,
        });
        setHistoryTrigger(prev => prev + 1);
      }
    }
  };

  const executeAnalysis = async (url: string, currentRetry: number = 0) => {
    try {
      const gen = streamRequest(url);

      for await (const line of gen) {
        try {
          const chunk = JSON.parse(line) as StreamChunk;
          processStreamChunk(chunk);
        } catch {
          continue;
        }
      }

      if (appState !== "done") {
        addLog("Analysis completed", "success");
      }
    } catch (err) {
      const appError = handleAnalysisError(err, currentRetry);
      addLog(getErrorMessage(appError), "error");
      setError(appError);
      setAppState("error");
      
      if (appError.recoverable && currentRetry < MAX_RETRIES) {
        addLog(`Retrying in ${RETRY_DELAY / 1000} seconds...`, "info");
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        setRetryCount(currentRetry + 1);
        return executeAnalysis(url, currentRetry + 1);
      }
    }
  };

  const startAnalysis = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const validation = validateGitHubInput(trimmed);
    if (validation.status !== "valid") {
      setError({
        type: "validation",
        message: validation.error || "Invalid input",
        recoverable: false,
      });
      addLog(validation.error || "Invalid input", "error");
      return;
    }

    resetAll();
    setError(null);
    setAppState("analyzing");
    setActivityLog([{ id: crypto.randomUUID(), text: "Starting analysis...", type: "info" }]);
    setRepoName(`${validation.owner}/${validation.repo}`);

    await executeAnalysis(trimmed, 0);
  };

  const retryAnalysis = async () => {
    if (!error?.recoverable) return;
    
    setError(null);
    setAppState("analyzing");
    addLog("Retrying analysis...", "info");
    
    await executeAnalysis(prompt.trim(), retryCount + 1);
  };

  const isAnalyzing = appState === "analyzing";
  const isDone = appState === "done";
  const isError = appState === "error";
  const canRetry = error?.recoverable && retryCount < MAX_RETRIES;
  const showAnalysis = appState !== "idle";

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-[#f5f5f2] text-zinc-950">
        <Navbar />

        <main className="flex-1 relative overflow-x-hidden">
          <motion.div
            key="hero"
            initial={{ opacity: 1 }}
            className="relative"
          >
            <AnimatedBackground />

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-10 sm:pb-12 overflow-hidden">
              <div className={showAnalysis ? "grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-6 lg:gap-12 items-start" : "max-w-3xl mx-auto text-center"}>
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
                      onSubmit={startAnalysis}
                      disabled={isAnalyzing}
                      error={error}
                      onRetry={retryAnalysis}
                      canRetry={canRetry}
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
                        error={error?.message}
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
                className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-zinc-500">Findings</p>
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
                        <p className="text-[11px] uppercase tracking-wider text-zinc-500">Issue groups</p>
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

        <div className="max-w-6xl mx-auto px-4 sm:px-6 overflow-hidden">
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