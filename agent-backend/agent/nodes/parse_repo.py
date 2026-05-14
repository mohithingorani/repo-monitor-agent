import re
from models.state import MessageState


def parse_repo(state: MessageState | dict) -> MessageState:
    if hasattr(state, "messages"):
        content = state.messages[0].content
    else:
        content = state.get("messages", [{}])[0].content if state.get("messages") else str(state)

    match = re.search(r"https?://github\.com/[^\s]+", content)
    if not match:
        raise ValueError("No GitHub URL found in input")

    url = match.group(0).rstrip("/")
    clean = re.sub(r"^https?://github\.com/", "", url)
    parts = clean.split("/")

    return MessageState(
        owner=parts[0] if len(parts) > 0 else "",
        repo=parts[1] if len(parts) > 1 else "",
        llm_calls=0,
        files=[],
        messages=[],
        path="",
        curr_index=0,
    )