"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ResearchForm } from "@/components/ResearchForm";
import { EmptyState } from "@/components/EmptyState";
import { checkBackendHealth, DEFAULT_API_BASE_URL } from "@/lib/api";
import { ResearchRequest } from "@/types";

export default function Home() {
  const [apiUrl] = useState<string>(DEFAULT_API_BASE_URL);
  const [backendStatus, setBackendStatus] = useState<"online" | "offline" | "checking">("checking");
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const handleRunResearch = (request: ResearchRequest) => {
    setIsLoading(true);
    // Simulating initial research pipeline trigger
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header backendStatus={backendStatus} apiUrl={apiUrl} />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        <section>
          <ResearchForm onSubmit={handleRunResearch} isLoading={isLoading} />
        </section>

        <section className="text-center py-6 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
            <span>Powered by Tavily, LangChain & OpenAI</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Deep Research & Intelligence Synthesis
          </h1>
          <p className="mx-auto max-w-2xl text-slate-400 text-sm sm:text-base leading-relaxed">
            Autonomous multi-pass agent that navigates live web sources, aggregates evidence,
            and produces publication-grade executive briefs and academic research papers.
          </p>
        </section>

        <EmptyState onQuickStart={() => {}} />
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        NexusResearch Agent &middot; Built with Next.js & FastAPI &middot; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
