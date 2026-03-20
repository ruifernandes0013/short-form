"use client";

import { PipelineStep } from "@/types";

const STEPS: { id: PipelineStep; label: string }[] = [
  { id: "uploading",   label: "Upload"     },
  { id: "transcribing", label: "Transcribe" },
  { id: "generating",  label: "Identify"   },
  { id: "clipping",    label: "Cut"        },
  { id: "done",        label: "Done"       },
];

const STEP_ORDER = ["uploading", "downloading", "transcribing", "generating", "clipping", "done"];

function getState(id: string, current: PipelineStep): "idle" | "active" | "done" {
  if (current === "idle" || current === "error") return "idle";
  const cur = STEP_ORDER.indexOf(current === "downloading" ? "uploading" : current);
  const idx = STEP_ORDER.indexOf(id);
  if (idx < cur) return "done";
  if (idx === cur) return "active";
  return "idle";
}

export function StepIndicator({ step }: { step: PipelineStep }) {
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((s, i) => {
        const state = getState(s.id, step);
        return (
          <div key={s.id} className="flex items-center gap-1 flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 min-w-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                state === "active"
                  ? "bg-violet-600 ring-4 ring-violet-600/20 scale-110"
                  : state === "done"
                  ? "bg-green-600"
                  : "bg-gray-800"
              }`}>
                {state === "done" ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2">
                    <path d="M2 5l2.5 2.5L8 3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : state === "active" ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                )}
              </div>
              <span className={`text-xs font-medium transition-colors ${
                state === "active" ? "text-violet-400" :
                state === "done"   ? "text-green-400"  : "text-gray-700"
              }`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mb-4 transition-colors duration-500 ${
                state === "done" ? "bg-green-700" : "bg-gray-800"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
