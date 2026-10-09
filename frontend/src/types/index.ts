export interface SourceItem {
  title: string;
  url: string;
  snippet: string;
  domain?: string;
  published_date?: string;
  quality_score?: number;
  quality_tier?: string;
  is_verified?: boolean;
}

export type ReportType = "report" | "research_paper";

export interface ResearchRequest {
  topic: string;
  report_type: ReportType;
  requirements?: string;
  custom_format?: string;
  gemini_api_key?: string;
}

export interface ClaimItem {
  claim: string;
  evidence: string;
  source_url?: string;
  verification_status: "Verified" | "Partially Verified" | "Conflicting Evidence" | "Unverified";
  explanation?: string;
}

export interface QualityMetrics {
  claim_support_rate: number;
  citation_precision: number;
  citation_coverage: number;
  source_verification_rate: number;
  total_claims_evaluated: number;
  total_sources_evaluated: number;
  summary_notes?: string;
}

export interface ResearchResponse {
  topic: string;
  report_type: string;
  sources: SourceItem[];
  content: string;
  created_at: string;
  claims?: ClaimItem[];
  metrics?: QualityMetrics;
}

export interface SavedReport extends ResearchResponse {
  id: string;
  savedAt: string;
}
