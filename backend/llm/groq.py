import os
from functools import lru_cache
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from utils.retry import create_llm_retry_decorator

load_dotenv()


def _create_llm() -> ChatGroq:
    return ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0,
        api_key=os.getenv("GROQ_API_KEY"),
        max_retries=LLM_MAX_RETRIES,
    )


LLM_MAX_RETRIES = 3
llm = _create_llm()


def create_retry_llm(max_retries: int = LLM_MAX_RETRIES) -> ChatGroq:
    return ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0,
        api_key=os.getenv("GROQ_API_KEY"),
        max_retries=max_retries,
    )