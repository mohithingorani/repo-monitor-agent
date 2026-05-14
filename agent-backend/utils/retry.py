import asyncio
import logging
from functools import wraps
from typing import Any, Callable, TypeVar, Optional
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential_jitter,
    retry_if_exception_type,
)

logger = logging.getLogger(__name__)

T = TypeVar("T")

GITHUB_MAX_RETRIES = 4
GITHUB_INITIAL_WAIT = 2
GITHUB_MAX_WAIT = 60

LLM_MAX_RETRIES = 3
LLM_INITIAL_WAIT = 4
LLM_MAX_WAIT = 30

GITHUB_EXCEPTIONS = (
    ConnectionError,
    TimeoutError,
)

def create_github_retry_decorator(max_attempts: int = GITHUB_MAX_RETRIES):
    return retry(
        stop=stop_after_attempt(max_attempts),
        wait=wait_exponential_jitter(initial=GITHUB_INITIAL_WAIT, max=GITHUB_MAX_WAIT),
        retry=retry_if_exception_type(GITHUB_EXCEPTIONS),
        reraise=True,
        before_sleep=lambda retry_state: logger.warning(
            f"GitHub API retry {retry_state.attempt_number}/{max_attempts}: {retry_state.outcome.exception()}"
        ),
    )

def create_llm_retry_decorator(max_attempts: int = LLM_MAX_RETRIES):
    return retry(
        stop=stop_after_attempt(max_attempts),
        wait=wait_exponential_jitter(initial=LLM_INITIAL_WAIT, max=LLM_MAX_WAIT),
        retry=retry_if_exception_type((ConnectionError, TimeoutError, OSError)),
        reraise=True,
        before_sleep=lambda retry_state: logger.warning(
            f"LLM retry {retry_state.attempt_number}/{max_attempts}: {retry_state.outcome.exception()}"
        ),
    )

def with_github_retry(func: Callable[..., T]) -> Callable[..., T]:
    decorator = create_github_retry_decorator()
    return decorator(func)

def with_llm_retry(func: Callable[..., T]) -> Callable[..., T]:
    decorator = create_llm_retry_decorator()
    return decorator(func)

async def retry_async(
    coro: Callable[..., Any],
    max_attempts: int = LLM_MAX_RETRIES,
    initial_wait: float = LLM_INITIAL_WAIT,
    max_wait: float = LLM_MAX_WAIT,
    exceptions: tuple = (ConnectionError, TimeoutError, OSError),
) -> Any:
    last_exception = None
    for attempt in range(1, max_attempts + 1):
        try:
            return await coro()
        except exceptions as e:
            last_exception = e
            if attempt == max_attempts:
                raise
            wait_time = min(initial_wait * (2 ** (attempt - 1)) + asyncio.uniform(0, 1), max_wait)
            logger.warning(f"Async retry {attempt}/{max_attempts}: {e}. Waiting {wait_time:.1f}s")
            await asyncio.sleep(wait_time)
    raise last_exception