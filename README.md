# GitHub Agent

AI-powered repository analysis tool that automatically detects issues, bugs, security vulnerabilities, and code quality problems in any public GitHub repository.

## Overview

The agent takes a GitHub repository URL as input, traverses the codebase, identifies important files, analyzes each one for issues, and produces a severity-ranked summary of findings grouped by category.

```
User Input: "https://github.com/owner/repo"
            │
            ▼
     ┌──────────────┐
     │  parse_repo  │ ──► Extract owner/repo from URL
     └──────────────┘
            │
            ▼
     ┌──────────────┐
     │ get-all-files│ ──► Recursively fetch all file paths (binary files filtered)
     └──────────────┘
            │
            ▼
     ┌────────────────┐
     │ important_files│ ──► LLM filters to top 10 important files
     └────────────────┘
            │
            ▼
     ┌──────────────┐
     │ get_metadata │ ──► Infer tech stack, license, maturity
     └──────────────┘
            │
            ▼
     ┌──────────────────┐
     │   analyze_files  │ ──► Parallel fetch + batch LLM analysis
     └──────────────────┘
            │
            ▼
     ┌──────────────┐
     │  summarizer │ ──► Group and prioritize findings
     └──────────────┘
            │
            ▼
     Final Report (Markdown)
```

## Architecture

| Layer | Technology |
|-------|------------|
| Backend API | FastAPI (Uvicorn) |
| Agent Framework | LangGraph |
| LLM Runtime | Groq (Llama 3.3 70B) |
| State Management | LangGraph InMemorySaver (checkpointing) |
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Data Validation | Pydantic v2 |

### Performance Optimizations

- **Parallel file fetching** — 8 concurrent GitHub API calls via ThreadPoolExecutor
- **Batch LLM analysis** — 3 files analyzed per LLM call instead of 1-on-1 (reduces token overhead and latency)
- **Binary file filtering** — Automatically skips binaries, images, lockfiles, node_modules, etc. at scan time
- **Exponential backoff retry** — GitHub API and LLM calls retry with jitter on transient failures
- **Streaming support** — Progressive node-by-node state updates via `/chat/stream`
- **Checkpointing** — LangGraph InMemorySaver with thread_id for state persistence and history

### Directory Structure

```
├── agent-backend/
│   ├── agent/
│   │   ├── graph.py              # LangGraph state machine definition
│   │   └── nodes/
│   │       ├── parse_repo.py     # Extract owner/repo from URL
│   │       ├── get_repo_files.py # Recursive file discovery (binary filter)
│   │       ├── important_files.py # LLM filters to top 10 files
│   │       ├── git_metadata.py   # Tech stack, license, maturity inference
│   │       ├── get_contents.py   # Parallel fetch + batch analysis coordinator
│   │       ├── batch_analyze.py  # Batch LLM analysis (3 files/call)
│   │       └── summarize.py      # Final report generation
│   ├── api/
│   │   ├── main.py               # FastAPI app + CORS config
│   │   ├── chat.py               # /chat, /chat/stream, /chat/state/{id}
│   │   └── schemas/
│   │       └── chat.py           # PromptRequest, StreamPromptRequest
│   ├── llm/
│   │   └── groq.py               # ChatGroq client (Llama 3.3 70B)
│   ├── models/
│   │   ├── state.py              # MessageState, RepoMetaData, ObservationState
│   │   ├── outputs.py            # ImportantFilesOutput, isIssue
│   │   └── batch_outputs.py      # BatchAnalysisOutput, BatchAnalysisResult
│   ├── tools/
│   │   ├── github.py             # get_file_content tool, retry, rate limit handling
│   │   └── parse_repo.py         # URL parsing utility
│   ├── utils/
│   │   ├── retry.py              # Exponential backoff retry decorators
│   │   └── parallel.py           # ParallelExecutor, batch_items utilities
│   ├── config/
│   │   └── github.py             # GitHub API config
│   └── main.py                   # Agent invocation + streaming entry point
│
└── frontend/
    ├── app/
    │   └── page.tsx              # Chat interface
    └── package.json
```

## Prerequisites

1. **GitHub Personal Access Token** — Required for GitHub API rate limits
   - Create at: https://github.com/settings/tokens
   - No specific scopes needed for public repos

2. **Groq API Key** — Required for LLM inference
   - Sign up at: https://console.groq.com
   - Free tier available with rate limits

## Installation

### Backend

```bash
cd agent-backend

# Create virtual environment (Python 3.11-3.13 required)
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

## Configuration

Create `.env` in `agent-backend/`:

```bash
GITHUB_TOKEN=ghp_your_token_here
GROQ_API_KEY=gsk_your_key_here
```

Create `.env.local` in `frontend`:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## Running the Project

### Start Backend

```bash
cd agent-backend
uvicorn api.main:app --reload --port 8000
```

### Start Frontend

```bash
cd frontend
npm run dev
```

Access the UI at http://localhost:3000

## API Reference

### POST /chat/

Analyzes a GitHub repository and returns a full issue summary.

**Request:**
```bash
curl -X POST http://localhost:8000/chat/ \
  -H "Content-Type: application/json" \
  -d '{"prompt": "https://github.com/facebook/react"}'
