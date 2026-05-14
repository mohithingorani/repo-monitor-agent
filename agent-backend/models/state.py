from pydantic import BaseModel, Field
from typing_extensions import Annotated, List, Literal
from operator import add
from langchain.messages import AnyMessage


class ObservationState(BaseModel):
    file: str
    severity: str
    issue: str


class RepoMetaData(BaseModel):
    tech_stack: List[str] = Field(description="Tech stacks used")
    license: str | None
    project_maturity: Literal["Prototype", "Early / MVP", "Production-ready", "Mature"]


class FileAnalysisRecord(BaseModel):
    file: str
    content: str = ""
    is_issue: bool = False
    issue_description: str | None = None
    severity: Literal["Critical", "High", "Medium", "Low"] | None = None
    skipped: bool = False
    skip_reason: str | None = None


class MessageState(BaseModel):
    messages: Annotated[list[AnyMessage], add]
    observations: Annotated[list[ObservationState], add] = []
    llm_calls: int = 0
    files: list[str] = []
    owner: str = ""
    repo: str | None = None
    path: str = ""
    curr_index: int = 0
    curr_observation: str = ""
    issue_called: int = 0
    final_observations: str | None = None
    repo_metadata: RepoMetaData | None = None
    file_contents: dict[str, str] = Field(default_factory=dict, description="file_path -> content")
    batch_index: int = 0
    total_batches: int = 0
    skipped_files: list[str] = Field(default_factory=list, description="Files skipped due to binary/size")
    errors: list[str] = Field(default_factory=list, description="Non-fatal errors encountered")