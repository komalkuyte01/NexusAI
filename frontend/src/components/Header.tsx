"use client";

import React from "react";
import { History, Settings, Pin } from "lucide-react";

interface HeaderProps {
  backendStatus: "online" | "offline" | "checking";
  apiUrl: string;
  onOpenHistory?: () => void;
  onOpenSettings?: () => void;
  savedCount?: number;
  pinnedCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  backendStatus,
  apiUrl,
  onOpenHistory,
  onOpenSettings,
  savedCount = 0,
  pinnedCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#090a0f]/80 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Minimal Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="h-7 w-7 rounded-md bg-white text-black flex items-center justify-center font-bold text-sm tracking-tight">
            N
          </div>
          <span className="text-base font-semibold tracking-tight text-white">
            Nexus <span className="text-neutral-400 font-normal">Research</span>
          </span>
        </div>

        {/* Minimal Right Actions */}
        <div className="flex items-center space-x-2.5">
          {/* Subtle status indicator */}
          <div
            title={`API: ${apiUrl} (${backendStatus})`}
            className="flex items-center gap-2 px-2.5 py-1 text-sm text-neutral-300"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                backendStatus === "online"
                  ? "bg-emerald-400"
                  : backendStatus === "checking"
                  ? "bg-amber-400 animate-pulse"
                  : "bg-rose-500"
              }`}
            />
            <span className="text-xs font-medium capitalize hidden sm:inline text-neutral-300">
              {backendStatus === "online" ? "Online" : backendStatus}
            </span>
          </div>

          {/* History */}
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              title="View archived reports"
              className="flex items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-neutral-200 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-colors cursor-pointer"
            >
              <History className="h-4 w-4 text-neutral-300" />
              <span className="hidden sm:inline">Archive</span>
              {savedCount > 0 && (
                <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-neutral-200">
                  {savedCount}
                </span>
              )}
            </button>
          )}

          {/* Settings */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              title="Settings"
              className="rounded-lg border border-white/[0.1] bg-white/[0.04] p-2 text-neutral-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-colors cursor-pointer"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};


