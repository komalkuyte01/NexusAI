"use client";

import React, { useState } from "react";
import { Sparkles, RotateCcw } from "lucide-react";
import { ResearchRequest } from "@/types";

interface ResearchFormProps {
  onSubmit: (request: ResearchRequest) => void;
  isLoading: boolean;
}

export const ResearchForm: React.FC<ResearchFormProps> = ({ onSubmit, isLoading }) => {
  const [topic, setTopic] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;

    onSubmit({
      topic: topic.trim(),
      report_type: "report",
    });
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
            <span>{isLoading ? "Researching..." : "Start Research"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
