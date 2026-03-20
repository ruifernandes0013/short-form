"use client";

import { useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import { usePipeline } from "@/hooks/usePipeline";
import { UploadZone } from "@/components/UploadZone";
import { YouTubeInput } from "@/components/YouTubeInput";
import { ClipsGrid } from "@/components/ClipsGrid";
import { StepIndicator } from "@/components/StepIndicator";

interface AppShellProps {
  user: { name: string | null; email: string; image: string | null };
  initialCredits: number;
  plan: "FREE" | "CREATOR" | "PRO";
}

type InputTab = "file" | "youtube";

const STEP_LABELS: Record<string, string> = {
  uploading: "Uploading...",
  downloading: "Downloading from YouTube...",
  transcribing: "Transcribing audio...",
  generating: "Finding the best moments...",
  clipping: "Cutting clips...",
};

export function AppShell({ user, initialCredits, plan }: AppShellProps) {
  const { state, startWithFile, startWithUrl, reset } = usePipeline();
  const [tab, setTab] = useState<InputTab>("file");
  const [credits, setCredits] = useState(initialCredits);
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive =
    state.step !== "idle" && state.step !== "done" && state.step !== "error";

  const handleDone = useCallback(() => {
    setCredits((c) => Math.max(0, c - 1));
    reset();
  }, [reset]);

  // suppress unused warning — plan is available for future use
  void plan;

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-60 -right-40 w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[120px]" />
        <div className="absolute bottom-0 -left-40 w-[400px] h-[400px] rounded-full bg-indigo-600/6 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/[0.06] sticky top-0 z-20 bg-[#080810]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-5 flex items-center justify-between" style={{ height: "52px" }}>
          <span className="font-semibold text-white tracking-tight">Short Form</span>

          <div className="flex items-center gap-2">
            {/* Credits — display only */}
            <span
              className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border select-none ${
                credits <= 0
                  ? "border-red-500/30 text-red-400"
                  : "border-white/8 text-gray-500"
              }`}
            >
              <span className="tabular-nums font-medium">{credits}</span>
              <span>credit{credits !== 1 ? "s" : ""}</span>
            </span>

            {/* Avatar dropdown */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors"
              >
                {user.image ? (
                  <img src={user.image} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white text-[10px] font-semibold">
                    {(user.name ?? user.email)[0].toUpperCase()}
                  </div>
                )}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
                  <path d="M2 3.5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#111] border border-white/8 rounded-xl shadow-2xl overflow-hidden z-20">
                    <div className="px-3.5 py-3 border-b border-white/6">
                      <p className="text-white text-sm font-medium truncate">{user.name ?? user.email}</p>
                      {user.name && <p className="text-gray-600 text-xs truncate mt-0.5">{user.email}</p>}
                    </div>
                    <a
                      href="/account"
                      className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="6.5" cy="4" r="2.5"/>
                        <path d="M1 12c0-3 2.5-4.5 5.5-4.5S12 9 12 12" strokeLinecap="round"/>
                      </svg>
                      My account
                    </a>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M8.5 1.5H11a.5.5 0 01.5.5v9a.5.5 0 01-.5.5H8.5M5.5 9.5L8.5 6.5l-3-3M8.5 6.5H1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative flex-1 max-w-4xl mx-auto w-full px-5 py-10 space-y-5">

        {/* Error */}
        {state.step === "error" && state.error && (
          <div className="flex items-start gap-3 bg-red-500/8 border border-red-500/20 rounded-xl p-4">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" className="text-red-400 mt-0.5 shrink-0">
              <path d="M7.5 1a6.5 6.5 0 100 13A6.5 6.5 0 007.5 1zM6.75 4.5a.75.75 0 011.5 0v3.25a.75.75 0 01-1.5 0V4.5zm.75 6a.875.875 0 110-1.75.875.875 0 010 1.75z"/>
            </svg>
            <p className="text-red-300 text-sm flex-1 leading-relaxed">{state.error}</p>
            <button onClick={() => reset()} className="text-red-600 hover:text-red-400 transition-colors text-xl leading-none mt-0.5">×</button>
          </div>
        )}

        {/* Input area */}
        {state.step !== "done" && (
          <div>
            {!isActive && (
              <div className="mb-5">
                <h1 className="text-xl font-semibold text-white">Extract clips</h1>
                <p className="text-gray-500 text-sm mt-1">Upload a video or paste a YouTube URL to cut the best moments.</p>
              </div>
            )}

            {/* Progress */}
            {isActive && (
              <div className="bg-white/[0.03] border border-white/6 rounded-2xl p-6 space-y-5">
                <StepIndicator step={state.step} />
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{STEP_LABELS[state.step] ?? state.progressLabel}</span>
                    <span className="tabular-nums">{Math.round(state.progress)}%</span>
                  </div>
                  <div className="h-px bg-white/6 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${state.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tabs + input */}
            {!isActive && (
              <div className="space-y-4">
                <div className="flex gap-0.5 bg-white/[0.04] rounded-lg p-0.5 w-fit">
                  {(["file", "youtube"] as InputTab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                        tab === t
                          ? "bg-white/10 text-white"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {t === "file" ? "Upload" : "YouTube"}
                    </button>
                  ))}
                </div>

                {tab === "file" ? (
                  <UploadZone onFile={startWithFile} disabled={isActive || credits === 0} />
                ) : (
                  <YouTubeInput onUrl={startWithUrl} disabled={isActive || credits === 0} />
                )}

                {credits === 0 && (
                  <p className="text-sm text-gray-500">
                    No credits left.{" "}
                    <a href="/pricing" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">
                      Upgrade to continue
                    </a>
                    .
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {state.step === "done" && state.clips && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {state.clips.length} clip{state.clips.length !== 1 ? "s" : ""} ready
                </h2>
                <p className="text-gray-500 text-sm mt-0.5">Download or preview below.</p>
              </div>
              <button
                onClick={handleDone}
                className="text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/8 px-4 py-2 rounded-lg transition-all"
              >
                New job
              </button>
            </div>
            <ClipsGrid clips={state.clips} />
          </div>
        )}
      </main>

      {/* Floating upgrade button — always visible */}
      <a
        href="/pricing"
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg shadow-violet-900/30 transition-all hover:-translate-y-0.5"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6.5 1.5v10M2 5.5l4.5-4 4.5 4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Upgrade
      </a>
    </div>
  );
}
