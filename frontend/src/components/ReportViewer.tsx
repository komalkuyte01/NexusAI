"use client";

import React, { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Check,
  FileText,
  Calendar,
  RotateCcw,
  Bookmark,
  BookmarkCheck,
  ListTree,
  ChevronDown,
  ChevronUp,
  Clock,
  Hash,
  Type,
  ArrowUp,
  FileDown,
  ShieldCheck,
  ExternalLink,
  Pin,
} from "lucide-react";
import { ResearchResponse } from "@/types";
import { generatePublicationPdf, getDocumentFileSlug } from "@/lib/generatePdf";

interface ReportViewerProps {
  report: ResearchResponse;
  onReset: () => void;
  onSave?: (report: ResearchResponse) => void;
  isSaved?: boolean;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Transforms raw prompt topics into a clean, publication-grade proper title.
 */
export function formatProperHeading(rawTopic: string): string {
  if (!rawTopic) return "Research Report";

  // Strip conversational prompt prefixes
  let cleaned = rawTopic.trim().replace(
    /^(please\s+)?(generate\s+(info|information|a\s+report|an\s+analysis)?\s+(on|about)?|write\s+(a\s+report|an\s+essay|an\s+analysis|about)?\s+(on|about)?|tell\s+me\s+about|research\s+(on|about)?|give\s+me\s+(info|information|details)\s+(on|about)?|what\s+is\s+the\s+condition\s+of|what\s+is|what\s+are|overview\s+of)\s+/i,
    ""
  ).trim();

  // Strip word count requests (e.g. "5000 words", "5k words", "with 4000 words")
  cleaned = cleaned.replace(/(?:(?:with|in|around|about|approximately|target|of|min|at\s+least)\s+)?(\d+(?:,\d+)?|\d+(?:\.\d+)?k)\s*(?:[- ]?\s*(?:words?|w\b))/gi, "").trim();

  // Strip custom outline/sections suffix (e.g. "with sections: ...")
  cleaned = cleaned.replace(/(?:with\s+sections?|custom\s+sections?|custom\s+outline|sections?:\s*)\s*[:\-]?\s*(.+)$/i, "").trim();

  // Strip conversational suffixes (e.g. "report give me", "5000 words report give me", "give me", "please")
  cleaned = cleaned.replace(/\s+(?:report|research\s+paper|paper|essay|analysis|summary)?\s*(?:give\s+me|please|thanks)?\s*$/i, "").trim();
  cleaned = cleaned.replace(/\s+(?:with|in|for|on|about)$/i, "").trim();

  if (!cleaned) cleaned = rawTopic.trim();

  // Safely separate accidentally concatenated prepositions (e.g. "Politicsof India" -> "Politics of India")
  cleaned = cleaned.replace(/\b([a-zA-Z]{4,})of(?=\s+[A-Z])/gi, (match, base) => {
    if (/^(proof|roof|spoof|aloof|whereof|thereof)$/i.test(match)) {
      return match;
    }
    return `${base} of`;
  });

  const minorWords = new Set([
    "a", "an", "and", "as", "at", "but", "by", "for", "in", "nor", "of", "on", "or", "so", "the", "to", "up", "with", "yet"
  ]);

  const acronyms: Record<string, string> = {
    ai: "AI",
    ml: "ML",
    ev: "EV",
    evs: "EVs",
    nist: "NIST",
    api: "API",
    apis: "APIs",
    iot: "IoT",
    gpu: "GPU",
    gpus: "GPUs",
    llm: "LLM",
    llms: "LLMs",
    covid: "COVID",
    crispr: "CRISPR",
    rsa: "RSA",
    dna: "DNA",
    tam: "TAM",
    swot: "SWOT",
    roi: "ROI",
    cagr: "CAGR",
    usd: "USD",
  };

  const words = cleaned.split(/\s+/);
  const formatted = words.map((w, idx) => {
    const rawClean = w.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (acronyms[rawClean]) {
      return w.replace(new RegExp(rawClean, "i"), acronyms[rawClean]);
    }
    if (idx !== 0 && idx !== words.length - 1 && minorWords.has(rawClean)) {
      return w.toLowerCase();
    }
    return w.charAt(0).toUpperCase() + w.slice(1);
  });

  return formatted.join(" ");
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

  // Headings in monochrome
  html = html.replace(/^### (.*$)/gim, '<h3 style="color:#262626; margin-top:14pt; font-size:13pt;">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="color:#000000; margin-top:18pt; font-size:16pt; border-bottom:1pt solid #737373; padding-bottom:4pt;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="color:#000000; margin-top:10pt; font-size:22pt; border-bottom:2pt solid #000000; padding-bottom:6pt;">$1</h1>');

  // Blockquotes in monochrome
  html = html.replace(/^>\s?(.*$)/gim, '<blockquote style="border-left:3pt solid #000000; margin:10pt 0; padding:6pt 12pt; background:#f5f5f5; color:#262626; font-style:italic;">$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');
  html = html.replace(/_(.*?)_/gim, '<em>$1</em>');

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" style="color:#000000; text-decoration:underline; font-weight:bold;">$1</a>');

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
  isPinned = false,
  onTogglePin,
}) => {
  const [copied, setCopied] = useState(false);
  const [showOutline, setShowOutline] = useState(true);
  const [fontSize, setFontSize] = useState<"standard" | "large">("standard");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showFloatingDock, setShowFloatingDock] = useState(false);
  const [showClaimAudit, setShowClaimAudit] = useState(false);

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

