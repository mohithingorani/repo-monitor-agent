from langchain_core.messages import SystemMessage, HumanMessage, ToolMessage
from llm.groq import llm
from models.state import MessageState, RepoMetaData


llm_with_structured = llm.with_structured_output(RepoMetaData)


def get_metadata(state: MessageState) -> MessageState:
    files = state.files[:30]

    response = llm_with_structured.invoke([
        SystemMessage(content=(
            "You analyze a GitHub repository at a high level. "
            "Infer tech stack, languages, frameworks, license, "
            "and project maturity based on file names, structure, "
            "README content, and dependencies."
        )),
        HumanMessage(content=f"Repository files:\n{chr(10).join(files)}")
    ])

    return MessageState(
        repo_metadata=response,
        llm_calls=state.llm_calls + 1,
        files=state.files,
        owner=state.owner,
        repo=state.repo,
        messages=[ToolMessage(
            content=f"Inferred metadata: {response.tech_stack}, {response.project_maturity}",
            tool_call_id="get_metadata"
        )],
    )