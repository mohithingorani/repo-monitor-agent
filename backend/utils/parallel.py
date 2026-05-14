import asyncio
import logging
from typing import Any, Callable, List, TypeVar, Awaitable
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import partial

logger = logging.getLogger(__name__)
T = TypeVar("T")


class ParallelExecutor:
    def __init__(self, max_concurrency: int = 5):
        self.max_concurrency = max_concurrency
        self._semaphore: asyncio.Semaphore | None = None
        self._executor: ThreadPoolExecutor | None = None

    @property
    def semaphore(self) -> asyncio.Semaphore:
        if self._semaphore is None:
            self._semaphore = asyncio.Semaphore(self.max_concurrency)
        return self._semaphore

    @property
    def executor(self) -> ThreadPoolExecutor:
        if self._executor is None:
            self._executor = ThreadPoolExecutor(max_workers=self.max_concurrency)
        return self._executor

    async def run_async(
        self,
        func: Callable[..., Awaitable[T]],
        items: List[Any],
        *args: Any,
        **kwargs: Any,
    ) -> List[T]:
        async def wrapped(item: Any) -> T:
            async with self.semaphore:
                return await func(item, *args, **kwargs)

        tasks = [wrapped(item) for item in items]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return results

    async def run_sync_in_executor(
        self,
        func: Callable[..., T],
        items: List[Any],
        *args: Any,
        **kwargs: Any,
    ) -> List[T]:
        loop = asyncio.get_event_loop()

        async def wrapped(item: Any) -> T:
            async with self.semaphore:
                return await loop.run_in_executor(
                    self.executor, partial(func, item, *args, **kwargs)
                )

        tasks = [wrapped(item) for item in items]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return results

    async def map_async(
        self,
        func: Callable[..., Awaitable[T]],
        items: List[Any],
        *args: Any,
        **kwargs: Any,
    ) -> List[tuple[Any, T]]:
        async def wrapped(item: Any) -> tuple[Any, T]:
            async with self.semaphore:
                result = await func(item, *args, **kwargs)
                return (item, result)

        tasks = [wrapped(item) for item in items]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        output = []
        for item, result in zip(items, results):
            if isinstance(result, Exception):
                logger.error(f"Error processing {item}: {result}")
                output.append((item, None))
            else:
                output.append((item, result))
        return output

    def shutdown(self):
        if self._executor:
            self._executor.shutdown(wait=True)
            self._executor = None
        self._semaphore = None


def batch_items(items: List[T], batch_size: int) -> List[List[T]]:
    return [items[i:i + batch_size] for i in range(0, len(items), batch_size)]