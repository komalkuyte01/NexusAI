"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Trash2,
  Calendar,
  FileText,
  ArrowRight,
  Bookmark,
  Search,
  Download,
  Filter,
} from "lucide-react";
import { SavedReport, ReportType } from "@/types";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedReports: SavedReport[];
  onSelectReport: (report: SavedReport) => void;
  onDeleteReport: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  savedReports,
  onSelectReport,
  onDeleteReport,
  onClearAll,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ReportType>("all");

  const filteredReports = useMemo(() => {
    return savedReports.filter((item) => {
      const matchesType = typeFilter === "all" || item.report_type === typeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || item.topic.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [savedReports, typeFilter, searchQuery]);

  const handleExportAll = () => {
    if (savedReports.length === 0) return;
    const blob = new Blob([JSON.stringify(savedReports, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nexus-research-archive-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-slate-950 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Bookmark className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Saved Research Archive</h2>
              <p className="text-[11px] text-slate-400">
                {savedReports.length} {savedReports.length === 1 ? "report" : "reports"} stored locally
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter and Search Controls (if reports exist) */}
        {savedReports.length > 0 && (
          <div className="space-y-2.5 border-b border-slate-800/80 py-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved reports..."
                className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
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

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="flex items-center gap-1 text-slate-500 mr-1">
                <Filter className="h-3 w-3" />
                Filter:
              </span>
              <button
                type="button"
                onClick={() => setTypeFilter("all")}
                className={`rounded px-2 py-0.5 transition-colors cursor-pointer ${
                  typeFilter === "all"
                    ? "bg-indigo-600 text-white font-medium"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("report")}
                className={`rounded px-2 py-0.5 transition-colors cursor-pointer ${
                  typeFilter === "report"
                    ? "bg-indigo-600 text-white font-medium"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                Executive
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("research_paper")}
                className={`rounded px-2 py-0.5 transition-colors cursor-pointer ${
                  typeFilter === "research_paper"
                    ? "bg-indigo-600 text-white font-medium"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                Academic
              </button>
            </div>
          </div>
        )}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {savedReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <FileText className="h-10 w-10 text-slate-600 mb-2" />
              <p className="text-xs font-medium text-slate-300">No saved reports yet</p>
              <p className="mt-1 text-[11px] text-slate-500">
                Run an autonomous research query and click &quot;Save Report&quot; to archive it here for offline reference.
              </p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
              <p className="text-xs text-slate-400">No reports matched your search.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("all");
                }}
                className="mt-2 text-xs text-indigo-400 hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredReports.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-xl border border-slate-800/90 bg-slate-900/40 p-4 transition-all hover:border-indigo-500/40 hover:bg-slate-900/80"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1.5">
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-indigo-300">
                    {item.report_type === "research_paper" ? "ACADEMIC" : "EXECUTIVE"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    {new Date(item.savedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-xs font-semibold text-slate-200 line-clamp-2 group-hover:text-white leading-snug">
                  {item.topic}
                </h3>

                <p className="mt-1.5 text-[11px] text-slate-400">
                  {item.sources ? item.sources.length : 0} citations included
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-slate-800/70 pt-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectReport(item);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    <span>View Report</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteReport(item.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                    title="Delete report"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {savedReports.length > 0 && (
          <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handleExportAll}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Download entire history archive as JSON"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Archive (.json)</span>
            </button>

            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
