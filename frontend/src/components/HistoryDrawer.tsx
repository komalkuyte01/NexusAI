"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Trash2,
  Calendar,
  FileText,
  ArrowRight,
  Search,
  Pin,
  Clock,
} from "lucide-react";
import { SavedReport } from "@/types";
import { formatProperHeading } from "./ReportViewer";

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

type TabFilter = "history" | "pinned";

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
  const [activeTab, setActiveTab] = useState<TabFilter>("history");

  const pinnedCount = useMemo(() => {
    return savedReports.filter((r) => Boolean(r.isPinned)).length;
  }, [savedReports]);

  const historyCount = useMemo(() => {
    return savedReports.filter((r) => !r.isPinned).length;
  }, [savedReports]);

  const filteredReports = useMemo(() => {
    return savedReports.filter((item) => {
      // In "history" tab, show ONLY unpinned items.
      // In "pinned" tab, show ONLY pinned items.
      const matchesTab = activeTab === "pinned" ? Boolean(item.isPinned) : !item.isPinned;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.topic.toLowerCase().includes(q) ||
        (item.content && item.content.slice(0, 500).toLowerCase().includes(q));

      return matchesTab && matchesQuery;
    });
  }, [savedReports, activeTab, searchQuery]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Recently";
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm transition-opacity font-sans">
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-white/[0.1] bg-[#0c0e14]/95 backdrop-blur-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">History</h2>
            <p className="text-xs text-neutral-400">
              {savedReports.length} {savedReports.length === 1 ? "saved item" : "saved items"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Two Tabs: History & Pinned */}
        {savedReports.length > 0 && (
          <div className="space-y-3 border-b border-white/[0.08] py-3.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history..."
                className="w-full rounded-xl border border-white/[0.08] bg-black/40 pl-9 pr-8 py-2 text-xs text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs cursor-pointer"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Exactly 2 Clean Tabs: History & Pinned */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "history"
                    ? "bg-white text-black shadow-sm"
                    : "bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>History ({historyCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("pinned")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "pinned"
                    ? "bg-white text-black shadow-sm"
                    : "bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <Pin className={`h-3.5 w-3.5 ${activeTab === "pinned" ? "fill-black text-black" : "text-neutral-400"}`} />
                <span>Pinned ({pinnedCount})</span>
              </button>
            </div>
          </div>
        )}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {savedReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <FileText className="h-10 w-10 text-neutral-600 mb-2" />
              <p className="text-xs font-semibold text-neutral-300">No saved history yet</p>
              <p className="mt-1 text-[11px] text-neutral-500 max-w-xs">
                Your research sessions will be saved here automatically.
              </p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
              <p className="text-xs text-neutral-400">
                {activeTab === "pinned"
                  ? "No pinned items yet. Pin any item from History to keep it here."
                  : historyCount === 0 && pinnedCount > 0
                  ? "All saved items are currently pinned."
                  : "No items match your search."}
              </p>
              {activeTab === "history" && historyCount === 0 && pinnedCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("pinned")}
                  className="mt-2 text-xs text-white underline cursor-pointer font-medium"
                >
                  View Pinned ({pinnedCount})
                </button>
              )}
            </div>
          ) : (
            filteredReports.map((item) => {
              const isItemActive = activeReportId === item.id;
              const isItemPinned = Boolean(item.isPinned);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectReport(item);
                    onClose();
                  }}
                  className={`group relative rounded-xl border p-4 transition-all duration-200 cursor-pointer ${
                    isItemActive
                      ? "border-white/40 bg-neutral-900"
                      : "border-white/[0.07] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                >
                  {/* Top Row: Date & Status & Pin Action */}
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-neutral-400">
                        <Calendar className="h-3 w-3 text-neutral-500" />
                        <span>{formatDate(item.savedAt)}</span>
                      </span>

                      {isItemActive && (
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white font-medium border border-white/20">
                          Current
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Pin / Unpin Button */}
                      {onTogglePin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin(item.id);
                          }}
                          title={isItemPinned ? "Unpin (move to History)" : "Pin to Pinned"}
                          className={`rounded-md p-1 transition-colors cursor-pointer ${
                            isItemPinned
                              ? "text-black bg-white hover:bg-neutral-200"
                              : "text-neutral-500 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <Pin className={`h-3.5 w-3.5 ${isItemPinned ? "fill-black" : ""}`} />
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteReport(item.id);
                        }}
                        className="text-neutral-500 hover:text-white transition-colors p-1 cursor-pointer rounded-md hover:bg-white/10"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title / Topic */}
                  <h3 className="text-xs font-semibold text-neutral-200 group-hover:text-white leading-snug line-clamp-2">
                    {formatProperHeading(item.topic)}
                  </h3>

                  {/* Footer with Open Link */}
                  <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-2 text-xs">
                    <span className="text-[11px] text-neutral-500">
                      {item.sources ? item.sources.length : 0} citations
                    </span>

                    <span className="flex items-center gap-1 text-[11px] font-semibold text-white group-hover:underline">
                      <span>Open</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        {savedReports.length > 0 && (
          <div className="border-t border-white/[0.08] pt-3 flex items-center justify-end">
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 px-2 py-1 rounded hover:bg-white/[0.04]"
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
