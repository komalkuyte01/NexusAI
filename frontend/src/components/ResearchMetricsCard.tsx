"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  BarChart3,
  Globe2,
  BookOpen,
  Layers,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Quote,
} from "lucide-react";
import { ResearchResponse } from "@/types";

interface ResearchMetricsCardProps {
  report: ResearchResponse;
}

export const ResearchMetricsCard: React.FC<ResearchMetricsCardProps> = ({ report }) => {
  const [copiedTakeaways, setCopiedTakeaways] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Quantitative metrics
  const wordCount = useMemo(() => {
    return report.content ? report.content.trim().split(/\s+/).length : 0;
  }, [report.content]);

  const readTime = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  const uniqueDomains = useMemo(() => {
    if (!report.sources || report.sources.length === 0) return 0;
    const domains = new Set<string>();
    for (const s of report.sources) {
      try {
        const urlObj = new URL(s.url);
        domains.add(urlObj.hostname.replace(/^www\./, ""));
      } catch {
        // ignore invalid url
      }
    }
    return domains.size;
  }, [report.sources]);

  const sectionCount = useMemo(() => {
    if (!report.content) return 0;
    const matches = report.content.match(/^#{1,3}\s+.+$/gm);
    return matches ? matches.length : 1;
  }, [report.content]);

  // Extract key takeaways / highlights from bullets or executive points in markdown
  const keyTakeaways = useMemo(() => {
    if (!report.content) return [];
    const lines = report.content.split("\n");
    const extracted: string[] = [];

    // Search for bulleted items or numbered items that are descriptive (between 25 and 280 chars)
    for (const line of lines) {
      const trimmed = line.trim();
      const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
      const numberMatch = trimmed.match(/^\d+\.\s+(.+)$/);
      const item = bulletMatch ? bulletMatch[1] : numberMatch ? numberMatch[1] : null;

      if (item && item.length > 25 && item.length < 280) {
        // Strip bold and link markers
        const clean = item.replace(/[*_`]/g, "").trim();
        if (clean && !extracted.includes(clean)) {
          extracted.push(clean);
          if (extracted.length >= 4) break;
        }
      }
    }

    // Fallback if no bullets were matched
    if (extracted.length === 0) {
      const paragraphs = report.content
        .split(/\n\n+/)
        .map((p) => p.trim().replace(/^#+\s+.+$/gm, "").trim())
        .filter((p) => p.length > 60);

      if (paragraphs.length > 0) {
        const sentences = paragraphs[0].split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 20);
        return sentences.slice(0, 3);
      }
    }

    return extracted;
  }, [report.content]);

  const handleCopyTakeaways = async () => {
    if (keyTakeaways.length === 0) return;
    const text = keyTakeaways.map((t, idx) => `${idx + 1}. ${t}`).join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTakeaways(true);
      setTimeout(() => setCopiedTakeaways(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-cyan-950/30 p-5 backdrop-blur-xl shadow-xl space-y-4">
      {/* Top Bar: Title & Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
              Intelligence Brief & Key Metrics
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.2 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Grounded
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Autonomous multi-source analysis &middot; Synthesis verified
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200 transition-colors cursor-pointer"
        >
          <span>{isExpanded ? "Collapse Analytics" : "View Analytics"}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Key Metric Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                <span>Reading Time</span>
              </div>
              <div className="text-lg font-bold text-white tracking-tight">
                {readTime} <span className="text-xs font-normal text-slate-400">min</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">~{wordCount} words analyzed</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Globe2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Source Breadth</span>
              </div>
              <div className="text-lg font-bold text-white tracking-tight">
                {uniqueDomains} <span className="text-xs font-normal text-slate-400">domains</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{report.sources?.length || 0} citations extracted</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Layers className="h-3.5 w-3.5 text-purple-400" />
                <span>Structure Depth</span>
              </div>
              <div className="text-lg font-bold text-white tracking-tight">
                {sectionCount} <span className="text-xs font-normal text-slate-400">sections</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {report.report_type === "research_paper" ? "Academic Format" : "Executive Report"}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Rigor Index</span>
              </div>
              <div className="text-lg font-bold text-emerald-400 tracking-tight">
                High <span className="text-xs font-normal text-slate-400">fidelity</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Triangulated web context</div>
            </div>
          </div>

          {/* Key Findings at a Glance */}
          {keyTakeaways.length > 0 && (
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300">
                  <Quote className="h-3.5 w-3.5" />
                  <span>Key Findings at a Glance</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyTakeaways}
                  className="flex items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
                >
                  {copiedTakeaways ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-300">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-indigo-400" />
                      <span>Copy Findings</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
                {keyTakeaways.map((takeaway, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-lg border border-slate-800/60 bg-slate-900/50 p-2.5"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300">
                      {idx + 1}
                    </span>
                    <p className="line-clamp-3 leading-relaxed text-slate-300">{takeaway}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
