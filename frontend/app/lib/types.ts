export interface MessageState {
  messages: any[];
  observations: ObservationState[];
  llm_calls: number;
  files: string[];
  owner: string;
  repo: string;
  path: string;
  curr_index: number;
  curr_observation: string;
  issue_called: number;
  repo_metadata: RepoMetaData | null;
  file_contents: Record<string, string>;
  skipped_files: string[];
  errors: string[];
}

export interface RepoMetaData {
  tech_stack: string[];
  license: string | null;
  project_maturity: "Prototype" | "Early / MVP" | "Production-ready" | "Mature";
}

export interface ObservationState {
  file: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  issue: string;
}

export interface ChatResponse {
  response: string;
  thread_id: string;
}

export interface StreamChunk {
  parse_repo?: MessageState;
  "get-all-files"?: MessageState;
  important_files?: MessageState;
  get_metadata?: MessageState;
  analyze?: MessageState;
  summarizer?: MessageState;
}

export interface ActivityEntry {
  id: string;
  text: string;
  type: "info" | "success" | "warning" | "error";
}

export type ErrorType = "network" | "api" | "validation" | "timeout" | "parse" | "rate_limit";

export interface AppError {
  type: ErrorType;
  message: string;
  recoverable: boolean;
  retryAfter?: number;
}

export type ValidationStatus = "idle" | "valid" | "invalid" | "checking";

export interface ValidationResult {
  status: ValidationStatus;
  error?: string;
  suggestion?: string;
  owner?: string;
  repo?: string;
}

export interface AnalysisHistoryItem {
  id: string;
  repoName: string;
  owner: string;
  repo: string;
  timestamp: number;
  observationCount: number;
  fileCount: number;
  techStack: string[];
  maturity: string | null;
}

export interface AnalysisState {
  appState: "idle" | "analyzing" | "done" | "error";
  prompt: string;
  error: AppError | null;
  streamStatus: Record<string, boolean>;
  activityLog: { id: string; text: string; type: "info" | "success" | "warning" | "error" }[];
  observations: ObservationState[];
  metadata: RepoMetaData | null;
  filesFound: number;
  filesAnalyzed: number;
  skippedFiles: string[];
  response: string;
  repoName: string;
  retryCount: number;
}