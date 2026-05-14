from pydantic import BaseModel, Field
from typing_extensions import List, Literal, Optional

class BatchIssue(BaseModel):
    file: str
    severity: Literal["Critical", "High", "Medium", "Low"]
    issue_description: str

class BatchAnalysisResult(BaseModel):
    file: str
    is_issue: bool
    issue_description: Optional[str] = None
    severity: Literal["Critical", "High", "Medium", "Low"] | None = None

class BatchAnalysisOutput(BaseModel):
    results: List[BatchAnalysisResult] = Field(
        description="Analysis results for all files in the batch. Empty results means no issues found in that specific file."
    )
    files_processed: int = Field(description="Number of files analyzed in this batch")
    issues_found: int = Field(description="Number of files that contain issues")