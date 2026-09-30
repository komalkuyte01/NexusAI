"use client";

import React, { useState } from "react";
import { ExternalLink, Globe, ChevronDown, ChevronUp, Link as LinkIcon } from "lucide-react";
import { SourceItem } from "@/types";

interface SourcesCardProps {
  sources: SourceItem[];
}

export const SourcesCard: React.FC<SourcesCardProps> = ({ sources }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!sources || sources.length === 0) {
    return null;
  }

  const getDomain = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return "external link";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Verified Web Sources
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-indigo-300">
                {sources.length} citations
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Live grounding data retrieved by autonomous search
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-slate-900"
        >
          <span>{isExpanded ? "Collapse" : "Show All"}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((source, idx) => {
            const domain = getDomain(source.url);
            return (
              <a
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 transition-all hover:border-indigo-500/50 hover:bg-slate-900/80 hover:shadow-md cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-indigo-300 mb-1.5 font-mono">
                    <span className="flex items-center gap-1 truncate max-w-[180px]">
                      <LinkIcon className="h-3 w-3 shrink-0 text-slate-500 group-hover:text-indigo-400" />
                      {domain}
                    </span>
                    <ExternalLink className="h-3 w-3 shrink-0 text-slate-500 group-hover:text-indigo-400" />
                  </div>
                  <h4 className="text-xs font-medium text-slate-200 line-clamp-2 group-hover:text-white leading-snug">
                    {source.title || domain}
                  </h4>
                  {source.snippet && (
                    <p className="mt-2 text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                      {source.snippet}
                    </p>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};
