"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Search, Brain, FileCheck2, Sparkles } from "lucide-react";

interface LoadingStatusProps {
  topic: string;
}

const STEPS = [
  { icon: Search, label: "Formulating deep search queries with Tavily API..." },
  { icon: Sparkles, label: "Scanning web sources and extracting raw citations..." },
  { icon: Brain, label: "Synthesizing intelligence & cross-referencing facts..." },
  { icon: FileCheck2, label: "Formatting executive structure & generating final report..." },
];

export const LoadingStatus: React.FC<LoadingStatusProps> = ({ topic }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white border border-neutral-700 animate-pulse">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Autonomous Agent In Progress
            </h3>
            <p className="text-xs text-neutral-400 max-w-xl truncate">
              Investigating: <span className="text-white font-medium">{topic}</span>
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-neutral-900 border border-neutral-700 px-3 py-1 text-xs text-neutral-200 font-mono">
          <span className="h-2 w-2 rounded-full bg-white animate-ping" />
          Live Research
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`rounded-xl border p-3.5 transition-all flex flex-col justify-between ${
                isCurrent
                  ? "border-white bg-white/10 text-white shadow-sm"
                  : isDone
                  ? "border-neutral-800 bg-neutral-900 text-neutral-300"
                  : "border-neutral-800/40 bg-neutral-950 text-neutral-600"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon
                  className={`h-4 w-4 ${
                    isCurrent ? "text-white animate-bounce" : isDone ? "text-neutral-300" : "text-neutral-600"
                  }`}
                />
                <span className="text-[10px] font-mono font-medium">
                  0{idx + 1}
                </span>
              </div>
              <p className="text-xs font-medium leading-snug">{step.label}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3 text-xs text-neutral-400 flex items-center justify-between">
        <span>Deep web scraping, verification and multi-pass synthesis usually take 15–30 seconds.</span>
      </div>
    </div>
  );
};
