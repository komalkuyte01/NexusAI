"use client";

import React, { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { ResearchForm } from "@/components/ResearchForm";
import { LoadingStatus } from "@/components/LoadingStatus";
import { ReportViewer } from "@/components/ReportViewer";
import { SourcesCard } from "@/components/SourcesCard";
import { HistoryDrawer } from "@/components/HistoryDrawer";
import { SettingsModal } from "@/components/SettingsModal";
import { checkBackendHealth, generateResearch, DEFAULT_API_BASE_URL } from "@/lib/api";
import { getSavedReports, saveReport, deleteSavedReport, clearAllSavedReports } from "@/lib/storage";
import { ResearchRequest, ResearchResponse, SavedReport } from "@/types";
import { AlertCircle, XCircle, Sparkles } from "lucide-react";

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30">
      <Header
        backendStatus={backendStatus}
        apiUrl={apiUrl}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        savedCount={savedReports.length}
      />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 space-y-6">
        {/* If report or loading: Show minimal compact prompt at top */}
        {(report || isLoading) && (
          <section className="pt-2">
            <ResearchForm onSubmit={handleRunResearch} isLoading={isLoading} />
          </section>
        )}

        {/* Anchor for auto-scrolling to results / progress */}
        <div ref={resultsRef} />

        {/* Error notification banner */}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs sm:text-sm text-rose-300 flex items-start justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">Research Pipeline Notice</p>
                <p className="mt-1 text-rose-300/90 leading-relaxed">{error}</p>
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
          <section className="pt-4">
            <LoadingStatus topic={currentTopic} />
          </section>
        )}

        {/* Generated Report and Sources View */}
        {report && !isLoading && (
          <section className="space-y-6">
            <ReportViewer
              report={report}
              onReset={handleReset}
              onSave={handleSaveReport}
              isSaved={isCurrentReportSaved}
            />
            <SourcesCard sources={report.sources} />
          </section>
        )}

        {/* Minimal ChatGPT-like Center Hero State */}
        {!report && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-2xl mx-auto px-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-xl shadow-indigo-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950">
                <Sparkles className="h-6 w-6 text-cyan-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                What would you like to research?
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Autonomous web research &middot; Grounded multi-source synthesis
              </p>
            </div>

            <div className="w-full pt-2">
              <ResearchForm onSubmit={handleRunResearch} isLoading={isLoading} />
            </div>
          </div>
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

      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-[11px] text-slate-600">
        NexusResearch &middot; Autonomous Research Agent &middot; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
