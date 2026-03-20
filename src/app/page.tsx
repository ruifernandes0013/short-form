"use client";

import { useState, useEffect, useCallback } from "react";
import { usePipeline } from "@/hooks/usePipeline";
import { StepIndicator } from "@/components/StepIndicator";
import { ProgressBar } from "@/components/ProgressBar";
import { UploadZone } from "@/components/UploadZone";
import { YouTubeInput } from "@/components/YouTubeInput";
import { ClipsGrid } from "@/components/ClipsGrid";
import { ErrorBanner } from "@/components/ErrorBanner";
import { CreditBadge } from "@/components/CreditBadge";
import { HealthStatus } from "@/types";

type InputTab = "file" | "youtube";

export default function Home() {
  const { state, startWithFile, startWithUrl, reset } = usePipeline();
  const [tab, setTab] = useState<InputTab>("file");
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => {});
  }, []);

  const isActive =
    state.step !== "idle" &&
    state.step !== "done" &&
    state.step !== "error";

  const handleDismissError = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">
                Short Form Studio
              </h1>
              <p className="text-xs text-gray-500">AI-powered clip extraction</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CreditBadge />
            <a href="/pricing" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Plans
            </a>
          </div>
          {health && (!health.ffmpeg || !health.ytdlp) && (
            <div className="text-xs text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg">
              {!health.ffmpeg && "ffmpeg not found · "}
              {!health.ytdlp && "yt-dlp not found "}
              <span className="text-yellow-600">
                brew install{" "}
                {[!health.ffmpeg && "ffmpeg", !health.ytdlp && "yt-dlp"]
                  .filter(Boolean)
                  .join(" ")}
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Step indicator */}
        {state.step !== "idle" && <StepIndicator step={state.step} />}

        {/* Error banner */}
        {state.step === "error" && state.error && (
          <ErrorBanner error={state.error} onDismiss={handleDismissError} />
        )}

        {/* Input card */}
        {state.step !== "done" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                Repurpose Your Video
              </h2>
              <p className="text-gray-500 text-sm">
                Automatically cut the best moments from your video into short-form clips.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-800/60 rounded-lg p-1 w-fit">
              <button
                onClick={() => setTab("file")}
                disabled={isActive}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  tab === "file"
                    ? "bg-gray-700 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                📁 Upload File
              </button>
              <button
                onClick={() => setTab("youtube")}
                disabled={isActive}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  tab === "youtube"
                    ? "bg-gray-700 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                ▶ YouTube Link
              </button>
            </div>

            {/* Input area */}
            {tab === "file" ? (
              <UploadZone onFile={startWithFile} disabled={isActive} />
            ) : (
              <YouTubeInput onUrl={startWithUrl} disabled={isActive} />
            )}

            {/* Progress bar */}
            {isActive && (
              <ProgressBar value={state.progress} label={state.progressLabel} />
            )}

            {/* Status text */}
            {isActive && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                <span>
                  {state.step === "uploading" && "Uploading your video..."}
                  {state.step === "downloading" && "Downloading from YouTube..."}
                  {state.step === "transcribing" &&
                    "Transcribing with Whisper AI — this may take a minute..."}
                  {state.step === "generating" &&
                    "Claude is identifying the best moments..."}
                  {state.step === "clipping" &&
                    "Cutting clips with ffmpeg..."}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {state.step === "done" && state.clips && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-400">
                <span className="text-xl">✓</span>
                <span className="font-semibold">{state.clips.length} clips ready!</span>
              </div>
              <button
                onClick={reset}
                className="text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-all"
              >
                ← New video
              </button>
            </div>

            <ClipsGrid clips={state.clips} />
          </div>
        )}

        {/* Idle footer */}
        {state.step === "idle" && (
          <div className="text-center py-2 text-gray-600 text-xs space-y-1">
            <p>Powered by Claude AI · Groq Whisper · ffmpeg · Runs locally</p>
            <p>Your videos are processed on your machine and never stored remotely</p>
          </div>
        )}
      </div>
    </main>
  );
}
