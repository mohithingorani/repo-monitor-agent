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
    │ get-all-files│ ──► Recursively fetch all file paths
    └──────────────┘
           │
           ▼
    ┌───────────────┐
    │important_files│ ──► LLM filters to top 10 important files
    └───────────────┘
           │
           ▼
    ┌──────────────┐
    │ get_metadata │ ──► Infer tech stack, license, maturity
    └──────────────┘
           │
           ▼
    ┌──────────────┐
    │get_contents  │ ──► Fetch each file's content sequentially
    └──────────────┘
           │
           ▼
    ┌──────────────┐
    │   get_issue  │ ──► LLM detects issues with severity
    └──────────────┘
           │
           ▼
    ┌──────────────┐
    │  summarizer  │ ──► Group and prioritize findings
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
| LLM Runtime | Ollama (phi3:mini) |
| State Management | LangGraph InMemorySaver |
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Data Validation | Pydantic v2 |

### Directory Structure

```
├── agent-backend/
│   ├── agent/
│   │   ├── graph.py          # LangGraph state machine definition
│   │   ├── conditions.py     # Conditional routing logic
│   │   └── nodes/            # Individual graph nodes
│   │       ├── parse_repo.py
│   │       ├── get_repo_files.py
│   │       ├── important_files.py
│   │       ├── get_contents.py
│   │       ├── get_issue.py
│   │       ├── summarize.py
│   │       └── git_metadata.py
│   ├── api/
│   │   ├── main.py           # FastAPI app + CORS config
│   │   ├── chat.py           # /chat POST endpoint
│   │   ├── schemas/          # Request/response models
│   │   └── core/             # Logging, config
│   ├── llm/
│   │   └── ollama.py         # ChatOllama client
│   ├── models/
│   │   ├── state.py          # MessageState, RepoMetaData
│   │   └── outputs.py        # Structured output schemas
│   ├── tools/
│   │   ├── github.py         # get_file_content tool
│   │   ├── parse_repo.py     # URL parsing
│   │   └── issue_detector.py # Issue classification
│   ├── config/
│   │   └── github.py         # GitHub API config
│   └── main.py               # Agent invocation entry point
│
└── frontend/
    ├── app/
    │   └── page.tsx          # Chat interface
    └── package.json
```

## Prerequisites

1. **GitHub Personal Access Token** - Required for GitHub API rate limits
   - Create at: https://github.com/settings/tokens
   - No specific scopes needed for public repos

2. **Ollama** - Local LLM runtime
   - Install: https://github.com/ollama/ollama
   - Pull model: `ollama pull phi3:mini`

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

Analyzes a GitHub repository and returns issue summary.

**Request:**
```bash
curl -X POST http://localhost:8000/chat/ \
  -H "Content-Type: application/json" \
  -d '{"prompt": "https://github.com/facebook/react"}'
```

**Response:**
```json
{
  "response": "## Issue Summary\n\n### Top Issue Categories\n- **State Management**: 3 occurrences\n- **Error Handling**: 2 occurrences\n\n### Critical Issues\n1. **Memory Leak in useEffect** (src/hooks/useCustom.js:45)\n   - Missing cleanup function causes memory leak\n\n### Severity Distribution\n- Critical: 1\n- High: 2\n- Medium: 3\n- Low: 4\n\n### Recommendations\n1. Add proper cleanup in useEffect hooks\n2. Implement error boundaries..."
}
```

### GET /health

Health check endpoint.

```bash
curl http://localhost:8000/health
```

## Agent Nodes Explained

### parse_repo (tools/parse_repo.py)
Extracts owner and repo name from the input URL using regex. Returns initial state with `owner`, `repo`, empty `files` list, and `llm_calls: 0`.

### get_repo_files (agent/nodes/get_repo_files.py)
Recursive directory traversal using GitHub Contents API. Builds complete file list for the repository, handling nested directories. Returns flat list of all file paths.

### important_files (agent/nodes/important_files.py)
Uses LLM with structured output (`ImportantFilesOutput`) to filter files. System prompt instructs LLM to include:
- Core source files (.py, .js, .ts, .java, etc.)
- Key documentation (README, docs)
- Exclude config, env, build artifacts, dependencies

Returns max 10 important files.

### get_metadata (agent/nodes/git_metadata.py)
Uses LLM with structured output (`RepoMetaData`) to infer:
- Tech stack (languages, frameworks)
- License
- Project maturity (Prototype → Mature)

### get_contents (agent/nodes/get_contents.py)
Sequentially fetches content for each important file using the `get_file_content` tool (bound to LLM). Stores content in `curr_observation` for issue detection.

### get_issue (agent/nodes/get_issue.py)
Invokes `issue_detector.is_issue_in_file()` which uses LLM with structured output (`isIssue`) to determine:
- `is_issue`: Boolean flag
- `issue_description`: Brief description if issue exists
- `severity`: Critical | High | Medium | Low

Results appended to `observations` list as `ObservationState` objects.

### summarizer (agent/nodes/summarize.py)
Final node that aggregates all observations. Uses LLM to:
1. Group similar issues by category
2. Identify patterns across files
3. Prioritize by severity
4. Generate markdown report with counts and recommendations

### Conditional Routing (agent/conditions.py)
`should_continue()` checks if `curr_index < len(files)`:
- If true → continue to `get_contents` (fetch next file)
- If false → route to `summarizer` (generate final report)

## State Schema (models/state.py)

```python
class MessageState(BaseModel):
    messages: Annotated[list[AnyMessage], add]  # LangChain messages
    observations: Annotated[list[ObservationState], add] = []
    llm_calls: int = 0
    files: list[str] = []
    owner: str = ""
    repo: str | None = None
    path: str = ""
    curr_index: int = 0
    curr_observation: str = ""
    issue_called: int | None = 0
    final_observations: str | None = None
    repo_metadata: RepoMetaData | None = None

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

Edit `agent-backend/llm/ollama.py`:

```python
from langchain_ollama import ChatOllama

llm = ChatOllama(model="llama3:8b", temperature=0)  # Change model
```

Ensure the model is pulled: `ollama pull llama3:8b`

### Adding New Agent Nodes

1. Create node function in `agent-backend/agent/nodes/`
2. Register in `agent/backend/agent/graph.py`:
   ```python
   agent_builder.add_node("node_name", your_node_function)
   agent_builder.add_edge("previous_node", "node_name")
   ```
3. Ensure node returns `MessageState` with relevant fields updated

### Extending Issue Detection

Modify `agent-backend/tools/issue_detector.py` system prompt to:
- Add new issue categories
- Adjust severity criteria
- Change detection rules

