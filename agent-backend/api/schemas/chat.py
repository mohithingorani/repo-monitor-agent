from pydantic import BaseModel, Field
from typing import Optional


class PromptRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=2000, description="The prompt to send to the agent")
    thread_id: Optional[str] = Field(None, description="Optional thread ID for conversation continuity")


class StreamPromptRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=2000, description="The prompt to send to the agent")
    thread_id: Optional[str] = Field(None, description="Optional thread ID for conversation continuity")