```

**Response:**
```json
{
  "response": "### Issue Summary\n\n#### Top Issue Categories\n- **State Management**: 3 occurrences\n- **Error Handling**: 2 occurrences\n\n### Critical Issues\n1. **Memory Leak in useEffect** (src/hooks/useCustom.js:45)\n   - Missing cleanup function causes memory leak\n\n### Severity Distribution\n- Critical: 1\n- High: 2\n- Medium: 3\n- Low: 4\n\n### Recommendations\n1. Add proper cleanup in useEffect hooks\n2. Implement error boundaries...",
  "thread_id": "uuid-string"
}
```

### POST /chat/stream

Streams incremental state updates per node as newline-delimited JSON (ndjson). Emits one event per graph node as it executes.

**Request:**
```bash
curl -N -X POST http://localhost:8000/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"prompt": "https://github.com/facebook/react"}'
```

**Response:** Each line is a JSON object representing the full state after a node completes.

### GET /chat/state/{thread_id}

Retrieve the current checkpointed state for a given thread (requires thread_id from a previous call).

### GET /health

Health check endpoint.

```bash
curl http://localhost:8000/health
```

## Agent Nodes Explained

### parse_repo (agent/nodes/parse_repo.py)
Extracts owner and repo name from the input URL using regex. Returns initial `MessageState` with `owner`, `repo`, empty `files` list, and `llm_calls: 0`.

### get_repo_files (agent/nodes/get_repo_files.py)
Recursive directory traversal using GitHub Contents API. Automatically filters out binary files, images, lockfiles, node_modules, build artifacts, and other non-text files before adding to the file list. Handles errors gracefully per directory.

### important_files (agent/nodes/important_files.py)
Uses LLM with structured output (`ImportantFilesOutput`) to filter the full file list down to ~10 important files. System prompt instructs LLM to include core source files and key documentation, excluding config, env, dependencies, and build artifacts.

### get_metadata (agent/nodes/git_metadata.py)
Uses LLM with structured output (`RepoMetaData`) to infer:
- Tech stack (languages, frameworks)
- License
- Project maturity (Prototype → Mature)

### analyze_files (agent/nodes/get_contents.py + batch_analyze.py)
This node coordinates two phases:

1. **Parallel fetch** — Fetches content for all important files concurrently (up to 8 simultaneous GitHub API calls via ThreadPoolExecutor), with retry on transient failures.
2. **Batch LLM analysis** — Groups files into batches of 3 and sends them together to the LLM in a single structured call (`BatchAnalysisOutput`). This dramatically reduces total LLM calls and token usage compared to analyzing files one-by-one.

Results are accumulated as `ObservationState` objects in the state.

### summarizer (agent/nodes/summarize.py)
Final node that aggregates all observations. Uses LLM to:
1. Group similar issues by category
2. Identify patterns across files
3. Prioritize by severity
4. Generate a markdown report with counts and actionable recommendations

## State Schema (models/state.py)

```python
class MessageState(BaseModel):
    messages: Annotated[list[AnyMessage], add]    # LangChain message history
    observations: Annotated[list[ObservationState], add] = []
    llm_calls: int = 0                           # LLM call counter
    files: list[str] = []                        # Important files to analyze
    owner: str = ""
    repo: str | None = None
    curr_index: int = 0
    curr_observation: str = ""
    issue_called: int = 0
    repo_metadata: RepoMetaData | None = None
    file_contents: dict[str, str] = {}            # path -> content
    skipped_files: list[str] = []                # Binary/skipped files
    errors: list[str] = []                        # Non-fatal errors

class RepoMetaData(BaseModel):
    tech_stack: List[str]
    license: str | None
    project_maturity: Literal["Prototype", "Early / MVP", "Production-ready", "Mature"]

class ObservationState(BaseModel):
    file: str
    severity: str
    issue: str
```

## Customization

### Changing the LLM Model

Edit `agent-backend/llm/groq.py`:

```python
llm = ChatGroq(
    model="llama-3.3-70b-versatile",  # Change model
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY"),
    max_retries=3,
)
```

### Adding New Agent Nodes

1. Create node function in `agent-backend/agent/nodes/`
2. Register in `agent-backend/agent/graph.py`:
   ```python
   agent_builder.add_node("node_name", your_node_function)
   agent_builder.add_edge("previous_node", "node_name")
   ```
3. Ensure node returns `MessageState` with relevant fields updated

### Extending Issue Detection

Modify the system prompt in `agent-backend/agent/nodes/batch_analyze.py` (`_BATCH_ANALYSIS_SYSTEM_PROMPT`) to add new issue categories, adjust severity criteria, or change detection rules.