"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Loader2, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
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
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [targetLength, setTargetLength] = useState<"standard" | "in_depth" | "comprehensive" | "custom">("standard");
  const [customWordCount, setCustomWordCount] = useState("");
  const [customOutline, setCustomOutline] = useState("");
  const [customConstraints, setCustomConstraints] = useState("");
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

  const isCustomized = targetLength !== "standard" || Boolean(customOutline.trim()) || Boolean(customConstraints.trim());

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim() || isLoading) return;

    const reqs: string[] = [];
    if (targetLength === "in_depth") {
      reqs.push("TARGET LENGTH: Approximately 3,000 words. Provide deep empirical analysis and multi-paragraph sections.");
    } else if (targetLength === "comprehensive") {
      reqs.push("TARGET LENGTH: Approximately 5,000 words. Provide deep, comprehensive empirical analysis, thorough multi-paragraph sections (###), comparative tables, and extensive coverage.");
    } else if (targetLength === "custom" && customWordCount.trim()) {
      reqs.push(`TARGET LENGTH: Approximately ${customWordCount.trim()} words. Provide thorough elaboration to match this target length.`);
    }

    if (customConstraints.trim()) {
      reqs.push(customConstraints.trim());
    }

    onSubmit({
      topic: topic.trim(),
      report_type: reportType,
      requirements: reqs.length > 0 ? reqs.join("\n\n") : undefined,
      custom_format: customOutline.trim() || undefined,
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

        {/* Expandable Customization Settings */}
        {isCustomizeOpen && (
          <div className="border-t border-white/[0.08] bg-black/40 px-5 py-4 space-y-4 text-xs font-sans">
            {/* Target Word Count / Depth */}
            <div className="space-y-1.5">
              <label className="font-medium text-neutral-300">Target Length &amp; Depth</label>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "standard", label: "Standard (~1.5k words)" },
                  { id: "in_depth", label: "In-Depth (~3k words)" },
                  { id: "comprehensive", label: "Comprehensive (~5k words)" },
                  { id: "custom", label: "Custom" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTargetLength(item.id as typeof targetLength)}
                    className={`rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
                      targetLength === item.id
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "bg-white/[0.06] text-neutral-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {targetLength === "custom" && (
                <div className="pt-1.5 flex items-center gap-2">
                  <input
                    type="number"
                    value={customWordCount}
                    onChange={(e) => setCustomWordCount(e.target.value)}
                    placeholder="e.g. 5000"
                    min="500"
                    max="10000"
                    step="500"
                    className="w-32 rounded-lg border border-white/15 bg-neutral-900 px-2.5 py-1 text-neutral-100 placeholder-neutral-500 outline-none focus:border-white/40"
                  />
                  <span className="text-neutral-400">words target</span>
                </div>
              )}
            </div>

            {/* Custom Outline / Sections */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-medium text-neutral-300">Custom Section Outline (Optional)</label>
                <span className="text-[11px] text-neutral-500">Overrides default sections</span>
              </div>
              <textarea
                value={customOutline}
                onChange={(e) => setCustomOutline(e.target.value)}
                placeholder={"# Executive Summary\n# Core Architecture\n# Comparative Evaluation Matrix\n# Regulatory Compliance & Risks\n# Strategic Recommendations"}
                rows={3}
                className="w-full resize-none rounded-lg border border-white/15 bg-neutral-900/90 px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 outline-none focus:border-white/40 font-mono leading-relaxed"
              />
            </div>

            {/* Focus Constraints */}
            <div className="space-y-1.5">
              <label className="font-medium text-neutral-300">Specific Requirements &amp; Focus (Optional)</label>
              <input
                type="text"
                value={customConstraints}
                onChange={(e) => setCustomConstraints(e.target.value)}
                placeholder="e.g. Focus on US banking compliance, fraud detection architectures, and real-world ROI"
                className="w-full rounded-lg border border-white/15 bg-neutral-900/90 px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 outline-none focus:border-white/40"
              />
            </div>
          </div>
        )}

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-2.5 bg-white/[0.01]">
          {/* Format Selector & Customize Button */}
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

            <button
              type="button"
              onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
              disabled={isLoading}
              title="Customize length, structure, and formatting"
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                isCustomizeOpen || isCustomized
                  ? "bg-white/15 text-white font-semibold"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.05]"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Customize</span>
              {isCustomized && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
              {isCustomizeOpen ? (
                <ChevronUp className="h-3 w-3 text-neutral-400" />
              ) : (
                <ChevronDown className="h-3 w-3 text-neutral-400" />
              )}
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

