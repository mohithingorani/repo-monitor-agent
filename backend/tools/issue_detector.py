from models.outputs import isIssue
from langchain.messages import SystemMessage, HumanMessage
from llm.groq import llm


def is_issue_in_file(content: str) -> isIssue:
    """
    Analyze the content of a file and determine whether it contains an issue.
    """
    llm_structured = llm.with_structured_output(isIssue)

    response = llm_structured.invoke([
        SystemMessage(
            content=(
                "You are a senior code reviewer.\n\n"
                "Task:\n"
                "Analyze the content of a single repository file and determine "
                "whether it contains an issue.\n\n"

                "What counts as an issue:\n"
                "- Bugs, errors, incorrect logic\n"
                "- Security vulnerabilities\n"
                "- Performance or scalability problems\n"
                "- TODOs, FIXMEs, or known limitations\n"
                "- Design flaws or poor practices\n"
                "- Suggestions or warnings specific to THIS file\n\n"

                "What does NOT count as an issue:\n"
                "- Pure documentation with no criticism\n"
                "- Normal comments explaining code\n"
                "- Expected boilerplate\n\n"

                "Rules:\n"
                "- Even suggestions count as issues\n"
                "- If an issue exists, briefly describe it\n"
                "- Mention the file name in `issue_description` if inferable\n"
                "- If no issue exists, clearly mark it as not an issue\n"
                "- Do not add explanations outside the structured output\n"
            )
        ),
        HumanMessage(
            content=(
                "File content:\n\n"
                f"{content}\n\n"
                "Determine whether this file contains an issue."
            )
        )
    ])

    return response
