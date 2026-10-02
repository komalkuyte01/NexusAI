"use client";

import React, { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { ResearchForm } from "@/components/ResearchForm";
import { EmptyState } from "@/components/EmptyState";
import { LoadingStatus } from "@/components/LoadingStatus";
import { ReportViewer } from "@/components/ReportViewer";
import { ResearchMetricsCard } from "@/components/ResearchMetricsCard";
import { SourcesCard } from "@/components/SourcesCard";
import { HistoryDrawer } from "@/components/HistoryDrawer";
import { SettingsModal } from "@/components/SettingsModal";
import { checkBackendHealth, generateResearch, DEFAULT_API_BASE_URL } from "@/lib/api";
import { getSavedReports, saveReport, deleteSavedReport, clearAllSavedReports } from "@/lib/storage";
import { ResearchRequest, ResearchResponse, SavedReport } from "@/types";
import { AlertCircle, XCircle } from "lucide-react";

export default function Home() {
  const [apiUrl, setApiUrl] = useState<string>(DEFAULT_API_BASE_URL);
  const [backendStatus, setBackendStatus] = useState<"online" | "offline" | "checking">("checking");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTopic, setCurrentTopic] = useState<string>("");
  const [report, setReport] = useState<ResearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Settings & History state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Read saved API URL if configured
    if (typeof window !== "undefined") {
      const storedApi = localStorage.getItem("nexus_api_url");
      if (storedApi) {
        setApiUrl(storedApi);
      }
    }

    // Load local storage saved reports
    setSavedReports(getSavedReports());
  }, []);

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

  const handleSaveApiUrl = (newUrl: string) => {
    setApiUrl(newUrl);
    if (typeof window !== "undefined") {
      localStorage.setItem("nexus_api_url", newUrl);
    }
  };

  const handleRunResearch = async (request: ResearchRequest) => {
    setIsLoading(true);
    setError(null);
    setCurrentTopic(request.topic);

    // Smooth scroll down to progress/results area
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    try {
      const result = await generateResearch(request, apiUrl);
      setReport(result);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to generate research report. Please verify backend connection.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setReport(null);
    setError(null);
    setCurrentTopic("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveReport = (rep: ResearchResponse) => {
    const saved = saveReport(rep);
    setSavedReports((prev) => [saved, ...prev]);
  };

  const handleSelectReport = (saved: SavedReport) => {
    setReport(saved);
    setError(null);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleDeleteReport = (id: string) => {
    const updated = deleteSavedReport(id);
    setSavedReports(updated);
  };

  const handleClearAllHistory = () => {
    clearAllSavedReports();
    setSavedReports([]);
  };

  const isCurrentReportSaved = Boolean(
    report && savedReports.some((item) => item.topic === report.topic && item.content === report.content)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header
        backendStatus={backendStatus}
        apiUrl={apiUrl}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        savedCount={savedReports.length}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        <section>
          <ResearchForm onSubmit={handleRunResearch} isLoading={isLoading} />
        </section>

        {/* Anchor for auto-scrolling to results / progress */}
        <div ref={resultsRef} />

        {/* Error notification banner */}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs sm:text-sm text-rose-300 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">Research Pipeline Error</p>
                <p className="mt-1 text-rose-300/90">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-200 p-1 cursor-pointer"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Live Loading Status */}
        {isLoading && (
          <section>
            <LoadingStatus topic={currentTopic} />
          </section>
        )}

        {/* Generated Report and Sources View */}
        {report && !isLoading && (
          <section className="space-y-6">
            <ResearchMetricsCard report={report} />
            <ReportViewer
              report={report}
              onReset={handleReset}
              onSave={handleSaveReport}
              isSaved={isCurrentReportSaved}
            />
            <SourcesCard sources={report.sources} />
          </section>
        )}

        {/* Empty State / Welcome Exploration */}
        {!report && !isLoading && (
          <>
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

            <EmptyState onQuickStart={handleRunResearch} />
          </>
        )}
      </main>

      {/* History Drawer Modal */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedReports={savedReports}
        onSelectReport={handleSelectReport}
        onDeleteReport={handleDeleteReport}
        onClearAll={handleClearAllHistory}
      />

      {/* Backend Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentApiUrl={apiUrl}
        onSaveApiUrl={handleSaveApiUrl}
      />

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        NexusResearch Agent &middot; Built with Next.js & FastAPI &middot; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
