"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Download, FileText, Calendar, RotateCcw } from "lucide-react";
import { ResearchResponse } from "@/types";

interface ReportViewerProps {
  report: ResearchResponse;
  onReset: () => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ report, onReset }) => {
  const [copied, setCopied] = useState(false);

  const wordCount = report.content
    ? report.content.trim().split(/\s+/).length
    : 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const filename = `${report.topic.slice(0, 30).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-report.md`;
    const blob = new Blob([report.content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formattedDate = report.created_at
    ? new Date(report.created_at).toLocaleString()
    : new Date().toLocaleDateString();

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Report Header Bar */}
      <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-xs font-medium text-indigo-300">
              {report.report_type === "research_paper" ? "Academic Paper" : "Executive Report"}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400 font-mono">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              {formattedDate}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              &middot; ~{wordCount} words
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
            {report.topic}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied!" : "Copy Markdown"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export .md</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>New Search</span>
          </button>
        </div>
      </div>

      {/* Markdown Content Display */}
      <div className="prose prose-invert max-w-none space-y-4 text-slate-300 text-sm leading-relaxed sm:text-base [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-white [&>h1]:border-b [&>h1]:border-slate-800 [&>h1]:pb-2 [&>h1]:mt-6 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:text-indigo-200 [&>h2]:mt-6 [&>h2]:mb-2 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-slate-100 [&>h3]:mt-4 [&>p]:leading-7 [&>p]:text-slate-300 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1 [&>blockquote]:border-l-4 [&>blockquote]:border-indigo-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-400 [&>pre]:rounded-xl [&>pre]:bg-slate-900 [&>pre]:p-4 [&>pre]:border [&>pre]:border-slate-800 [&>code]:rounded [&>code]:bg-slate-900 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:text-indigo-300 [&>code]:text-xs">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {report.content}
        </ReactMarkdown>
      </div>

      {/* Footer info banner */}
      <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          Generated autonomously with factual grounding
        </span>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="hover:text-slate-300 transition-colors cursor-pointer"
        >
          Back to top &uarr;
        </button>
      </div>
    </article>
  );
};
