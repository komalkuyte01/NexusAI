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
        description="Custom section structure"
    )
    gemini_api_key: Optional[str] = Field(
        default=None,
        description="Optional Gemini API key passed from frontend settings"
    )

class SourceItem(BaseModel):
    title: str
    url: str
    snippet: str
    domain: Optional[str] = None
    published_date: Optional[str] = None
    quality_score: Optional[float] = 1.0
    quality_tier: Optional[str] = "General Web"
    is_verified: bool = True

class ClaimItem(BaseModel):
    claim: str
    evidence: str
    source_url: Optional[str] = None
    verification_status: Literal["Verified", "Partially Verified", "Conflicting Evidence", "Unverified"] = "Unverified"
    explanation: Optional[str] = None

class QualityMetrics(BaseModel):
    claim_support_rate: float = Field(default=0.0, description="Claim Support Rate (%)")
    citation_precision: float = Field(default=0.0, description="Citation Precision (%)")
    citation_coverage: float = Field(default=0.0, description="Citation Coverage (%)")
    source_verification_rate: float = Field(default=0.0, description="Source Verification Rate (%)")
    total_claims_evaluated: int = 0
    total_sources_evaluated: int = 0
    summary_notes: Optional[str] = None

class ResearchResponse(BaseModel):
    topic: str
    report_type: str
    sources: List[SourceItem]
    content: str
    created_at: str
    claims: Optional[List[ClaimItem]] = None
    metrics: Optional[QualityMetrics] = None
