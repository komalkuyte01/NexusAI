"use client";

import React, { useState } from "react";
import { Sparkles, RotateCcw, FileSpreadsheet, GraduationCap, Zap } from "lucide-react";
import { ReportType, ResearchRequest } from "@/types";

interface ResearchFormProps {
  onSubmit: (request: ResearchRequest) => void;
  isLoading: boolean;
  initialTopic?: string;
}

const PRESET_TOPICS = [
  {
    title: "Quantum Computing & Post-Quantum Cryptography",
    type: "research_paper" as ReportType,
  },
  {
    title: "Autonomous AI Agents in Enterprise Software 2026",
    type: "report" as ReportType,
  },
  {
    title: "Solid-State EV Batteries Commercialization Landscape",
    type: "report" as ReportType,
  },
  {
    title: "CRISPR-Cas9 Therapeutics in Human Clinical Trials",
    type: "research_paper" as ReportType,
  },
];

export const ResearchForm: React.FC<ResearchFormProps> = ({ onSubmit, isLoading }) => {
  const [topic, setTopic] = useState("");
  const [reportType, setReportType] = useState<ReportType>("report");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;

    onSubmit({
      topic: topic.trim(),
      report_type: reportType,
    });
  };

  const handleApplyPreset = (preset: (typeof PRESET_TOPICS)[0]) => {
    setTopic(preset.title);
    setReportType(preset.type);
  };

  return (
    <div className="relative rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 via-slate-950/80 to-slate-950 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
      <div className="pointer-events-none absolute -top-12 left-1/2 -z-10 h-32 w-96 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="topic-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 pb-2">
            Research Objective / Topic
          </label>

          <div className="relative rounded-xl border border-slate-700/80 bg-slate-900/60 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
            <textarea
              id="topic-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. The impact of Generative AI and Multimodal Agents on Healthcare Diagnostics in 2026..."
              rows={3}
              className="w-full resize-none rounded-xl bg-transparent px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none sm:text-base"
              disabled={isLoading}
            />
            {topic && (
              <div className="flex justify-end px-3 pb-2">
                <button
                  type="button"
                  onClick={() => setTopic("")}
                  className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Preset Topic Badges */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Zap className="h-3 w-3 text-amber-400" />
            <span>Trending Research Sparks:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_TOPICS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                disabled={isLoading}
                className="rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-1 text-xs text-slate-300 transition-all hover:border-indigo-500/50 hover:bg-slate-850 hover:text-indigo-200 disabled:opacity-50 cursor-pointer"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        {/* Format Selector Tabs */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Synthesis Format Style
          </label>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {/* Executive Report */}
            <button
              type="button"
              onClick={() => setReportType("report")}
              disabled={isLoading}
              className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                reportType === "report"
                  ? "border-indigo-500/80 bg-indigo-500/10 text-white shadow-lg shadow-indigo-500/10"
                  : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <div
                className={`mt-0.5 rounded-lg p-2 ${
                  reportType === "report"
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-100">
                  Executive Business Report
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Executive summary, key market insights, strategic recommendations & citations.
                </div>
              </div>
            </button>

            {/* Academic Research Paper */}
            <button
              type="button"
              onClick={() => setReportType("research_paper")}
              disabled={isLoading}
              className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                reportType === "research_paper"
                  ? "border-indigo-500/80 bg-indigo-500/10 text-white shadow-lg shadow-indigo-500/10"
                  : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <div
                className={`mt-0.5 rounded-lg p-2 ${
                  reportType === "research_paper"
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-100">
                  Academic Research Paper
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Abstract, introduction, in-depth technical analysis, conclusions & references.
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setTopic("")}
            disabled={isLoading || !topic}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 px-4 py-2.5 text-xs font-medium text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-200 disabled:opacity-40 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01] hover:shadow-indigo-500/40 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isLoading ? "Synthesizing..." : "Start Research"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
