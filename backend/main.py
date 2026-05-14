import asyncio
import logging
from langchain_core.messages import HumanMessage
from langchain_core.runnables import RunnableConfig
from agent.graph import graph

logger = logging.getLogger(__name__)

DEFAULT_THREAD_ID = "default"


def invoke_agent(prompt: str, thread_id: str = DEFAULT_THREAD_ID) -> str:
    if not prompt.strip():
        raise ValueError("Prompt cannot be empty")

    config = RunnableConfig(
        configurable={"thread_id": thread_id}
    )

    response = graph.invoke(
        {"messages": [HumanMessage(content=prompt)]},
        config=config,
    )

    final_content = response.get("messages", [])[-1].content
    return final_content


async def stream_agent(prompt: str, thread_id: str = DEFAULT_THREAD_ID):
    if not prompt.strip():
        raise ValueError("Prompt cannot be empty")

    config = RunnableConfig(
        configurable={"thread_id": thread_id}
    )

    async for chunk in graph.astream(
        {"messages": [HumanMessage(content=prompt)]},
        config=config,
    ):
        yield chunk


async def get_agent_state(thread_id: str = DEFAULT_THREAD_ID):
    config = RunnableConfig(configurable={"thread_id": thread_id})
    return graph.get_state(config)


async def list_conversation_history(thread_id: str = DEFAULT_THREAD_ID):
    config = RunnableConfig(configurable={"thread_id": thread_id})
    return list(graph.get_state_history(config))


if __name__ == "__main__":
    result = invoke_agent("https://github.com/mohithingorani/BAJAJ-BROKING-SDK")
    print("\n\n Final Response:")
    print(result)