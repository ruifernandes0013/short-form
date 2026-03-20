"use client";

import { PipelineStep } from "@/types";
import { clsx } from "clsx";

const STEPS: { id: PipelineStep; label: string; icon: string }[] = [
  { id: "uploading", label: "Upload", icon: "⬆" },
  { id: "transcribing", label: "Transcribe", icon: "🎙" },
  { id: "generating", label: "Identify", icon: "✨" },
  { id: "clipping", label: "Cut", icon: "✂" },
  { id: "done", label: "Done", icon: "✓" },
];

const STEP_ORDER = ["uploading", "downloading", "transcribing", "generating", "clipping", "done"];

function getStepState(
  stepId: string,
  currentStep: PipelineStep
): "idle" | "active" | "done" | "error" {
  if (currentStep === "error") return "idle";
  if (currentStep === "idle") return "idle";

  const currentIdx = STEP_ORDER.indexOf(
    currentStep === "downloading" ? "uploading" : currentStep
  );
  const stepIdx = STEP_ORDER.indexOf(stepId);

  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "idle";
}

export function StepIndicator({ step }: { step: PipelineStep }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((s, i) => {
        const state = getStepState(s.id, step);
        return (
          <div key={s.id} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                  {
                    "bg-gray-800 text-gray-500": state === "idle",
                    "bg-violet-600 text-white ring-4 ring-violet-600/30 scale-110": state === "active",
                    "bg-green-600 text-white": state === "done",
                    "bg-red-600 text-white": state === "error",
                  }
                )}
              >
                {state === "done" ? "✓" : s.icon}
              </div>
              <span
                className={clsx("text-xs", {
                  "text-gray-600": state === "idle",
                  "text-violet-400 font-semibold": state === "active",
                  "text-green-400": state === "done",
                })}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={clsx("w-12 h-0.5 mb-5 transition-all duration-300", {
                  "bg-gray-800": state !== "done",
                  "bg-green-600": state === "done",
                })}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
