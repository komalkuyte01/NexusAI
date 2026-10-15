"use client";

import React, { useState, useEffect } from "react";
import { X, Server, CheckCircle2, XCircle, RefreshCw, RotateCcw, KeyRound, ExternalLink } from "lucide-react";
import { DEFAULT_API_BASE_URL } from "@/lib/api";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiUrl: string;
  onSaveApiUrl: (url: string) => void;
  currentGeminiKey?: string;
  onSaveGeminiKey?: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentApiUrl,
  onSaveApiUrl,
  currentGeminiKey = "",
  onSaveGeminiKey,
}) => {
  const [urlInput, setUrlInput] = useState(currentApiUrl);
  const [geminiKeyInput, setGeminiKeyInput] = useState(currentGeminiKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: "success" | "error" | null;
    message: string;
    latencyMs?: number;
  }>({ status: null, message: "" });

  useEffect(() => {
    if (isOpen) {
      setUrlInput(currentApiUrl);
      setGeminiKeyInput(currentGeminiKey);
      setTestResult({ status: null, message: "" });
    }
  }, [isOpen, currentApiUrl, currentGeminiKey]);

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
    const sanitizedUrl = urlInput.trim().replace(/\/$/, "");
    if (sanitizedUrl) {
      onSaveApiUrl(sanitizedUrl);
    }

    if (onSaveGeminiKey) {
      onSaveGeminiKey(geminiKeyInput.trim());
    }

    onClose();
  };

  const handleResetDefault = () => {
    setUrlInput(DEFAULT_API_BASE_URL);
    setTestResult({ status: null, message: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md transition-opacity font-sans">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/[0.12] bg-[#0c0e14]/95 p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-5">
        {/* Glow ambient highlight */}
        <div className="pointer-events-none absolute -top-px left-12 right-12 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-60" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-neutral-800 to-neutral-900 text-white border border-white/10 shadow-sm">
              <Server className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">API &amp; Engine Configuration</h2>
              <p className="text-[11px] text-neutral-400">Configure connection endpoints and AI model credentials</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-neutral-400 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Gemini API Key Field */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2.5 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <label htmlFor="gemini-key-input" className="flex items-center gap-1.5 text-xs font-bold text-white">
                <KeyRound className="h-3.5 w-3.5 text-cyan-400" />
                <span>Google Gemini API Key (Recommended)</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 hover:underline"
              >
                <span>Get Free Key</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <input
              id="gemini-key-input"
              type="password"
              value={geminiKeyInput}
              onChange={(e) => setGeminiKeyInput(e.target.value)}
              placeholder="AIzaSy... (prevents rate limits & quota exhaustion)"
              className="w-full rounded-xl border border-white/[0.08] bg-black/50 px-3.5 py-2 font-mono text-xs text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none transition-colors"
            />
            <p className="text-[10px] text-neutral-400 leading-normal">
              Google Gemini offers a generous free tier. Adding this key avoids credit exhaustion issues.
            </p>
          </div>

          {/* Backend URL Field */}
          <div className="space-y-1.5">
            <label htmlFor="api-url-input" className="block text-xs font-semibold text-neutral-300">
              Backend Endpoint URL
            </label>
            <input
              id="api-url-input"
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="http://127.0.0.1:8000"
              className="w-full rounded-xl border border-white/[0.08] bg-black/50 px-3.5 py-2 font-mono text-xs text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none transition-colors"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <span className="font-medium">Presets:</span>
            <button
              type="button"
              onClick={() => setUrlInput("http://127.0.0.1:8000")}
              className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 font-mono text-neutral-300 hover:bg-white/[0.08] hover:text-white cursor-pointer transition-colors"
            >
              127.0.0.1:8000
            </button>
            <button
              type="button"
              onClick={() => setUrlInput("http://localhost:8000")}
              className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 font-mono text-neutral-300 hover:bg-white/[0.08] hover:text-white cursor-pointer transition-colors"
            >
              localhost:8000
            </button>
          </div>

          {/* Live Ping Test Section */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300">Connection Health Test</span>
              <button
                type="button"
                onClick={() => handleTestConnection(urlInput)}
                disabled={testing || !urlInput.trim()}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-white/[0.08] hover:text-white disabled:opacity-50 cursor-pointer transition-colors"
              >
                <RefreshCw className={`h-3 w-3 ${testing ? "animate-spin text-white" : ""}`} />
                <span>{testing ? "Pinging..." : "Test Connection"}</span>
              </button>
            </div>

            {testResult.status && (
              <div
                className={`flex items-center gap-2.5 rounded-xl p-2.5 text-xs border ${
                  testResult.status === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-200"
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
          <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
            <button
              type="button"
              onClick={handleResetDefault}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/[0.08] px-3.5 py-2 text-xs font-semibold text-neutral-400 hover:bg-white/[0.06] hover:text-white cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition-all cursor-pointer shadow-md active:scale-95"
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
