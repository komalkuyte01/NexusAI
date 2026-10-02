"use client";

import React, { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Check,
  Download,
  FileText,
  Calendar,
  RotateCcw,
  Bookmark,
  BookmarkCheck,
  Printer,
  ListTree,
  ChevronDown,
  ChevronUp,
  Clock,
  Hash,
  Type,
  FileCode,
  ArrowUp,
  FileDown,
} from "lucide-react";
import { ResearchResponse } from "@/types";

interface ReportViewerProps {
  report: ResearchResponse;
  onReset: () => void;
  onSave?: (report: ResearchResponse) => void;
  isSaved?: boolean;
}

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(markdown: string): HeadingItem[] {
  if (!markdown) return [];
  const lines = markdown.split("\n");
  const headings: HeadingItem[] = [];
  const seenIds: Record<string, number> = {};

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim().replace(/[*_`#]/g, "");
      const baseId = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      let id = baseId || `section-${headings.length}`;
      if (seenIds[id]) {
        seenIds[id]++;
        id = `${id}-${seenIds[id]}`;
      } else {
        seenIds[id] = 1;
      }

      headings.push({ id, text, level });
    }
  }

  return headings;
}

function markdownToDocHtml(md: string): string {
  if (!md) return "";
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 style="color:#334155; margin-top:14pt; font-size:13pt;">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="color:#1e40af; margin-top:18pt; font-size:16pt; border-bottom:1pt solid #cbd5e1; padding-bottom:4pt;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="color:#0f172a; margin-top:10pt; font-size:22pt; border-bottom:2pt solid #2563eb; padding-bottom:6pt;">$1</h1>');

  // Blockquotes
  html = html.replace(/^>\s?(.*$)/gim, '<blockquote style="border-left:3pt solid #3b82f6; margin:10pt 0; padding:6pt 12pt; background:#f1f5f9; color:#475569; font-style:italic;">$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');
  html = html.replace(/_(.*?)_/gim, '<em>$1</em>');

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" style="color:#2563eb; text-decoration:underline;">$1</a>');

  // Lists
  html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li style="margin-bottom:4pt;">$1</li>');
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li style="margin-bottom:4pt;">$1</li>');
  html = html.replace(/(<li[\s\S]*?<\/li>)/gim, '<ul style="margin:8pt 0 8pt 20pt;">$1</ul>');

  // Paragraphs
  html = html.split(/\n{2,}/).map(para => {
    para = para.trim();
    if (!para) return "";
    if (para.startsWith('<h') || para.startsWith('<ul') || para.startsWith('<block')) {
      return para;
    }
    return `<p style="margin:8pt 0; line-height:1.6; text-align:justify;">${para.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');

  return html;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  report,
  onReset,
  onSave,
  isSaved = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showOutline, setShowOutline] = useState(true);
  const [fontSize, setFontSize] = useState<"standard" | "large">("standard");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showFloatingDock, setShowFloatingDock] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, Math.round((window.scrollY / totalHeight) * 100)));
        setScrollProgress(progress);
        setShowFloatingDock(window.scrollY > 280);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const wordCount = useMemo(() => {
    return report.content ? report.content.trim().split(/\s+/).length : 0;
  }, [report.content]);

  const readingTime = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  const headings = useMemo(() => {
    return extractHeadings(report.content);
  }, [report.content]);

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

  const handleDownloadJson = () => {
    const filename = `${report.topic.slice(0, 30).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-data.json`;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadWord = () => {
    const filename = `${report.topic.slice(0, 30).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-report.doc`;
    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${report.topic}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page { size: 8.5in 11in; margin: 1in; }
          body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #0f172a; margin: 0; }
        </style>
      </head>
      <body>
        <div style="margin-bottom: 20pt; border-bottom: 2pt solid #e2e8f0; padding-bottom: 12pt;">
          <h1 style="font-size: 24pt; color: #0f172a; margin-bottom: 6pt;">${report.topic}</h1>
          <p style="font-size: 9pt; color: #64748b; margin: 0;">
            <strong>Format:</strong> ${report.report_type === "research_paper" ? "Academic Research Paper" : "Executive Report"} &middot; 
            <strong>Date:</strong> ${formattedDate} &middot; 
            <strong>Word Count:</strong> ~${wordCount} words
          </p>
        </div>
        <div>
          ${markdownToDocHtml(report.content)}
        </div>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const formattedDate = report.created_at
    ? new Date(report.created_at).toLocaleString()
    : new Date().toLocaleDateString();

  return (
    <>
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-900/60 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

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
            <span className="flex items-center gap-1 text-xs text-slate-500 font-mono">
              <Clock className="h-3 w-3 text-slate-500" />
              {readingTime} min read (~{wordCount} words)
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
            {report.topic}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onSave && (
            <button
              type="button"
              onClick={() => onSave(report)}
              disabled={isSaved}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                isSaved
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 cursor-default"
                  : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-600 hover:bg-slate-800"
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Saved in History</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Save Report</span>
                </>
              )}
            </button>
          )}

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
            onClick={handleDownloadWord}
            className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3.5 py-2 text-xs font-medium text-blue-300 transition-colors hover:bg-blue-500/20 hover:text-white cursor-pointer shadow-sm"
            title="Download formatted Microsoft Word (.doc / .docx) file"
          >
            <FileText className="h-3.5 w-3.5 text-blue-400" />
            <span>Export Word</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-500/20 hover:text-white cursor-pointer shadow-sm"
            title="Save as PDF or Print document"
          >
            <FileDown className="h-3.5 w-3.5 text-rose-400" />
            <span>Export PDF</span>
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
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 cursor-pointer"
            title="Export full response and citations as JSON"
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>Export .json</span>
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

      {/* Reader Controls Bar: Outline toggle & Font size */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/40 px-4 py-2.5 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          {headings.length > 0 && (
            <button
              type="button"
              onClick={() => setShowOutline(!showOutline)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-200 hover:border-slate-600 hover:text-white transition-colors cursor-pointer"
            >
              <ListTree className="h-3.5 w-3.5 text-indigo-400" />
              <span>Table of Contents ({headings.length})</span>
              {showOutline ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          )}
        </div>

        {/* Text size selector */}
        <div className="flex items-center gap-2">
          <Type className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-[11px] text-slate-400">Typography:</span>
          <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900 p-0.5">
            <button
              type="button"
              onClick={() => setFontSize("standard")}
              className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                fontSize === "standard"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Default
            </button>
            <button
              type="button"
              onClick={() => setFontSize("large")}
              className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                fontSize === "large"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Large
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Table of Contents Drawer/Panel */}
      {showOutline && headings.length > 0 && (
        <nav
          id="report-toc-nav"
          aria-label="Table of Contents"
          className="rounded-xl border border-indigo-500/20 bg-indigo-950/10 p-4 transition-all scroll-mt-20"
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-2.5">
            <Hash className="h-3.5 w-3.5" />
            <span>Document Section Outline</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {headings.map((h, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToHeading(h.id)}
                className={`text-left rounded-lg px-2.5 py-1 text-xs transition-colors truncate cursor-pointer hover:bg-indigo-500/10 hover:text-indigo-200 ${
                  h.level === 1
                    ? "font-semibold text-slate-200"
                    : h.level === 2
                    ? "pl-4 text-slate-300"
                    : "pl-6 text-slate-400"
                }`}
              >
                &bull; {h.text}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Markdown Content Display with Dynamic Anchor Headings */}
      <div
        className={`prose prose-invert max-w-none space-y-4 text-slate-300 leading-relaxed ${
          fontSize === "large" ? "text-base sm:text-lg" : "text-sm sm:text-base"
        } [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-white [&>h1]:border-b [&>h1]:border-slate-800 [&>h1]:pb-2 [&>h1]:mt-6 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:text-indigo-200 [&>h2]:mt-6 [&>h2]:mb-2 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-slate-100 [&>h3]:mt-4 [&>p]:leading-7 [&>p]:text-slate-300 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1 [&>blockquote]:border-l-4 [&>blockquote]:border-indigo-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-400 [&>pre]:rounded-xl [&>pre]:bg-slate-900 [&>pre]:p-4 [&>pre]:border [&>pre]:border-slate-800 [&>code]:rounded [&>code]:bg-slate-900 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:text-indigo-300 [&>code]:text-xs`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => {
              const text = String(children).replace(/[*_`#]/g, "");
              const id = text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
              return (
                <h1 id={id} className="group relative scroll-mt-24">
                  {children}
                  <a
                    href={`#${id}`}
                    aria-label={`Link to ${text}`}
                    className="ml-2 inline-opacity-0 group-hover:opacity-100 text-indigo-400 hover:text-indigo-300 transition-opacity"
                  >
                    #
                  </a>
                </h1>
              );
            },
            h2: ({ children }) => {
              const text = String(children).replace(/[*_`#]/g, "");
              const id = text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
              return (
                <h2 id={id} className="group relative scroll-mt-24">
                  {children}
                  <a
                    href={`#${id}`}
                    aria-label={`Link to ${text}`}
                    className="ml-2 inline-opacity-0 group-hover:opacity-100 text-indigo-400 hover:text-indigo-300 transition-opacity"
                  >
                    #
                  </a>
                </h2>
              );
            },
            h3: ({ children }) => {
              const text = String(children).replace(/[*_`#]/g, "");
              const id = text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
              return (
                <h3 id={id} className="group relative scroll-mt-24">
                  {children}
                  <a
                    href={`#${id}`}
                    aria-label={`Link to ${text}`}
                    className="ml-2 inline-opacity-0 group-hover:opacity-100 text-indigo-400 hover:text-indigo-300 transition-opacity"
                  >
                    #
                  </a>
                </h3>
              );
            },
          }}
        >
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

    {/* Floating Quick Action Dock */}
    {showFloatingDock && (
      <aside
        aria-label="Quick reading actions"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-1.5 rounded-2xl border border-slate-700/80 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl transition-all"
      >
        <div
          title="Scroll Progress"
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-semibold text-indigo-300 border-r border-slate-800"
        >
          <span>{scrollProgress}%</span>
        </div>

        {headings.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setShowOutline(true);
              const outlineEl = document.getElementById("report-toc-nav");
              if (outlineEl) {
                outlineEl.scrollIntoView({ behavior: "smooth" });
              }
            }}
            title="Jump to Table of Contents"
            className="rounded-xl p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <ListTree className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={handleCopy}
          title="Copy Markdown"
          className="rounded-xl p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={handleDownloadWord}
          title="Download Word (.doc) File"
          className="rounded-xl p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <FileText className="h-4 w-4 text-blue-400" />
        </button>

        <button
          type="button"
          onClick={handlePrint}
          title="Print or Save as PDF"
          className="rounded-xl p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <FileDown className="h-4 w-4 text-rose-400" />
        </button>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          title="Scroll back to top"
          className="rounded-xl bg-indigo-600/90 p-2 text-white hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-600/30 cursor-pointer"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </aside>
    )}
  </>
);
};
