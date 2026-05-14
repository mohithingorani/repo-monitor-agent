import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import partial
from models.state import MessageState, ObservationState
from langchain.messages import ToolMessage
from agent.nodes.batch_analyze import run_batch_analysis

logger = logging.getLogger(__name__)

MAX_CONCURRENT_FETCHES = 8
_executor = ThreadPoolExecutor(max_workers=MAX_CONCURRENT_FETCHES)


def _fetch_single_file(owner: str, repo: str, file_path: str) -> tuple[str, str | None, str | None]:
    try:
        from tools.github import get_file_content
        content = get_file_content.invoke({
            "owner": owner,
            "repo": repo,
            "file_path": file_path,
        })
        return (file_path, content if content else None, None)
    except Exception as e:
        return (file_path, None, str(e))


def _fetch_all_contents_sync(files: list[str], owner: str, repo: str) -> tuple[dict[str, str], list[str], list[str]]:
    contents: dict[str, str] = {}
    skipped: list[str] = []
    errors: list[str] = []

    fetch_func = partial(_fetch_single_file, owner, repo)
    futures = {(_executor.submit(fetch_func, f), f) for f in files}

    for future, f in futures:
        try:
            path, content, error = future.result()
            if error:
                errors.append(f"{path}: {error}")
            elif content:
                contents[path] = content
            else:
                skipped.append(path)
        except Exception as e:
            errors.append(f"{f}: {e}")

    return contents, skipped, errors


def analyze_all_files(state: MessageState) -> MessageState:
    files = state.files
    owner = state.owner
    repo = state.repo

    logger.info(f"Fetching content for {len(files)} files concurrently...")

    contents, skipped, errors = _fetch_all_contents_sync(files, owner, repo)

    success_count = len(contents)
    total = len(files)
    logger.info(f"Fetched {success_count}/{total} files. Skipped: {len(skipped)}, Errors: {len(errors)}")

    if contents:
        logger.info("Starting batch LLM analysis...")
        observations = run_batch_analysis(list(contents.keys()), contents)
    else:
        observations = []

    issue_count = len(observations)
    logger.info(f"Analysis complete. Found {issue_count} issues across {success_count} files")

    return MessageState(
        messages=[ToolMessage(
            content=f"Analysis complete: {success_count}/{total} files analyzed, {issue_count} issues found",
            tool_call_id="analyze_all_files"
        )],
        files=state.files,
        owner=owner,
        repo=repo,
        file_contents=contents,
        observations=observations,
        skipped_files=skipped,
        errors=errors,
        llm_calls=state.llm_calls + _estimate_llm_calls(len(contents)),
        path="",
        curr_index=len(files),
    )


def _estimate_llm_calls(file_count: int) -> int:
    if file_count == 0:
        return 0
    batch_size = 3
    return (file_count + batch_size - 1) // batch_size