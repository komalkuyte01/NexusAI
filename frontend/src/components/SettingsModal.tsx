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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white border border-neutral-700">
              <Server className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">API & Engine Settings</h2>
              <p className="text-[11px] text-neutral-400">Configure connection and free AI model credentials</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Gemini API Key Field */}
          <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="gemini-key-input" className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <KeyRound className="h-3.5 w-3.5 text-neutral-300" />
                <span>Google Gemini API Key (Recommended)</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white hover:underline"
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
              placeholder="AIzaSy... (prevents OpenAI 429 quota exhaustion)"
              className="w-full rounded-lg border border-neutral-700 bg-black px-3 py-2 font-mono text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none"
            />
            <p className="text-[10px] text-neutral-400">
              Google Gemini has a generous free tier. Adding this key avoids credit exhaustion issues.
            </p>
          </div>

          {/* Backend URL Field */}
          <div>
            <label htmlFor="api-url-input" className="block text-xs font-medium text-neutral-300 mb-1.5">
              Backend Endpoint URL
            </label>
            <input
              id="api-url-input"
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="http://127.0.0.1:8000"
              className="w-full rounded-xl border border-neutral-700 bg-black px-3.5 py-2 font-mono text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <span>Presets:</span>
            <button
              type="button"
              onClick={() => setUrlInput("http://127.0.0.1:8000")}
              className="rounded border border-neutral-700 bg-neutral-900 px-2 py-0.5 font-mono text-neutral-200 hover:bg-neutral-800 hover:text-white cursor-pointer"
            >
              127.0.0.1:8000
            </button>
            <button
              type="button"
              onClick={() => setUrlInput("http://localhost:8000")}
              className="rounded border border-neutral-700 bg-neutral-900 px-2 py-0.5 font-mono text-neutral-200 hover:bg-neutral-800 hover:text-white cursor-pointer"
            >
              localhost:8000
            </button>
          </div>

          {/* Live Ping Test Section */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-300">Connection Health Test</span>
              <button
                type="button"
                onClick={() => handleTestConnection(urlInput)}
                disabled={testing || !urlInput.trim()}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs text-neutral-200 hover:bg-neutral-700 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`h-3 w-3 ${testing ? "animate-spin text-white" : ""}`} />
                <span>{testing ? "Pinging..." : "Test Connection"}</span>
              </button>
            </div>

            {testResult.status && (
              <div
                className={`flex items-center gap-2 rounded-lg p-2 text-xs border ${
                  testResult.status === "success"
                    ? "border-white/40 bg-white/10 text-white"
                    : "border-neutral-700 bg-neutral-900 text-neutral-300"
                }`}
              >
                {testResult.status === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-neutral-400" />
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
          <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
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
                className="rounded-xl border border-neutral-800 px-3.5 py-2 text-xs font-medium text-neutral-400 hover:bg-neutral-900 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors cursor-pointer shadow-md"
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
