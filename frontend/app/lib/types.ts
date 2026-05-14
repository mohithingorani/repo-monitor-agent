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