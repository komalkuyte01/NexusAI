"use client";

import React from "react";
import { Globe, Layers, BookCheck, Sparkles, ArrowRight } from "lucide-react";
import { ReportType, ResearchRequest } from "@/types";

interface EmptyStateProps {
  onQuickStart: (request: ResearchRequest) => void;
}

const HIGHLIGHTS = [
  {
    icon: Globe,
    title: "Tavily Web Grounding",
    desc: "Autonomous retrieval of verified web citations, research journals, and industry publications.",
  },
  {
    icon: Layers,
    title: "LangChain Multi-Pass Synthesis",
    desc: "Distills complex unstructured search data into structured, coherent sections without hallucination.",
  },
  {
    icon: BookCheck,
    title: "Dual Format Engine",
    desc: "Generate either C-suite Executive Decision Reports or formal Academic Papers with citations.",
  },
];

const SAMPLE_STARTERS: Array<{
  title: string;
  topic: string;
  type: ReportType;
  req: string;
}> = [
  {
    title: "State of Autonomous AI Agents",
    topic: "Enterprise adoption and security architectures of autonomous AI agents in 2026",
    type: "report",
    req: "Focus on multi-agent frameworks, ROI, enterprise security boundaries, and 2026 case studies.",
  },
  {
    title: "Post-Quantum Cryptography Migration",
    topic: "NIST Post-Quantum Cryptography standards and global transition roadmap from RSA/ECC",
    type: "research_paper",
    req: "Include ML-KEM, ML-DSA, hardware acceleration challenges, and hybrid cryptographic schemes.",
  },
  {
    title: "Solid-State Battery Breakthroughs",
    topic: "Solid-state electrolyte advancements and EV manufacturing commercialization in 2026",
    type: "report",
    req: "Compare energy density (Wh/kg), cycle life, manufacturing bottlenecks, and OEM timelines.",
  },
];

export const EmptyState: React.FC<EmptyStateProps> = ({ onQuickStart }) => {
  return (
    <div className="space-y-10 py-6">
      {/* Three Pillar Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {HIGHLIGHTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm transition-all hover:border-slate-700 hover:bg-slate-900/60"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-3 border border-indigo-500/20">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-100">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Launch Cards */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              One-Click Starter Investigations
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">Click to preview topic prompt</span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {SAMPLE_STARTERS.map((starter, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() =>
                onQuickStart({
                  topic: starter.topic,
                  report_type: starter.type,
                  requirements: starter.req,
                })
              }
              className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-left transition-all hover:border-indigo-500/60 hover:bg-slate-900 hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-indigo-300">
                    {starter.type === "research_paper" ? "ACADEMIC" : "EXECUTIVE"}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-indigo-400" />
                </div>
                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white">
                  {starter.title}
                </h4>
                <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">
                  {starter.topic}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
