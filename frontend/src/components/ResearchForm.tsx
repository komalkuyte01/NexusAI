"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { ReportType, ResearchRequest } from "@/types";

interface ResearchFormProps {
  onSubmit: (request: ResearchRequest) => void;
  isLoading: boolean;
  initialTopic?: string;
}

export const ResearchForm: React.FC<ResearchFormProps> = ({
  onSubmit,
  isLoading,
  initialTopic = "",
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [reportType, setReportType] = useState<ReportType>("report");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }, [initialTopic]);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  }, [topic]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim() || isLoading) return;

    onSubmit({
      topic: topic.trim(),
      report_type: reportType,
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
    <div className="w-full max-w-2xl mx-auto">
      {/* Minimal Prompt Box */}
      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl border border-white/[0.12] bg-[#12141a] transition-all duration-200 focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/25 shadow-lg"
      >
        {/* Text Area Input with large readable font */}
        <div className="px-5 pt-4 pb-3">
          <textarea
            ref={textareaRef}
            id="research-topic-input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question or enter a research topic..."
            rows={2}
            disabled={isLoading}
            className="w-full resize-none bg-transparent text-base sm:text-lg font-sans text-neutral-100 placeholder-neutral-400 outline-none leading-relaxed"
          />
        </div>

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-2.5 bg-white/[0.01]">
          {/* Format Selector */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setReportType("report")}
              disabled={isLoading}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                reportType === "report"
                  ? "bg-white/15 text-white font-semibold"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.05]"
              }`}
            >
              Report
            </button>

            <button
              type="button"
              onClick={() => setReportType("research_paper")}
              disabled={isLoading}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                reportType === "research_paper"
                  ? "bg-white/15 text-white font-semibold"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.05]"
              }`}
            >
              Research Paper
            </button>
          </div>

          {/* Action Trigger Button */}
          <button
            type="submit"
            disabled={isLoading || !hasContent}
            title={isLoading ? "Researching..." : "Execute"}
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all cursor-pointer ${
              hasContent && !isLoading
                ? "bg-white text-black hover:bg-neutral-200 shadow-sm"
                : "bg-white/5 text-neutral-500 cursor-not-allowed opacity-50"
            }`}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
            ) : (
              <ArrowUp className="h-4 w-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

