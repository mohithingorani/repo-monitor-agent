from langchain_core.messages import SystemMessage, HumanMessage
from llm.groq import llm
from models.state import MessageState


def summarization_node(state: MessageState) -> MessageState:
    observations = state.observations

    response = llm.invoke([
        SystemMessage(content=(
            "You are a code review expert. Analyze a list of issue descriptions found in repository files. "
            "Summarize them by grouping similar issues, identifying patterns, and prioritizing by severity "
            "(Critical, High, Medium, Low). Output in structured markdown with categories, counts, "
            "and actionable recommendations. Do not use tools or function calls."
        )),
        HumanMessage(content=f"""Summarize these issues found across the repository files:

{observations}

Provide:
1. Top 3 issue categories by frequency
2. Critical issues (security/bugs blocking functionality)
3. Overall severity distribution

Repo Metadata (for context):
{state.repo_metadata}
""")
    ])

    return MessageState(
        messages=[response],
        files=state.files,
        owner=state.owner,
        repo=state.repo,
        curr_index=state.curr_index,
        observations=[],
        issue_called=state.issue_called,
        llm_calls=state.llm_calls + 1,
        path=state.path,
    )