  const properTitle = useMemo(() => {
    return formatProperHeading(report.topic);
  }, [report.topic]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadWord = () => {
    const isAcademic = report.report_type === "research_paper";
    const fileSlug = getDocumentFileSlug(report.topic);
    const suffix = isAcademic ? "research-paper" : "report";
    const filename = `${fileSlug}-${suffix}.doc`;
    
    const docHtml = isAcademic
      ? `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${properTitle}</title>
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
          body { font-family: 'Times New Roman', Times, Georgia, serif; font-size: 12pt; line-height: 1.5; color: #000000; margin: 0; text-align: justify; text-justify: inter-word; }
          h1 { font-family: 'Times New Roman', Times, serif; font-size: 18pt; text-align: center; margin-bottom: 12pt; font-weight: bold; color: #000000; }
          .academic-meta { text-align: center; font-size: 11pt; color: #333333; margin-bottom: 18pt; line-height: 1.4; }
          h2 { font-family: 'Times New Roman', Times, serif; font-size: 14pt; margin-top: 18pt; margin-bottom: 6pt; font-weight: bold; border-bottom: 1pt solid #737373; padding-bottom: 3pt; color: #000000; }
          h3 { font-family: 'Times New Roman', Times, serif; font-size: 12pt; margin-top: 14pt; margin-bottom: 4pt; font-weight: bold; color: #000000; }
          p { font-size: 12pt; line-height: 1.5; margin-bottom: 12pt; text-align: justify; text-justify: inter-word; }
        </style>
      </head>
      <body>
        <div style="margin-bottom: 24pt;">
          <h1>${properTitle}</h1>
          <div class="academic-meta">
            <strong>NexusAI Autonomous AI Synthesis System</strong><br/>
            Autonomous Web Intelligence & Empirical Synthesis Lab<br/>
            <em>Synthesized via Grounded Autonomous Research Engine &middot; ~${wordCount} words</em>
          </div>
          <hr style="border: 0; border-top: 1pt solid #737373; margin-bottom: 16pt;" />
        </div>
        <div>
          ${markdownToDocHtml(report.content)}
        </div>
      </body>
      </html>
    `
      : `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${properTitle}</title>
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
          body { font-family: 'Times New Roman', Times, Georgia, serif; font-size: 12pt; line-height: 1.5; color: #000000; margin: 0; text-align: justify; text-justify: inter-word; }
          h1 { font-family: 'Times New Roman', Times, serif; font-size: 18pt; text-align: center; margin-bottom: 10pt; font-weight: bold; color: #000000; }
          h2 { font-family: 'Times New Roman', Times, serif; font-size: 14pt; margin-top: 18pt; margin-bottom: 6pt; font-weight: bold; border-bottom: 1pt solid #000000; padding-bottom: 2pt; color: #000000; }
          h3 { font-family: 'Times New Roman', Times, serif; font-size: 12pt; margin-top: 14pt; margin-bottom: 4pt; font-weight: bold; color: #000000; }
          p { font-size: 12pt; line-height: 1.5; margin-bottom: 12pt; text-align: justify; text-justify: inter-word; }
        </style>
      </head>
      <body>
        <div style="margin-bottom: 20pt; border-bottom: 2pt solid #000000; padding-bottom: 12pt; text-align: center;">
          <h1 style="font-size: 18pt; color: #000000; margin-bottom: 6pt; font-weight: bold;">${properTitle}</h1>
          <p style="font-size: 10.5pt; color: #525252; margin: 0; text-align: center;">
            <strong>Document Type:</strong> Executive Decision Report &middot; 
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

  const handleExportPdf = () => {
    generatePublicationPdf(report);
  };

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const formattedDate = useMemo(() => {
    try {
      const dateObj = report.created_at ? new Date(report.created_at) : new Date();
      if (isNaN(dateObj.getTime())) return "Recently synthesized";

      const datePart = dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const timePart = dateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return `${datePart} · ${timePart}`;
    } catch {
      return new Date().toLocaleDateString();
    }
  }, [report.created_at]);

  const hasContentH1 = useMemo(() => /^#\s+/m.test(report.content), [report.content]);

  return (
    <>
      {/* Top Reading Progress Bar (Hidden in Print) */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-neutral-900 pointer-events-none no-print print:hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-white transition-all duration-150 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <article className="rounded-3xl border border-white/[0.12] bg-[#0c0e14]/90 p-6 sm:p-10 md:p-[1in] backdrop-blur-2xl shadow-[0_24px_70px_rgba(0,0,0,0.7)] space-y-6 print:bg-white print:border-none print:shadow-none print:p-0 print:m-0 print:space-y-4 relative overflow-hidden font-serif">
        {/* Glow ambient highlight */}
        <div className="pointer-events-none absolute -top-px left-16 right-16 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70" />

        {/* Top Actions Toolbar (Hidden in Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4 no-print print:hidden">
          {/* Document Type Badge */}
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-300 font-sans">
              {report.report_type === "research_paper" ? "Academic Research Paper" : "Research Report"}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {onSave && (
              <button
                type="button"
                onClick={() => onSave(report)}
                disabled={isSaved}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  isSaved
                    ? "border-white/30 bg-white/15 text-white cursor-default shadow-sm"
                    : "border-white/[0.08] bg-neutral-900/90 text-neutral-200 hover:border-white/20 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="h-3.5 w-3.5 text-white" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Save</span>
                  </>
                )}
              </button>
            )}

            {onTogglePin && (
              <button
                type="button"
                onClick={onTogglePin}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  isPinned
                    ? "border-white bg-white text-black shadow-sm"
                    : "border-white/[0.08] bg-neutral-900/90 text-neutral-300 hover:border-white/20 hover:text-white hover:bg-neutral-800"
                }`}
                title={isPinned ? "Unpin this chat" : "Pin this chat to top of history"}
              >
                <Pin className={`h-3.5 w-3.5 ${isPinned ? "fill-black text-black" : "text-neutral-400"}`} />
                <span>{isPinned ? "Pinned" : "Pin"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-neutral-900/90 px-3 py-1.5 text-xs font-semibold text-neutral-200 transition-all hover:border-white/20 hover:bg-neutral-800 hover:text-white cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5 text-neutral-400" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadWord}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-neutral-900/90 px-3 py-1.5 text-xs font-semibold text-neutral-200 transition-all hover:border-white/20 hover:bg-neutral-800 hover:text-white cursor-pointer shadow-sm"
              title="Download formatted Microsoft Word (.doc) file"
            >
              <FileText className="h-3.5 w-3.5 text-neutral-300" />
              <span>Word (.doc)</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white text-black px-3.5 py-1.5 text-xs font-bold transition-all hover:bg-neutral-200 cursor-pointer shadow-md active:scale-95"
              title="Download clean publication-grade PDF"
            >
              <FileDown className="h-3.5 w-3.5 text-black" />
              <span>Export PDF</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-neutral-900/90 px-3 py-1.5 text-xs font-semibold text-neutral-300 transition-all hover:border-white/20 hover:bg-neutral-800 hover:text-white cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-neutral-400" />
              <span>New Research</span>
            </button>
          </div>
        </div>

        {/* Document Publication Title & Meta Header */}
        <div className={`space-y-3 pt-2 text-center ${hasContentH1 ? "print:hidden" : "print:mb-4"}`}>
          {/* Main Title: 18pt, bold, centered */}
          <h1 className="text-[18pt] font-bold text-center tracking-tight text-white print:text-black leading-tight font-serif max-w-3xl mx-auto">
            {properTitle}
          </h1>

          {/* Clean, perfectly aligned metadata row */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-neutral-400 font-serif">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Calendar className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <span>{formattedDate}</span>
            </span>
            <span className="text-neutral-600">&middot;</span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Clock className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <span>{readingTime} min read (~{wordCount} words)</span>
            </span>
          </div>

          {report.report_type === "research_paper" ? (
            <div className="text-center text-xs text-neutral-400 space-y-0.5 pt-1">
              <p className="text-neutral-200 font-serif font-medium">NexusAI Autonomous AI Synthesis System</p>
              <p className="text-neutral-500 font-serif text-[11px]">Autonomous Web Intelligence &amp; Empirical Synthesis Lab</p>
            </div>
          ) : (
            <div className="mx-auto h-px w-20 bg-white/15 mt-3 print:hidden" />
          )}
        </div>

        {/* Reader Controls Bar: Outline toggle & Font size (Hidden in Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-xs text-neutral-300 no-print print:hidden backdrop-blur-md">
          <div className="flex items-center gap-2">
            {headings.length > 0 && (
              <button
                type="button"
                onClick={() => setShowOutline(!showOutline)}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs text-neutral-200 hover:border-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                <ListTree className="h-3.5 w-3.5 text-white" />
                <span>Table of Contents ({headings.length})</span>
                {showOutline ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>

          {/* Text size selector */}
          <div className="flex items-center gap-2">
            <Type className="h-3.5 w-3.5 text-neutral-500" />
            <span className="text-[11px] text-neutral-400">Typography:</span>
            <div className="inline-flex rounded-lg border border-neutral-800 bg-neutral-950 p-0.5">
              <button
                type="button"
                onClick={() => setFontSize("standard")}
                className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                  fontSize === "standard"
                    ? "bg-white text-black shadow-sm font-semibold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Default
              </button>
              <button
                type="button"
                onClick={() => setFontSize("large")}
                className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                  fontSize === "large"
                    ? "bg-white text-black shadow-sm font-semibold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Large
              </button>
            </div>
          </div>
        </div>

        {/* Verification & Quality Audit Bar (Hidden in Print) */}
        {report.metrics && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 no-print print:hidden backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-white tracking-tight">Evidence Verification Audit</span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <span className="rounded-lg border border-white/10 bg-neutral-900/80 px-2.5 py-1 text-neutral-200 font-mono text-[11px]">
                  Claim Support: <strong className="text-white">{report.metrics.claim_support_rate}%</strong>
                </span>
                <span className="rounded-lg border border-white/10 bg-neutral-900/80 px-2.5 py-1 text-neutral-200 font-mono text-[11px]">
                  Citation Precision: <strong className="text-white">{report.metrics.citation_precision}%</strong>
                </span>
                <span className="rounded-lg border border-white/10 bg-neutral-900/80 px-2.5 py-1 text-neutral-200 font-mono text-[11px]">
                  Verified Sources: <strong className="text-white">{report.metrics.source_verification_rate}%</strong>
                </span>
                {report.claims && report.claims.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowClaimAudit(!showClaimAudit)}
                    className="text-xs text-cyan-300 hover:text-cyan-200 underline font-medium cursor-pointer ml-1"
                  >
                    {showClaimAudit ? "Hide Audit Details" : `Audit Trail (${report.claims.length})`}
                  </button>
                )}
              </div>
            </div>

            {/* Expandable Claim Details */}
            {showClaimAudit && report.claims && report.claims.length > 0 && (
              <div className="mt-4 space-y-2.5 border-t border-white/[0.08] pt-3.5 text-xs">
                {report.claims.map((c, idx) => (
                  <div key={idx} className="rounded-xl bg-black/60 p-3 border border-white/[0.06]">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-semibold text-white">Claim {idx + 1}: &ldquo;{c.claim}&rdquo;</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        c.verification_status === "Verified"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : c.verification_status === "Partially Verified"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-neutral-800 text-neutral-300 border border-white/10"
                      }`}>
                        {c.verification_status}
                      </span>
                    </div>
                    <p className="text-neutral-300 text-[11px] leading-relaxed">
                      <strong className="text-neutral-100">Evidence Grounding:</strong> {c.evidence}
                    </p>
                    {c.source_url && (
                      <a
                        href={c.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 hover:underline inline-flex items-center gap-1 mt-1.5 font-mono"
                      >
                        Source Link <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Interactive Table of Contents Drawer/Panel (Hidden in Print) */}
        {showOutline && headings.length > 0 && (
          <nav
            id="report-toc-nav"
            aria-label="Table of Contents"
            className="rounded-2xl border border-white/[0.08] bg-black/40 p-4 transition-all scroll-mt-20 no-print print:hidden backdrop-blur-md"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-300 mb-3">
              <Hash className="h-3.5 w-3.5 text-cyan-400" />
              <span>Document Section Outline</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {headings.map((h, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToHeading(h.id)}
                  className={`text-left rounded-lg px-3 py-1.5 text-xs transition-all truncate cursor-pointer hover:bg-white/[0.06] hover:text-white ${
                    h.level === 1
                      ? "font-bold text-white"
                      : h.level === 2
                      ? "pl-4 text-neutral-300 font-medium"
                      : "pl-6 text-neutral-400"
                  }`}
                >
                  &bull; {h.text}
                </button>
              ))}
            </div>
          </nav>
        )}

        {/* Markdown Content Display with Academic Formatting */}
        <div
          className="prose prose-invert max-w-none text-neutral-200 font-serif text-[12pt] leading-[1.5] text-justify print:prose-neutral print:text-black print:text-[12pt]"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <p className="text-[12pt] leading-[1.5] text-justify text-neutral-200 print:text-black mb-4 font-serif">
                  {children}
                </p>
              ),
              h1: ({ children }) => {
                const text = String(children).replace(/[*_`#]/g, "").trim();
                const id = text
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "");
                return (
                  <h1
                    id={id}
                    className="group relative scroll-mt-24 text-[18pt] font-bold text-center tracking-tight text-white print:text-black border-b border-white/[0.08] print:border-neutral-300 pb-2 mt-8 mb-4 break-after-avoid font-serif"
                  >
                    <span>{children}</span>
                  </h1>
                );
              },
              h2: ({ children }) => {
                const text = String(children).replace(/[*_`#]/g, "").trim();
                const id = text
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "");
                return (
                  <h2
                    id={id}
                    className="group relative scroll-mt-24 text-[14pt] font-bold text-left tracking-tight text-white print:text-black border-b border-white/[0.08] print:border-neutral-300 pb-1 mt-6 mb-3 break-after-avoid font-serif"
                  >
                    <span>{children}</span>
                  </h2>
                );
              },
              h3: ({ children }) => {
                const text = String(children).replace(/[*_`#]/g, "").trim();
                const id = text
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "");
                return (
                  <h3
                    id={id}
                    className="group relative scroll-mt-24 text-[12pt] font-bold text-left text-neutral-100 print:text-black mt-5 mb-2 break-after-avoid font-serif"
                  >
                    <span>{children}</span>
                  </h3>
                );
              },
              li: ({ children }) => (
                <li className="text-[12pt] leading-[1.5] text-neutral-200 print:text-black my-1 font-serif">
                  {children}
                </li>
              ),
              table: ({ children }) => (
                <div className="my-6 w-full overflow-x-auto rounded-xl border border-white/10 bg-black/40">
                  <table className="w-full text-left text-xs sm:text-sm text-neutral-200 divide-y divide-white/10">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="bg-white/[0.05] px-4 py-3 font-bold text-white tracking-tight">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-2.5 text-neutral-300 border-t border-white/[0.05] leading-normal">
                  {children}
                </td>
              ),
              blockquote: ({ children }) => (
                <blockquote className="my-4 border-l-2 border-white/40 bg-white/[0.02] py-2 px-4 italic text-neutral-200 rounded-r-xl">
                  {children}
                </blockquote>
              ),
            }}
          >
            {report.content}
          </ReactMarkdown>
        </div>

        {/* Footer info banner (Hidden in Print) */}
        <div className="border-t border-white/[0.08] pt-4 flex items-center justify-between text-xs text-neutral-400 no-print print:hidden">
          <span className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-neutral-400" />
            Generated autonomously with verified web search grounding
          </span>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="hover:text-white transition-colors cursor-pointer font-medium"
          >
            Back to top &uarr;
          </button>
        </div>
      </article>

      {/* Floating Quick Action Dock (Hidden in Print) */}
      {showFloatingDock && (
        <aside
          aria-label="Quick reading actions"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-1.5 rounded-2xl border border-white/[0.14] bg-[#0c0e14]/95 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all no-print print:hidden"
        >
          <div
            title="Scroll Progress"
            className="flex items-center gap-1 px-3 py-1 text-xs font-mono font-bold text-white border-r border-white/10"
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
              className="rounded-xl p-2 text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
            >
              <ListTree className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            title="Copy Markdown"
            className="rounded-xl p-2 text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4 text-white" /> : <Copy className="h-4 w-4" />}
          </button>

          {onTogglePin && (
            <button
              type="button"
              onClick={onTogglePin}
              title={isPinned ? "Unpin Chat" : "Pin Chat to Top"}
              className={`rounded-xl p-2 transition-colors cursor-pointer ${
                isPinned
                  ? "text-black bg-white hover:bg-neutral-200 shadow-sm"
                  : "text-neutral-300 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <Pin className={`h-4 w-4 ${isPinned ? "fill-black" : ""}`} />
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadWord}
            title="Download Word (.doc) File"
            className="rounded-xl p-2 text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
          >
            <FileText className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            title="Download clean Word-like PDF document"
            className="rounded-xl p-2 text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
          >
            <FileDown className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            title="Scroll back to top"
            className="rounded-xl bg-white p-2 text-black hover:bg-neutral-200 transition-colors shadow-lg cursor-pointer"
          >
            <ArrowUp className="h-4 w-4 stroke-[2.5]" />
          </button>
        </aside>
      )}
    </>
  );
};
