import asyncio
from typing import AsyncIterator

class SSEBroker:
    def __init__(self) -> None:
        self._subscribers: list[asyncio.Queue[str]] = []
        self._lock = asyncio.Lock()

    async def publish(self, data: str) -> None:
        async with self._lock:
            for queue in list(self._subscribers):
                await queue.put(data)

    async def subscribe(self) -> AsyncIterator[str]:
        queue: asyncio.Queue[str] = asyncio.Queue()
        async with self._lock:
            self._subscribers.append(queue)
        try:
            while True:
                data = await queue.get()
                yield data
        finally:
            async with self._lock:
                if queue in self._subscribers:
                    self._subscribers.remove(queue)

broker = SSEBroker()
