"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 12L7 2L12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 8.5H10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="font-semibold text-white text-sm">Short Form Studio</span>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            AI-powered video editing
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white tracking-tight leading-tight">
              Turn long videos into
              <br />
              <span className="text-violet-400">viral short clips</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Upload a video or paste a YouTube link. AI finds the best moments and cuts them automatically.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            {[
              { icon: "🎙", label: "AI Transcription" },
              { icon: "✂️", label: "Smart Cuts" },
              { icon: "⬇️", label: "Instant Download" },
            ].map((f) => (
              <div
                key={f.label}
                className="bg-gray-900 border border-gray-800 rounded-xl p-3 space-y-1.5"
              >
                <div className="text-xl">{f.icon}</div>
                <div className="text-gray-400 font-medium text-xs">{f.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-black/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.77h5.4a4.6 4.6 0 01-2 3.02v2.5h3.24c1.9-1.74 2.96-4.32 2.96-7.3z" fill="#4285F4"/>
                  <path d="M10 20c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.58-4.12H1.1v2.58A9.99 9.99 0 0010 20z" fill="#34A853"/>
                  <path d="M4.42 11.92A6 6 0 014.1 10c0-.67.12-1.32.32-1.92V5.5H1.1A9.99 9.99 0 000 10c0 1.62.38 3.14 1.1 4.5l3.32-2.58z" fill="#FBBC05"/>
                  <path d="M10 3.96c1.46 0 2.78.5 3.82 1.5l2.86-2.86C14.96.9 12.7 0 10 0A9.99 9.99 0 001.1 5.5l3.32 2.58C5.2 5.72 7.4 3.96 10 3.96z" fill="#EA4335"/>
                </svg>
              )}
              {loading ? "Signing in..." : "Continue with Google"}
            </button>
            <p className="text-gray-600 text-xs">
              Free to start · No credit card required
            </p>
          </div>
        </div>
      </main>

      <footer className="px-6 py-5 text-center text-gray-700 text-xs">
        Powered by Claude AI · Groq Whisper · ffmpeg
      </footer>
    </div>
  );
}
