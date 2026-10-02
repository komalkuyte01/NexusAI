from typing import Optional, List, Literal
from pydantic import BaseModel, Field

class ResearchRequest(BaseModel):
    topic: str = Field(
        ...,
        description="The subject or question to research",
        min_length=3,
        examples=["The impact of AI on the job market in 2026"]
    )
    report_type: Literal["research_paper", "report"] = Field(
        default="report",
        description="Format style: 'research_paper' (academic) or 'report' (executive/business)"
    )
    requirements: Optional[str] = Field(
        default=None,
        description="Specific constraints, focus areas, or tone instructions"
    )
    custom_format: Optional[str] = Field(
        default=None,
        description="Custom section structure, e.g. 'Introduction, Literature Review, Methodology, Results, Conclusion'"
    )
    gemini_api_key: Optional[str] = Field(
        default=None,
        description="Optional Gemini API key passed from frontend settings"
    )

class SourceItem(BaseModel):
    title: str
    url: str
    snippet: str

class ResearchResponse(BaseModel):
    topic: str
    report_type: str
    sources: List[SourceItem]
    content: str
    created_at: str
