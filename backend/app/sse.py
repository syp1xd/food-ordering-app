from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
import asyncio
import json
from typing import List
from .database import get_db
from . import crud

sse_router = APIRouter()

subscribers: List[asyncio.Queue] = []

async def notify_subscribers(order_id: int, status: str):
    message = json.dumps({"order_id": order_id, "status": status})
    print(f"[SSE] Notifying {len(subscribers)} subscribers about order {order_id} status: {status}")
    for queue in subscribers:
        await queue.put(message)

@sse_router.get("/orders/{order_id}")
async def stream_order_status(request: Request, order_id: int):
    print(f"[SSE] New subscriber for order {order_id}")

    async def event_generator():
        queue = asyncio.Queue()
        subscribers.append(queue)
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    message = await asyncio.wait_for(queue.get(), timeout=30)
                    data = json.loads(message)
                    if data["order_id"] == order_id:
                        print(f"[SSE] Sending message to client {order_id}: {message}")
                        yield f"data: {message}\n\n"
                except asyncio.TimeoutError:
                    yield ": keep-alive\n\n"
        finally:
            if queue in subscribers:
                subscribers.remove(queue)
            print(f"[SSE] Subscriber disconnected for order {order_id}")

    return StreamingResponse(event_generator(), media_type="text/event-stream")