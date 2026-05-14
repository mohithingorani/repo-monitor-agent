import requests
import os
import time
import logging
from dotenv import load_dotenv
from langchain_core.tools import tool
from typing import Optional, List, Set
from config.github import GITHUB_API, HEADERS, REQUEST_TIMEOUT
from utils.retry import create_github_retry_decorator

load_dotenv()
logger = logging.getLogger(__name__)

BINARY_EXTENSIONS: Set[str] = {
    ".pyc", ".pyo", ".pyd", ".so", ".dll", ".dylib", ".exe", ".bin", ".o", ".a",
    ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".svg", ".webp",
    ".mp3", ".mp4", ".wav", ".avi", ".mov", ".mkv", ".flv", ".webm",
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".odt",
    ".zip", ".tar", ".gz", ".rar", ".7z", ".bz2",
    ".woff", ".woff2", ".ttf", ".eot", ".otf",
    ".map", ".min.js", ".min.css", ".bundle.js",
    ".lock", ".sum", ".pkg",
    ".env", ".env.local", ".env.development", ".env.production",
    "package-lock.json", "yarn.lock", "poetry.lock",
    "yarn.lock",
}

SKIP_PATTERNS: Set[str] = {
    "node_modules/", ".git/", "__pycache__/", ".pytest_cache/",
    ".venv/", "venv/", "env/", ".idea/", ".vscode/",
    "dist/", "build/", "out/", ".next/", ".nuxt/",
    ".cache/", ".parcel-cache/", ".turbo/", "coverage/",
    ".DS_Store", "Thumbs.db",
}

MAX_FILE_SIZE = 1_000_000


def is_text_file(path: str, size: Optional[int] = None) -> bool:
    if any(path.startswith(p) or p in path for p in SKIP_PATTERNS):
        return False
    if any(path.endswith(ext) for ext in BINARY_EXTENSIONS):
        return False
    if size is not None and size > MAX_FILE_SIZE:
        return False
    ext = os.path.splitext(path)[1].lower()
    code_exts = {
        ".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".c", ".cpp", ".h", ".hpp",
        ".cs", ".go", ".rs", ".rb", ".php", ".swift", ".kt", ".scala", ".lua",
        ".sh", ".bash", ".zsh", ".fish", ".ps1", ".bat", ".cmd",
        ".html", ".htm", ".css", ".scss", ".sass", ".less",
        ".json", ".yaml", ".yml", ".toml", ".xml", ".env", ".properties",
        ".md", ".txt", ".rst", ".adoc", ".tex",
        ".sql", ".graphql", ".gql", ".proto", ".tf", ".hcl",
        ".dockerfile", ".dockerignore",
        ".gitignore", ".gitattributes", ".editorconfig",
        ".eslintrc", ".prettierrc", ".babelrc", ".nvmrc", ".python-version",
        ".htaccess", ".nginx",
    }
    if ext in code_exts:
        return True
    base = os.path.basename(path).lower()
    if base in {"makefile", "rakefile", "gemfile", "procfile", "readme", "license", "changelog"}:
        return True
    return False


def handle_rate_limit(response: requests.Response) -> bool:
    if response.status_code == 403:
        if "X-RateLimit-Remaining" in response.headers:
            remaining = int(response.headers["X-RateLimit-Remaining"])
            if remaining == 0:
                reset_time = int(response.headers.get("X-RateLimit-Reset", 0))
                wait_time = max(reset_time - time.time(), 0) if reset_time else 60
                logger.warning(f"GitHub rate limit hit. Waiting {wait_time:.0f}s")
                time.sleep(min(wait_time + 5, 120))
                return True
    return False


@create_github_retry_decorator()
def _make_request(url: str) -> requests.Response:
    response = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
    if response.status_code == 403 and handle_rate_limit(response):
        response = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
    response.raise_for_status()
    return response


@tool
def get_file_content(owner: str, repo: str, file_path: str) -> str:
    """
    Fetch the content of a single file from a GitHub repository.
    Only works for text-based files. Returns empty string for binary or skipped files.
    """
    if not is_text_file(file_path):
        return ""
    url = f"{GITHUB_API}/repos/{owner}/{repo}/contents/{file_path}"
    try:
        response = _make_request(url)
        file_info = response.json()
        if isinstance(file_info, dict) and "content" in file_info:
            import base64
            content = base64.b64decode(file_info["content"]).decode("utf-8", errors="replace")
            return content
        return ""
    except requests.HTTPError as e:
        if e.response and e.response.status_code == 404:
            logger.warning(f"File not found (404): {file_path}")
            return ""
        raise
    except Exception as e:
        logger.error(f"Failed to fetch {file_path}: {e}")
        raise


@create_github_retry_decorator()
def get_repo_contents(owner: str, repo: str, path: str = "") -> List[dict]:
    url = f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}"
    response = _make_request(url)
    return response.json()


def get_file_size(owner: str, repo: str, file_path: str) -> Optional[int]:
    url = f"{GITHUB_API}/repos/{owner}/{repo}/contents/{file_path}"
    try:
        response = requests.head(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        if response.status_code == 200:
            return int(response.headers.get("Content-Length", 0))
    except Exception:
        pass
    return None