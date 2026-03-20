"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <header className="px-6 py-5">
        <span className="font-semibold text-white tracking-tight">Short Form</span>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-5 py-10 space-y-10">
        {/* Hero */}
        <div className="space-y-4 max-w-lg">
          <h1 className="text-3xl font-semibold text-white tracking-tight leading-snug">
            Turn long videos into<br />short clips — automatically.
          </h1>
          <p className="text-gray-500 leading-relaxed">
            Upload a video or paste a YouTube link. AI finds the best moments and cuts them for you.
          </p>
        </div>

        {/* Upload UI — gated */}
        <div className="relative">
          {/* Same tabs/UI as the real app */}
          <div className="space-y-4">
            <div className="flex gap-0.5 bg-white/[0.04] rounded-lg p-0.5 w-fit">
              <div className="px-3.5 py-1.5 rounded-md text-sm font-medium bg-white/10 text-white">Upload</div>
              <div className="px-3.5 py-1.5 rounded-md text-sm font-medium text-gray-500">YouTube</div>
            </div>

            {/* Upload zone — click triggers sign-in */}
            <button
              onClick={() => setShowSignInPrompt(true)}
              className="group w-full border-2 border-dashed border-white/8 hover:border-white/20 rounded-xl transition-all duration-200 text-left"
            >
              <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
                <div className="w-11 h-11 rounded-xl bg-white/5 group-hover:bg-white/8 flex items-center justify-center transition-colors">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-500">
                    <path d="M10 13V3M7 6l3-3 3 3" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 15v1a2 2 0 002 2h12a2 2 0 002-2v-1" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-gray-300 font-medium text-sm">Drop your video here</p>
                  <p className="text-gray-600 text-xs mt-1">MP4, MOV, AVI, MKV · up to 500 MB</p>
                </div>
              </div>
            </button>
          </div>

          {/* Sign-in prompt overlay */}
          {showSignInPrompt && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowSignInPrompt(false)}
              />
              <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
                <div className="space-y-1.5">
                  <h2 className="text-white font-semibold text-lg">Sign in to continue</h2>
                  <p className="text-gray-500 text-sm">Create a free account to process your first video.</p>
                </div>
                <button
                  onClick={handleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-900 font-medium py-3 px-5 rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 20 20">
                      <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.77h5.4a4.6 4.6 0 01-2 3.02v2.5h3.24c1.9-1.74 2.96-4.32 2.96-7.3z" fill="#4285F4"/>
                      <path d="M10 20c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.58-4.12H1.1v2.58A9.99 9.99 0 0010 20z" fill="#34A853"/>
                      <path d="M4.42 11.92A6 6 0 014.1 10c0-.67.12-1.32.32-1.92V5.5H1.1A9.99 9.99 0 000 10c0 1.62.38 3.14 1.1 4.5l3.32-2.58z" fill="#FBBC05"/>
                      <path d="M10 3.96c1.46 0 2.78.5 3.82 1.5l2.86-2.86C14.96.9 12.7 0 10 0A9.99 9.99 0 001.1 5.5l3.32 2.58C5.2 5.72 7.4 3.96 10 3.96z" fill="#EA4335"/>
                    </svg>
                  )}
                  {loading ? "Signing in…" : "Continue with Google"}
                </button>
                <p className="text-center text-gray-600 text-xs">Free to try · No credit card required</p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
