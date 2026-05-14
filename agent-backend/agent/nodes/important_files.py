import logging
from models.state import MessageState
from models.outputs import ImportantFilesOutput
from langchain.messages import SystemMessage, HumanMessage, ToolMessage
from llm.groq import llm

logger = logging.getLogger(__name__)


MAX_FILES_TO_SEND = 50


def get_important_files(state: MessageState) -> MessageState:
    all_files = state.files

    files_for_llm = all_files[:MAX_FILES_TO_SEND]
    if len(all_files) > MAX_FILES_TO_SEND:
        logger.info(f"Truncating file list from {len(all_files)} to {MAX_FILES_TO_SEND} for LLM prompt")

    llm_with_structured = llm.with_structured_output(ImportantFilesOutput)

    system_msg = SystemMessage(
        content=(
            "You analyze a GitHub repository and identify files that are important for understanding the project. "
            "Include core source files (e.g. .py, .js, .ts, .java, .go, .rs) and key documentation (README, docs). "
            "Prioritize files that are most likely to contain bugs, security issues, or architectural problems. "
            "Exclude config files, environment files, editor settings, dependencies, build artifacts, "
            "node_modules, and non-essential utilities. "
            "Return at most 10 important files. If fewer than 10, return all relevant ones. "
            "Preserve the exact file paths as provided."
        )
    )
    human_msg = HumanMessage(
        content=f"Here is a list of files in the repository ({len(files_for_llm)} total):\n" + "\n".join(files_for_llm)
    )

    try:
        response = llm_with_structured.invoke([system_msg, human_msg])
        important = response.important_files
    except Exception as e:
        logger.error(f"LLM call failed for important_files: {e}")
        important = all_files[:10]

    return MessageState(
        owner=state.owner,
        repo=state.repo,
        llm_calls=state.llm_calls + 1,
        files=important,
        messages=[ToolMessage(
            content=f"Identified {len(important)} important files from {len(all_files)} total files",
            tool_call_id="get_important_files"
        )],
        path="",
        curr_index=0,
        observations=[],
    )