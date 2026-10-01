"use client";

import React, { useState, useEffect } from "react";
import { X, Server, CheckCircle2, XCircle, RefreshCw, RotateCcw } from "lucide-react";
import { DEFAULT_API_BASE_URL } from "@/lib/api";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiUrl: string;
  onSaveApiUrl: (url: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentApiUrl,
  onSaveApiUrl,
}) => {
  const [urlInput, setUrlInput] = useState(currentApiUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: "success" | "error" | null;
    message: string;
    latencyMs?: number;
  }>({ status: null, message: "" });

  useEffect(() => {
    if (isOpen) {
      setUrlInput(currentApiUrl);
      setTestResult({ status: null, message: "" });
    }
  }, [isOpen, currentApiUrl]);

  if (!isOpen) return null;

  const handleTestConnection = async (targetUrl: string) => {
    setTesting(true);
    setTestResult({ status: null, message: "" });
    const startTime = performance.now();
    try {
      const sanitized = targetUrl.trim().replace(/\/$/, "");
      const res = await fetch(`${sanitized}/`, {
        method: "GET",
        cache: "no-store",
      });
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      if (res.ok) {
        setTestResult({
          status: "success",
          message: "Connected successfully! FastAPI service is responsive.",
          latencyMs: latency,
        });
      } else {
        setTestResult({
          status: "error",
          message: `Endpoint returned HTTP status ${res.status}`,
          latencyMs: latency,
        });
      }
    } catch {
      setTestResult({
        status: "error",
        message: "Failed to connect. Ensure your backend server is running.",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = urlInput.trim().replace(/\/$/, "");
    if (!sanitized) return;
    onSaveApiUrl(sanitized);
    onClose();
  };

  const handleResetDefault = () => {
    setUrlInput(DEFAULT_API_BASE_URL);
    setTestResult({ status: null, message: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">API Backend Settings</h2>
              <p className="text-[11px] text-slate-400">Configure connection to the FastAPI research engine</p>
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label htmlFor="api-url-input" className="block text-xs font-medium text-slate-300 mb-1.5">
              Backend Endpoint URL
            </label>
            <input
              id="api-url-input"
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="http://127.0.0.1:8000"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 font-mono text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Presets:</span>
            <button
              type="button"
              onClick={() => setUrlInput("http://127.0.0.1:8000")}
              className="rounded bg-slate-900 px-2 py-0.5 font-mono text-indigo-300 hover:bg-slate-800 cursor-pointer"
            >
              127.0.0.1:8000
            </button>
            <button
              type="button"
              onClick={() => setUrlInput("http://localhost:8000")}
              className="rounded bg-slate-900 px-2 py-0.5 font-mono text-indigo-300 hover:bg-slate-800 cursor-pointer"
            >
              localhost:8000
            </button>
          </div>

          {/* Live Ping Test Section */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">Connection Health Test</span>
              <button
                type="button"
                onClick={() => handleTestConnection(urlInput)}
                disabled={testing || !urlInput.trim()}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-200 hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`h-3 w-3 ${testing ? "animate-spin text-indigo-400" : ""}`} />
                <span>{testing ? "Pinging..." : "Test Connection"}</span>
              </button>
            </div>

            {testResult.status && (
              <div
                className={`flex items-center gap-2 rounded-lg p-2.5 text-xs ${
                  testResult.status === "success"
                    ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border border-rose-500/30 bg-rose-500/10 text-rose-300"
                }`}
              >
                {testResult.status === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-rose-400" />
                )}
                <div className="flex-1 leading-snug">
                  <span>{testResult.message}</span>
                  {testResult.latencyMs !== undefined && (
                    <span className="ml-2 font-mono text-[10px] opacity-80">
                      ({testResult.latencyMs}ms)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={handleResetDefault}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to Default</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-800 px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-900 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors cursor-pointer shadow-md shadow-indigo-600/30"
              >
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
