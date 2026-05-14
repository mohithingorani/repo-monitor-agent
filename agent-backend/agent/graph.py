from agent.nodes.parse_repo import parse_repo
from agent.nodes.get_repo_files import get_repo_files
from agent.nodes.important_files import get_important_files
from agent.nodes.git_metadata import get_metadata
from agent.nodes.get_contents import analyze_all_files
from agent.nodes.summarize import summarization_node
from models.state import MessageState
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver


agent_builder = StateGraph(state_schema=MessageState)
agent_builder.add_node("parse_repo", parse_repo)
agent_builder.add_node("get-all-files", get_repo_files)
agent_builder.add_node("important_files", get_important_files)
agent_builder.add_node("get_metadata", get_metadata)
agent_builder.add_node("analyze", analyze_all_files)
agent_builder.add_node("summarizer", summarization_node)

agent_builder.add_edge(START, "parse_repo")
agent_builder.add_edge("parse_repo", "get-all-files")
agent_builder.add_edge("get-all-files", "important_files")
agent_builder.add_edge("important_files", "get_metadata")
agent_builder.add_edge("get_metadata", "analyze")
agent_builder.add_edge("analyze", "summarizer")
agent_builder.add_edge("summarizer", END)

checkpointer = InMemorySaver()
graph = agent_builder.compile(checkpointer=checkpointer)

