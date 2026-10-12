"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, SlidersHorizontal, Loader2, FileText, GraduationCap } from "lucide-react";
import { ReportType, ResearchRequest } from "@/types";

interface ResearchFormProps {
  onSubmit: (request: ResearchRequest) => void;
  isLoading: boolean;
}

export const ResearchForm: React.FC<ResearchFormProps> = ({ onSubmit, isLoading }) => {
  const [topic, setTopic] = useState("");
  const [reportType, setReportType] = useState<ReportType>("report");
  const [requirements, setRequirements] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height like ChatGPT
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [topic]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim() || isLoading) return;

    onSubmit({
      topic: topic.trim(),
      report_type: reportType,
      requirements: requirements.trim() ? requirements.trim() : undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasContent = topic.trim().length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl backdrop-blur-xl transition-all focus-within:border-neutral-500 focus-within:ring-1 focus-within:ring-neutral-500"
      >
        {/* Main Text Area */}
        <div className="px-4 pt-3.5 pb-2">
          <textarea
            ref={textareaRef}
            id="research-topic-input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything to research or generate an in-depth report..."
            rows={2}
            disabled={isLoading}
            className="w-full resize-none bg-transparent text-sm sm:text-base text-white placeholder-neutral-500 outline-none leading-relaxed"
          />
        </div>

        {/* Optional Constraints Expandable Row */}
        {showOptions && (
          <div className="border-t border-neutral-800 px-4 py-2.5 bg-neutral-900/60">
            <input
              type="text"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Optional focus parameters (e.g. key competitors, technical benchmarks, 2026 data)..."
              disabled={isLoading}
              className="w-full bg-transparent text-xs text-white placeholder-neutral-500 outline-none"
            />
          </div>
        )}

        {/* Bottom Toolbar: Format Pills, Options Toggle & Send Button */}
        <div className="flex items-center justify-between border-t border-neutral-800 px-3.5 py-2.5 bg-neutral-900/40 rounded-b-2xl">
          {/* Format Selector Pills */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setReportType("report")}
              disabled={isLoading}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                reportType === "report"
                  ? "bg-white text-black shadow-sm font-semibold"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Report</span>
            </button>

            <button
              type="button"
              onClick={() => setReportType("research_paper")}
              disabled={isLoading}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                reportType === "research_paper"
                  ? "bg-white text-black shadow-sm font-semibold"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Academic Paper</span>
            </button>

            {/* Constraints Button */}
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              title="Add specific constraints or focus areas"
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors cursor-pointer ${
                showOptions || requirements.trim()
                  ? "bg-neutral-800 text-white border border-neutral-700 font-medium"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Options</span>
            </button>
          </div>

          {/* Minimalist Send Button */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isLoading || !hasContent}
              title={isLoading ? "Synthesizing..." : "Submit Research"}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all cursor-pointer ${
                hasContent && !isLoading
                  ? "bg-white text-black hover:bg-neutral-200 shadow-md scale-100"
                  : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
              ) : (
                <ArrowUp className="h-4 w-4 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </form>

      <p className="mt-2 text-center text-[11px] text-neutral-500">
        Press <kbd className="rounded border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-[10px] text-neutral-400 font-mono">Enter</kbd> to research &middot; <kbd className="rounded border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-[10px] text-neutral-400 font-mono">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
};
