"use client";

import React from "react";
import { Sparkles, Activity, History, Settings, ExternalLink } from "lucide-react";

interface HeaderProps {
  backendStatus: "online" | "offline" | "checking";
  apiUrl: string;
  onOpenHistory?: () => void;
  onOpenSettings?: () => void;
  savedCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  backendStatus,
  apiUrl,
  onOpenHistory,
  onOpenSettings,
  savedCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <Sparkles className="h-5 w-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-white sm:text-lg">
                Nexus<span className="text-indigo-400">Research</span>
              </span>
              <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-indigo-300">
                AGENTIC AI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous Web Research & Structured Synthesis
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Backend Status Badge */}
          <div
            title={`Backend: ${apiUrl}`}
            className="hidden sm:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-300"
          >
            <span className="relative flex h-2 w-2">
              {backendStatus === "online" ? (
                <>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </>
              ) : backendStatus === "checking" ? (
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              ) : (
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
              )}
            </span>
            <span className="font-mono text-[11px]">
              {backendStatus === "online"
                ? "API Active"
                : backendStatus === "checking"
                ? "Connecting..."
                : "API Offline"}
            </span>
          </div>

          {/* History Button */}
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white"
            >
              <History className="h-3.5 w-3.5 text-slate-400" />
              <span>History</span>
              {savedCount > 0 && (
                <span className="ml-1 rounded-full bg-indigo-500/20 px-1.5 py-0.2 text-[10px] font-bold text-indigo-300">
                  {savedCount}
                </span>
              )}
            </button>
          )}

          {/* Settings Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              title="Configure API Endpoint"
              className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
