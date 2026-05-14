from langchain_core.messages import ToolMessage
import logging
from models.state import MessageState
from tools.github import get_repo_contents, is_text_file
from config.github import HEADERS
from utils.retry import create_github_retry_decorator
from tools.github import get_repo_contents as fetch_contents
import requests
from config.github import GITHUB_API

logger = logging.getLogger(__name__)


@create_github_retry_decorator()
def _fetch_directory(owner: str, repo: str, path: str) -> list:
    url = f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}"
    response = requests.get(url, headers=HEADERS, timeout=10)
    response.raise_for_status()
    return response.json()


def get_repo_files(state: MessageState) -> MessageState:
    owner = state.owner
    repo = state.repo

    all_files = []

    def scan_directory(path: str = ""):
        try:
            items = _fetch_directory(owner, repo, path)
            if not isinstance(items, list):
                items = [items]
            for item in items:
                if item["type"] == "file":
                    file_path = item["path"]
                    if is_text_file(file_path):
                        all_files.append(file_path)
                    else:
                        logger.debug(f"Skipping binary/skip file: {file_path}")
                elif item["type"] == "dir":
                    scan_directory(item["path"])
        except Exception as e:
            logger.warning(f"Failed to scan directory '{path}': {e}")

    scan_directory("")

    total_found = len(all_files)
    logger.info(f"Scanned {total_found} text files from {owner}/{repo}")

    return MessageState(
        files=all_files,
        messages=[ToolMessage(content=f"Scanned {total_found} text files from repo", tool_call_id="get_repo_files")],
        llm_calls=0,
        owner=owner,
        repo=repo,
    )