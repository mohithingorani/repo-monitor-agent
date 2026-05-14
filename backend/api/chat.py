import json
import uuid
import logging
from fastapi import APIRouter, HTTPException
from starlette.responses import StreamingResponse
from api.schemas.chat import PromptRequest, StreamPromptRequest
from main import invoke_agent, get_agent_state

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/")
def chat(request: PromptRequest):
    thread_id = str(uuid.uuid4())
    try:
        response = invoke_agent(request.prompt, thread_id=thread_id)
        return {"response": response, "thread_id": thread_id}
    except ValueError as e:
        logger.warning(f"Invalid Input: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Agent Failed")
        raise HTTPException(status_code=500, detail="Agent execution failed")


@router.post("/stream")
async def chat_stream(request: StreamPromptRequest):
    from main import stream_agent
    from fastapi.responses import JSONResponse

    thread_id = request.thread_id or str(uuid.uuid4())
    try:

        def to_jsonable(value):
            if hasattr(value, "model_dump"):
                return to_jsonable(value.model_dump())
            if hasattr(value, "content") and hasattr(value, "type"):
                return {"type": value.type, "content": value.content}
            if isinstance(value, dict):
                return {k: to_jsonable(v) for k, v in value.items()}
            if isinstance(value, (list, tuple)):
                return [to_jsonable(v) for v in value]
            if isinstance(value, (str, int, float, bool)) or value is None:
                return value
            if hasattr(value, "__dict__"):
                return {k: to_jsonable(v) for k, v in value.__dict__.items() if not k.startswith("_")}
            return str(value)

        async def generate():
            try:
                async for chunk in stream_agent(request.prompt, thread_id=thread_id):
                    if isinstance(chunk, dict):
                        data = {k: to_jsonable(v) for k, v in chunk.items()}
                    else:
                        data = to_jsonable(chunk)
                    yield json.dumps(data, ensure_ascii=False) + "\n"
            except Exception as e:
                yield json.dumps({"error": str(e)}) + "\n"

        return StreamingResponse(
            generate(),
            media_type="application/x-ndjson",
            headers={"X-Thread-ID": thread_id},
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Agent streaming failed")
        raise HTTPException(status_code=500, detail="Agent execution failed")


@router.get("/state/{thread_id}")
async def get_state(thread_id: str):
    try:
        state = await get_agent_state(thread_id)
        return {"thread_id": thread_id, "state": state}
    except Exception as e:
        logger.error(f"Failed to get state for {thread_id}: {e}")
        raise HTTPException(status_code=404, detail="Thread not found")


@router.get("/health")
def health():
    return {"status": "ok"}
