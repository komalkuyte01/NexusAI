export interface SourceItem {
  title: string;
  url: string;
  snippet: string;
}

export type ReportType = "report" | "research_paper";

export interface ResearchRequest {
  topic: string;
  report_type: ReportType;
  requirements?: string;
  custom_format?: string;
  gemini_api_key?: string;
}

export interface ResearchResponse {
  topic: string;
  report_type: string;
  sources: SourceItem[];
  content: string;
  created_at: string;
}

export interface SavedReport extends ResearchResponse {
  id: string;
  savedAt: string;
}
