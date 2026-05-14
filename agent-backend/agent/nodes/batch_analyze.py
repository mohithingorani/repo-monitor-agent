import logging
from typing import Literal
from langchain_core.messages import SystemMessage
from llm.groq import llm
from models.batch_outputs import BatchAnalysisOutput
from models.state import ObservationState
from utils.parallel import batch_items

logger = logging.getLogger(__name__)

BATCH_SIZE = 3
llm_batch = llm.with_structured_output(BatchAnalysisOutput)


def run_batch_analysis(
    file_paths: list[str],
    file_contents: dict[str, str],
    batch_size: int = BATCH_SIZE,
) -> list[ObservationState]:
    batches = batch_items(file_paths, batch_size)
    all_observations: list[ObservationState] = []
    total_batches = len(batches)

    for batch_num, batch_files in enumerate(batches, start=1):
        prompt_parts = []
        for i, file_path in enumerate(batch_files):
            content = file_contents.get(file_path, "")
            truncated = content[:5000]
            prompt_parts.append(f"=== FILE {i+1}: {file_path} ===\n{truncated}")

        combined = "\n\n".join(prompt_parts)

        prompt = (
            f"Analyze the following {len(batch_files)} repository files for code issues.\n\n"
            f"{combined}\n\n"
            "Provide a structured analysis for each file."
        )

        try:
            response = llm_batch.invoke([
                SystemMessage(content=_BATCH_ANALYSIS_SYSTEM_PROMPT),
                SystemMessage(content=prompt),
            ])

            if response and hasattr(response, "results"):
                for result in response.results:
                    if result.is_issue and result.issue_description:
                        obs = ObservationState(
                            file=result.file,
                            severity=result.severity or "Medium",
                            issue=result.issue_description,
                        )
                        all_observations.append(obs)

            logger.info(
                f"Batch {batch_num}/{total_batches}: "
                f"{len(response.results) if response else 0} files, "
                f"{len([o for o in all_observations[-10:]])} new issues"
            )
        except Exception as e:
            logger.error(f"Batch {batch_num}/{total_batches} failed: {e}")

    return all_observations


_BATCH_ANALYSIS_SYSTEM_PROMPT = """You are a senior code reviewer analyzing multiple repository files simultaneously.

Task: Analyze each file and determine if it contains an issue.

What counts as an issue:
- Bugs, errors, or incorrect logic
- Security vulnerabilities
- Performance or scalability problems
- TODOs, FIXMEs, or known limitations
- Design flaws or poor practices
- Missing error handling
- Code smells or anti-patterns

What does NOT count as an issue:
- Pure documentation with no criticism
- Normal comments explaining code
- Stylistic preferences that don't affect functionality
- Expected boilerplate code

Rules:
- Be specific: mention exact line numbers, function names, or code snippets in issue_description
- If no issue exists, set is_issue=false (do NOT fabricate issues)
- Severity guidelines:
  * Critical: security vulnerabilities, data loss, crashes
  * High: broken functionality, race conditions, memory leaks
  * Medium: performance issues, poor error handling, code smells
  * Low: minor improvements, TODOs, minor code quality
- Return analysis for ALL files listed, even if they have no issues (set is_issue=false)
- Do NOT fabricate issues if none exist"""