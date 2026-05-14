"use client";
import { useState, useCallback, useRef } from "react";
import type { 
  ObservationState, 
  RepoMetaData, 
  StreamChunk,
  AppError 
} from "./types";

interface ActivityEntry {
  id: string;
  text: string;
  type: "info" | "success" | "warning" | "error";
}
import { streamRequest } from "./api";
import { validateGitHubInput, parseError, getErrorMessage, addToHistory } from "./utils";

type AppState = "idle" | "analyzing" | "done" | "error";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export function useAnalysisState() {
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
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const addLog = useCallback((text: string, type: ActivityEntry["type"] = "info") => {
    setActivityLog((prev) => [...prev.slice(-50), { id: crypto.randomUUID(), text, type }]);
  }, []);

  const resetAll = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
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
  }, []);

  const handleAnalysisError = useCallback((err: unknown, currentRetry: number): AppError => {
    const appError = parseError(err);
    
    if (appError.recoverable && currentRetry < MAX_RETRIES) {
      return { ...appError, message: `${appError.message} (Attempt ${currentRetry + 1}/${MAX_RETRIES})` };
    }
    
    return appError;
  }, []);

  const processStreamChunk = useCallback((chunk: StreamChunk) => {
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
    }
  }, [addLog]);

  const executeAnalysis = useCallback(async (url: string, retryCount: number = 0) => {
    abortControllerRef.current = new AbortController();
    
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

      if (repoName) {
        addToHistory({
          repoName,
          owner: repoName.split("/")[0] || "",
          repo: repoName.split("/")[1] || "",
          observationCount: observations.length,
          fileCount: filesAnalyzed,
          techStack: metadata?.tech_stack || [],
          maturity: metadata?.project_maturity || null,
        });
      }
    } catch (err) {
      const appError = handleAnalysisError(err, retryCount);
      addLog(getErrorMessage(appError), "error");
      setError(appError);
      setAppState("error");
      
      if (appError.recoverable && retryCount < MAX_RETRIES) {
        addLog(`Retrying in ${RETRY_DELAY / 1000} seconds...`, "info");
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        setRetryCount(prev => prev + 1);
        return executeAnalysis(url, retryCount + 1);
      }
    }
  }, [appState, repoName, observations.length, filesAnalyzed, metadata, addLog, handleAnalysisError, processStreamChunk]);

  const startAnalysis = useCallback(async () => {
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
  }, [prompt, addLog, resetAll, executeAnalysis]);

  const retryAnalysis = useCallback(async () => {
    if (!error?.recoverable) return;
    
    setError(null);
    setAppState("analyzing");
    addLog("Retrying analysis...", "info");
    
    await executeAnalysis(prompt.trim(), retryCount + 1);
  }, [error, prompt, addLog, executeAnalysis, retryCount]);

  const isAnalyzing = appState === "analyzing";
  const isDone = appState === "done";
  const isError = appState === "error";
  const canRetry = error?.recoverable && retryCount < MAX_RETRIES;

  return {
    state: {
      appState,
      prompt,
      error,
      streamStatus,
      activityLog,
      observations,
      metadata,
      filesFound,
      filesAnalyzed,
      skippedFiles,
      response,
      repoName,
      retryCount,
    },
    setters: {
      setPrompt,
      setError,
    },
    actions: {
      startAnalysis,
      retryAnalysis,
      resetAll,
    },
    computed: {
      isAnalyzing,
      isDone,
      isError,
      canRetry,
      validation: validateGitHubInput(prompt),
    },
  };
}