"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Check } from "lucide-react";

interface LoadingStatusProps {
  topic: string;
}

const STEPS = [
  "Searching web sources",
  "Extracting evidence & citations",
  "Synthesizing findings",
  "Formatting final report",
];

export const LoadingStatus: React.FC<LoadingStatusProps> = ({ topic }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 4500);
    return () => clearInterval(stepInterval);
  }, []);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#101216] p-5 sm:p-6 space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-neutral-300" />
          <div>
            <h3 className="text-sm font-semibold text-white">Researching</h3>
            <p className="text-xs text-neutral-400 truncate max-w-sm font-sans mt-0.5">
              &ldquo;{topic}&rdquo;
            </p>
          </div>
        </div>
        <span className="font-mono text-xs text-neutral-400">
          {formatTimer(secondsElapsed)}
        </span>
      </div>

      {/* Steps List */}
      <div className="space-y-2 pt-2 border-t border-white/[0.06]">
        {STEPS.map((stepText, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-2.5 text-xs transition-colors ${
                isCurrent
                  ? "text-white font-medium"
                  : isDone
                  ? "text-neutral-500"
                  : "text-neutral-600"
              }`}
            >
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                  isDone
                    ? "bg-white/10 text-neutral-400"
                    : isCurrent
                    ? "border border-white/40 text-white"
                    : "border border-white/10 text-neutral-600"
                }`}
              >
                {isDone ? <Check className="h-2.5 w-2.5" /> : idx + 1}
              </div>
              <span>{stepText}</span>
              {isCurrent && (
                <span className="inline-block h-1 w-1 rounded-full bg-white animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


