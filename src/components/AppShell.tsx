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
}

type InputTab = "file" | "youtube";

const STEP_LABELS: Record<string, string> = {
  uploading: "Uploading video...",
  downloading: "Downloading from YouTube...",
  transcribing: "Transcribing audio with Whisper...",
  generating: "Identifying best moments with Claude...",
  clipping: "Cutting clips...",
};

export function AppShell({ user, initialCredits }: AppShellProps) {
  const { state, startWithFile, startWithUrl, reset } = usePipeline();
  const [tab, setTab] = useState<InputTab>("file");
  const [credits, setCredits] = useState(initialCredits);
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive =
    state.step !== "idle" && state.step !== "done" && state.step !== "error";

  const handleDismissError = useCallback(() => reset(), [reset]);

  const handleDone = useCallback(() => {
    setCredits((c) => Math.max(0, c - 1));
    reset();
  }, [reset]);

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 12L7 2L12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 8.5H10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-semibold text-white text-sm">Short Form Studio</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Credits */}
            <a
              href="/pricing"
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                credits <= 1
                  ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  : "border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700"
              }`}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className={credits <= 1 ? "text-red-400" : "text-violet-400"}>
                <polygon points="5,0 6.5,3.5 10,4 7.5,6.5 8,10 5,8 2,10 2.5,6.5 0,4 3.5,3.5"/>
              </svg>
              <span className="font-medium tabular-nums">{credits}</span>
              <span className="text-gray-600">credits</span>
            </a>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 hover:bg-gray-800 rounded-lg px-2 py-1.5 transition-colors"
              >
                {user.image ? (
                  <img src={user.image} alt={user.name ?? ""} className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                )}
                <span className="text-gray-300 text-sm hidden sm:block">
                  {user.name ?? user.email}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="text-gray-600">
                  <path d="M2 4l4 4 4-4"/>
                </svg>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden z-20">
                    <div className="px-3 py-2.5 border-b border-gray-800">
                      <p className="text-white text-sm font-medium truncate">{user.name}</p>
                      <p className="text-gray-500 text-xs truncate">{user.email}</p>
                    </div>
                    <a
                      href="/pricing"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="1" y="1" width="12" height="12" rx="2"/>
                        <path d="M4 7h6M7 4v6"/>
                      </svg>
                      Manage plan
                    </a>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 1H12a1 1 0 011 1v10a1 1 0 01-1 1H9M6 10l3-3-3-3M9 7H1"/>
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
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-6">

        {/* Error */}
        {state.step === "error" && state.error && (
          <div className="flex items-start gap-3 bg-red-950/60 border border-red-800/60 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-red-400 mt-0.5 shrink-0">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0V5zm.75 6.5a1 1 0 110-2 1 1 0 010 2z"/>
            </svg>
            <p className="text-red-300 text-sm flex-1 leading-relaxed">{state.error}</p>
            <button onClick={handleDismissError} className="text-red-600 hover:text-red-400 transition-colors text-lg leading-none">×</button>
          </div>
        )}

        {/* Input card */}
        {state.step !== "done" && (
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl overflow-hidden">
            {/* Card header */}
            {!isActive && (
              <div className="px-6 pt-6 pb-4 border-b border-white/5">
                <h2 className="text-lg font-semibold text-white">New clip job</h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  Upload a video file or paste a YouTube link to extract the best moments.
                </p>
              </div>
            )}

            <div className="p-6 space-y-5">
              {/* Progress */}
              {isActive && (
                <div className="space-y-4">
                  <StepIndicator step={state.step} />
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{STEP_LABELS[state.step] ?? state.progressLabel}</span>
                      <span className="tabular-nums">{Math.round(state.progress)}%</span>
                    </div>
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${state.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tabs + inputs */}
              {!isActive && (
                <div className="space-y-4">
                  <div className="flex gap-1 bg-gray-800/60 rounded-lg p-1 w-fit">
                    {(["file", "youtube"] as InputTab[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                          tab === t
                            ? "bg-gray-700 text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        {t === "file" ? "Upload file" : "YouTube link"}
                      </button>
                    ))}
                  </div>

                  {tab === "file" ? (
                    <UploadZone onFile={startWithFile} disabled={isActive} />
                  ) : (
                    <YouTubeInput onUrl={startWithUrl} disabled={isActive} />
                  )}
                </div>
              )}

              {/* Credit warning */}
              {!isActive && credits === 0 && (
                <div className="flex items-center gap-3 bg-amber-950/40 border border-amber-800/40 rounded-xl px-4 py-3">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" className="text-amber-400 shrink-0">
                    <path d="M7 0a7 7 0 100 14A7 7 0 007 0zm-.75 4a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0V4zm.75 6a1 1 0 110-2 1 1 0 010 2z"/>
                  </svg>
                  <p className="text-amber-300 text-sm flex-1">
                    You&apos;re out of credits.{" "}
                    <a href="/pricing" className="underline underline-offset-2 hover:text-amber-200">
                      Upgrade your plan
                    </a>{" "}
                    to continue.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {state.step === "done" && state.clips && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="text-lg font-semibold text-white">
                  {state.clips.length} clip{state.clips.length !== 1 ? "s" : ""} ready
                </h2>
                <p className="text-gray-500 text-sm">Preview and download your clips below.</p>
              </div>
              <button
                onClick={handleDone}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 1H1v12h12V6M6 8L13 1M9 1h4v4"/>
                </svg>
                New job
              </button>
            </div>
            <ClipsGrid clips={state.clips} />
          </div>
        )}
      </main>
    </div>
  );
}
