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
  Pin,
  PinOff,
  Eye,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import { SavedReport, ReportType } from "@/types";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedReports: SavedReport[];
  onSelectReport: (report: SavedReport) => void;
  onDeleteReport: (id: string) => void;
  onClearAll: () => void;
  onTogglePin?: (id: string) => void;
  activeReportId?: string;
}

type TabFilter = "all" | "pinned" | ReportType;

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  savedReports,
  onSelectReport,
  onDeleteReport,
  onClearAll,
  onTogglePin,
  activeReportId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [previewReport, setPreviewReport] = useState<SavedReport | null>(null);

  const pinnedCount = useMemo(() => {
    return savedReports.filter((r) => r.isPinned).length;
  }, [savedReports]);

  const filteredReports = useMemo(() => {
    return savedReports.filter((item) => {
      let matchesTab = true;
      if (activeTab === "pinned") {
        matchesTab = Boolean(item.isPinned);
      } else if (activeTab === "report" || activeTab === "research_paper") {
        matchesTab = item.report_type === activeTab;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.topic.toLowerCase().includes(q) ||
        (item.content && item.content.slice(0, 500).toLowerCase().includes(q));

      return matchesTab && matchesQuery;
    });
  }, [savedReports, activeTab, searchQuery]);

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
      <div className="relative flex h-full w-full max-w-lg flex-col border-l border-slate-800 bg-slate-950 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Bookmark className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <span>Research & Chat History</span>
                {pinnedCount > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                    <Pin className="h-2.5 w-2.5 fill-amber-300" />
                    {pinnedCount} pinned
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400">
                {savedReports.length} {savedReports.length === 1 ? "session" : "sessions"} recorded
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

        {/* Filter and Search Controls */}
        {savedReports.length > 0 && (
          <div className="space-y-2.5 border-b border-slate-800/80 py-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search past chats & reports..."
                className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 text-[11px] overflow-x-auto pb-0.5">
              <span className="flex items-center gap-1 text-slate-500 mr-1 shrink-0">
                <Filter className="h-3 w-3" />
                Filter:
              </span>
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`rounded px-2 py-0.5 transition-colors cursor-pointer shrink-0 ${
                  activeTab === "all"
                    ? "bg-indigo-600 text-white font-medium"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                All ({savedReports.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("pinned")}
                className={`flex items-center gap-1 rounded px-2 py-0.5 transition-colors cursor-pointer shrink-0 ${
                  activeTab === "pinned"
                    ? "bg-amber-600 text-white font-medium"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Pin className={`h-3 w-3 ${activeTab === "pinned" ? "fill-white" : ""}`} />
                <span>Pinned ({pinnedCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("report")}
                className={`rounded px-2 py-0.5 transition-colors cursor-pointer shrink-0 ${
                  activeTab === "report"
                    ? "bg-indigo-600 text-white font-medium"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                Executive
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("research_paper")}
                className={`rounded px-2 py-0.5 transition-colors cursor-pointer shrink-0 ${
                  activeTab === "research_paper"
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
              <p className="text-xs font-medium text-slate-300">No history recorded yet</p>
              <p className="mt-1 text-[11px] text-slate-500">
                Run any research prompt to automatically store and pin past chats here for offline reference.
              </p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
              <p className="text-xs text-slate-400">
                {activeTab === "pinned"
                  ? "No pinned chats yet. Click the pin icon on any chat to keep it at the top."
                  : "No research chats matched your filter."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab("all");
                }}
                className="mt-2 text-xs text-indigo-400 hover:underline cursor-pointer"
              >
                Show all history
              </button>
            </div>
          ) : (
            filteredReports.map((item) => {
              const isItemActive = activeReportId === item.id;
              const isItemPinned = Boolean(item.isPinned);

              return (
                <div
                  key={item.id}
                  className={`group relative rounded-xl border p-4 transition-all ${
                    isItemPinned
                      ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 hover:bg-slate-900/90 shadow-sm shadow-amber-500/5"
                      : isItemActive
                      ? "border-indigo-500/40 bg-indigo-500/5 hover:border-indigo-500/60"
                      : "border-slate-800/90 bg-slate-900/40 hover:border-indigo-500/30 hover:bg-slate-900/80"
                  }`}
                >
                  {/* Top Status Badges */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`rounded px-1.5 py-0.5 font-medium ${
                          item.report_type === "research_paper"
                            ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                            : "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                        }`}
                      >
                        {item.report_type === "research_paper" ? "ACADEMIC" : "EXECUTIVE"}
                      </span>

                      {isItemPinned && (
                        <span className="flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-amber-300 border border-amber-500/30 font-semibold">
                          <Pin className="h-2.5 w-2.5 fill-amber-300" />
                          PINNED
                        </span>
                      )}

                      {isItemActive && (
                        <span className="flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300 border border-emerald-500/30">
                          CURRENT
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.savedAt).toLocaleDateString()}
                      </span>

                      {/* Quick Pin Button */}
                      {onTogglePin && (
                        <button
                          type="button"
                          onClick={() => onTogglePin(item.id)}
                          title={isItemPinned ? "Unpin this chat" : "Pin to top"}
                          className={`rounded p-1 transition-colors cursor-pointer ${
                            isItemPinned
                              ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 bg-amber-500/10"
                              : "text-slate-500 hover:text-amber-400 hover:bg-slate-800"
                          }`}
                        >
                          {isItemPinned ? (
                            <Pin className="h-3.5 w-3.5 fill-amber-400" />
                          ) : (
                            <Pin className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title / Topic */}
                  <h3 className="text-xs font-semibold text-slate-200 line-clamp-2 group-hover:text-white leading-snug">
                    {item.topic}
                  </h3>

                  {/* Metadata: Sources, Claims & Summary */}
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                    <span>{item.sources ? item.sources.length : 0} citations</span>
                    {item.claims && item.claims.length > 0 && (
                      <span className="text-emerald-400/90">
                        {item.claims.filter((c) => c.verification_status === "Verified").length}/{item.claims.length} claims verified
                      </span>
                    )}
                    {item.metrics && (
                      <span className="text-indigo-400">
                        {Math.round(item.metrics.claim_support_rate)}% support rate
                      </span>
                    )}
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="mt-3 flex items-center justify-between border-t border-slate-800/70 pt-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectReport(item);
                          onClose();
                        }}
                        className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        <span>Open Chat</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreviewReport(item)}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Check quick summary"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Check Details</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteReport(item.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer rounded hover:bg-slate-800"
                      title="Delete from history"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Check Preview Modal (when clicking "Check Details") */}
        {previewReport && (
          <div className="absolute inset-x-4 inset-y-6 z-20 flex flex-col rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl backdrop-blur-xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                  Quick History Check
                </span>
                {previewReport.isPinned && (
                  <span className="flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                    <Pin className="h-2.5 w-2.5 fill-amber-300" />
                    Pinned
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewReport(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs">
              <div>
                <h4 className="font-semibold text-slate-100 text-sm leading-snug">
                  {previewReport.topic}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Saved on {new Date(previewReport.savedAt).toLocaleString()}
                </p>
              </div>

              {/* Quality Metrics Highlights */}
              {previewReport.metrics && (
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-950/70 p-2.5 border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400">Claim Support:</span>
                    <p className="font-semibold text-indigo-300">
                      {Math.round(previewReport.metrics.claim_support_rate)}%
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Citations Coverage:</span>
                    <p className="font-semibold text-cyan-300">
                      {Math.round(previewReport.metrics.citation_coverage)}%
                    </p>
                  </div>
                </div>
              )}

              {/* Content Preview Snippet */}
              <div>
                <p className="text-[11px] font-medium text-slate-400 mb-1">Content Preview:</p>
                <div className="max-h-40 overflow-y-auto rounded-lg bg-slate-950/80 p-2.5 text-slate-300 leading-relaxed font-sans text-[11px] whitespace-pre-wrap border border-slate-800/80">
                  {previewReport.content.slice(0, 800)}...
                </div>
              </div>

              {/* Verified Sources list */}
              {previewReport.sources && previewReport.sources.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-slate-400 mb-1">
                    Citations ({previewReport.sources.length}):
                  </p>
                  <ul className="space-y-1">
                    {previewReport.sources.slice(0, 4).map((src, idx) => (
                      <li key={idx} className="truncate text-[10px] text-indigo-400">
                        &bull; {src.title || src.url}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Preview Footer */}
            <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (onTogglePin) onTogglePin(previewReport.id);
                  setPreviewReport((prev) =>
                    prev ? { ...prev, isPinned: !prev.isPinned } : null
                  );
                }}
                className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 cursor-pointer"
              >
                <Pin className={`h-3.5 w-3.5 ${previewReport.isPinned ? "fill-amber-300" : ""}`} />
                <span>{previewReport.isPinned ? "Unpin" : "Pin to Top"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectReport(previewReport);
                  setPreviewReport(null);
                  onClose();
                }}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition-colors cursor-pointer"
              >
                Open Full Report
              </button>
            </div>
          </div>
        )}

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
