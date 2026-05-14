from pydantic import BaseModel, Field
from typing_extensions import List, Literal, Optional

class BatchAnalysisResult(BaseModel):
    file: str
    is_issue: bool
    issue_description: Optional[str] = None
    severity: Literal["Critical", "High", "Medium", "Low"] | None = None

class BatchAnalysisOutput(BaseModel):
    results: List[BatchAnalysisResult] = Field(description="Analysis results for all files in the batch")
    batch_index: int = Field(description="Index of this batch (0-based)")
    total_batches: int = Field(description="Total number of batches")

class StreamEvent(BaseModel):
    event_type: Literal["progress", "file_complete", "batch_complete", "error", "final"] = Field(
        description="Type of streaming event"
    )
    data: dict = Field(description="Event payload data")
    timestamp: Optional[float] = None