"use client";

import React, { useState, useMemo } from "react";
import {
  ExternalLink,
  Globe,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  Search,
  Copy,
  Check,
  LayoutGrid,
  List,
  Filter,
} from "lucide-react";
import { SourceItem } from "@/types";

interface SourcesCardProps {
  sources: SourceItem[];
}

export const SourcesCard: React.FC<SourcesCardProps> = ({ sources }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const getDomain = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return "web source";
    }
  };

  const domainList = useMemo(() => {
    if (!sources) return [];
    const map = new Map<string, number>();
    sources.forEach((s) => {
      const d = getDomain(s.url);
      map.set(d, (map.get(d) || 0) + 1);
    });
    return Array.from(map.entries()).map(([domain, count]) => ({ domain, count }));
  }, [sources]);

  const filteredSources = useMemo(() => {
    if (!sources) return [];
    return sources.filter((item) => {
      const domain = getDomain(item.url);
      const matchesDomain = !selectedDomain || domain === selectedDomain;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.snippet?.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q);

      return matchesDomain && matchesSearch;
    });
  }, [sources, selectedDomain, searchQuery]);

  const handleCopyMarkdown = async () => {
    if (!sources || sources.length === 0) return;
    const lines = sources.map((s, idx) => {
      return `${idx + 1}. [${s.title || getDomain(s.url)}](${s.url})${s.snippet ? ` — _${s.snippet}_` : ""}`;
    });
    try {
      await navigator.clipboard.writeText(lines.join("\n\n"));
      setCopiedFormat("markdown");
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyUrlsOnly = async () => {
    if (!sources || sources.length === 0) return;
    const urls = sources.map((s) => s.url).join("\n");
    try {
      await navigator.clipboard.writeText(urls);
      setCopiedFormat("urls");
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch {
      // ignore
    }
  };

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Globe className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Verified Web Sources & Citations
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-indigo-300">
                {sources.length} total
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Autonomous search grounding from across {domainList.length} distinct web domains
            </p>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Copy citations options */}
          <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900 p-0.5">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Copy all sources formatted in Markdown"
            >
              {copiedFormat === "markdown" ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3 text-indigo-400" />
              )}
              <span>{copiedFormat === "markdown" ? "Copied MD!" : "Copy Citations"}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyUrlsOnly}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Copy plain URLs list"
            >
              {copiedFormat === "urls" ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <LinkIcon className="h-3 w-3 text-slate-400" />
              )}
              <span>{copiedFormat === "urls" ? "URLs Copied!" : "URLs"}</span>
            </button>
          </div>

          {/* Grid/List switch */}
          <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900 p-0.5">
            <button
              type="button"
              onClick={() => setLayoutMode("grid")}
              className={`rounded-md p-1 transition-colors cursor-pointer ${
                layoutMode === "grid" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("list")}
              className={`rounded-md p-1 transition-colors cursor-pointer ${
                layoutMode === "list" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="List view"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Expand/Collapse */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800"
          >
            <span>{isExpanded ? "Collapse" : "Show All"}</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-2">
          {/* Domain Badges Bar & Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-t border-slate-800/80 pt-3">
            {/* Domain filter tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono mr-1">
                <Filter className="h-3 w-3 text-slate-500" />
                Domains:
              </span>
              <button
                type="button"
                onClick={() => setSelectedDomain(null)}
                className={`rounded-md px-2 py-0.5 text-[11px] font-mono transition-colors cursor-pointer ${
                  selectedDomain === null
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                All ({sources.length})
              </button>
              {domainList.map((d) => (
                <button
                  key={d.domain}
                  type="button"
                  onClick={() => setSelectedDomain(selectedDomain === d.domain ? null : d.domain)}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-mono transition-colors cursor-pointer ${
                    selectedDomain === d.domain
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                  }`}
                >
                  {d.domain} ({d.count})
                </button>
              ))}
            </div>

            {/* Live Citation Search */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter sources..."
                className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-8 pr-7 py-1 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          {/* Sources List / Grid */}
          {filteredSources.length === 0 ? (
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-6 text-center text-xs text-slate-400">
              No citations match the selected domain or filter keyword.
            </div>
          ) : layoutMode === "grid" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSources.map((source, idx) => {
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
          ) : (
            <div className="space-y-2">
              {filteredSources.map((source, idx) => {
                const domain = getDomain(source.url);
                return (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start justify-between gap-4 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 transition-all hover:border-indigo-500/50 hover:bg-slate-900/80 cursor-pointer"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-indigo-300">
                          {domain}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white">
                          {source.title || domain}
                        </h4>
                      </div>
                      {source.snippet && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {source.snippet}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-indigo-400 mt-1" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
