"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { EmptyState } from "@/components/EmptyState";
import { checkBackendHealth, DEFAULT_API_BASE_URL } from "@/lib/api";
import { ResearchRequest } from "@/types";

export default function Home() {
  const [apiUrl] = useState<string>(DEFAULT_API_BASE_URL);
  const [backendStatus, setBackendStatus] = useState<"online" | "offline" | "checking">("checking");
  const [selectedPrompt, setSelectedPrompt] = useState<ResearchRequest | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function pingStatus() {
      const isOnline = await checkBackendHealth(apiUrl);
      if (isMounted) {
        setBackendStatus(isOnline ? "online" : "offline");
      }
    }

    pingStatus();
    const interval = setInterval(pingStatus, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [apiUrl]);

  const handleQuickStart = (request: ResearchRequest) => {
    setSelectedPrompt(request);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header backendStatus={backendStatus} apiUrl={apiUrl} />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        {/* Hero Section */}
        <section className="text-center py-8 sm:py-12 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
            <span>Powered by Tavily, LangChain & OpenAI</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-white">
            Deep Research & Intelligence Synthesis
          </h1>
          <p className="mx-auto max-w-2xl text-slate-400 text-sm sm:text-base leading-relaxed">
            Autonomous multi-pass agent that navigates live web sources, aggregates evidence,
            and produces publication-grade executive briefs and academic research papers.
          </p>
        </section>

        {/* Selected Topic Notice if clicked */}
        {selectedPrompt && (
          <div className="mb-6 rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-4 text-xs text-indigo-200 flex items-center justify-between">
            <div>
              <span className="font-semibold text-white">Selected starter topic: </span>
              {selectedPrompt.topic}
            </div>
            <button
              onClick={() => setSelectedPrompt(null)}
              className="text-indigo-400 hover:text-white underline ml-4 cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}

        {/* Empty State / Feature Pillars & One-Click Starters */}
        <EmptyState onQuickStart={handleQuickStart} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        NexusResearch Agent &middot; Built with Next.js & FastAPI &middot; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
