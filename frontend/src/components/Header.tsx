"use client";

import React from "react";
import { Sparkles, History, Settings, Pin } from "lucide-react";

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
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900 text-white shadow-sm">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-white sm:text-lg">
                Nexus<span className="text-neutral-400">Research</span>
              </span>
              <span className="rounded-full border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[10px] font-medium tracking-wide text-neutral-300">
                AGENTIC AI
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Autonomous Web Research & Structured Synthesis
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Backend Status Badge */}
          <div
            title={`Backend: ${apiUrl}`}
            className="hidden sm:flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300"
          >
            <span className="relative flex h-2 w-2">
              {backendStatus === "online" ? (
                <>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </>
              ) : backendStatus === "checking" ? (
                <span className="relative inline-flex h-2 w-2 rounded-full bg-neutral-400 animate-pulse" />
              ) : (
                <span className="relative inline-flex h-2 w-2 rounded-full bg-neutral-600" />
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
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-neutral-600 hover:bg-neutral-800 hover:text-white cursor-pointer"
            >
              <History className="h-3.5 w-3.5 text-neutral-400" />
              <span>History</span>
              {pinnedCount > 0 && (
                <span
                  title={`${pinnedCount} pinned chats`}
                  className="flex items-center gap-0.5 rounded-full bg-white text-black px-1.5 py-0.2 text-[10px] font-bold"
                >
                  <Pin className="h-2.5 w-2.5 fill-black" />
                  {pinnedCount}
                </span>
              )}
              {savedCount > 0 && (
                <span className="ml-0.5 rounded-full border border-neutral-700 bg-neutral-800 px-1.5 py-0.2 text-[10px] font-bold text-neutral-200">
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
              className="rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 transition-colors hover:border-neutral-600 hover:bg-neutral-800 hover:text-white cursor-pointer"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
