"use client";

import React from "react";
import { X, Trash2, Calendar, FileText, ArrowRight, Bookmark } from "lucide-react";
import { SavedReport } from "@/types";

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-slate-950 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Bookmark className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Saved Reports</h2>
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

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {savedReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <FileText className="h-10 w-10 text-slate-600 mb-2" />
              <p className="text-xs font-medium text-slate-300">No saved reports yet</p>
              <p className="mt-1 text-[11px] text-slate-500">
                Run a research investigation and click &quot;Save Report&quot; to archive it here for quick access.
              </p>
            </div>
          ) : (
            savedReports.map((item) => (
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
          <div className="border-t border-slate-800 pt-3 flex justify-end">
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear All History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
