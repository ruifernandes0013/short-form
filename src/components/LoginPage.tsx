"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-fuchsia-600/8 blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] rounded-full bg-indigo-600/8 blur-[100px]" />
      </div>

      <header className="relative px-6 py-5">
        <span className="font-semibold text-white tracking-tight">Short Form</span>
      </header>

      <main className="relative flex-1 max-w-4xl mx-auto w-full px-5 py-10 space-y-12">
        {/* Hero */}
        <div className="space-y-4 max-w-xl pt-4">
          <h1 className="text-4xl font-semibold text-white tracking-tight leading-tight">
            Turn long videos into{" "}
            <span className="gradient-text">short clips</span>
            {" "}— automatically.
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Upload a video or paste a YouTube link. AI finds the best moments and cuts them for you.
          </p>
        </div>

        {/* Upload UI preview — clicking opens sign-in */}
        <div className="space-y-4">
          <div className="flex gap-0.5 bg-white/[0.04] rounded-lg p-0.5 w-fit border border-white/5">
            <div className="px-3.5 py-1.5 rounded-md text-sm font-medium bg-white/10 text-white">Upload</div>
            <div className="px-3.5 py-1.5 rounded-md text-sm font-medium text-gray-500">YouTube</div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="group w-full border-2 border-dashed border-white/8 hover:border-violet-500/40 hover:bg-violet-500/[0.03] rounded-2xl transition-all duration-300 text-left"
          >
            <div className="flex flex-col items-center gap-3 py-14 px-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-white/5 group-hover:bg-violet-500/10 flex items-center justify-center transition-colors border border-white/5 group-hover:border-violet-500/20">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-500 group-hover:text-violet-400 transition-colors">
                  <path d="M10 13V3M7 6l3-3 3 3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 15v1a2 2 0 002 2h12a2 2 0 002-2v-1" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-gray-300 font-medium text-sm group-hover:text-white transition-colors">Drop your video here</p>
                <p className="text-gray-600 text-xs mt-1">MP4, MOV, AVI, MKV · up to 500 MB</p>
              </div>
            </div>
          </button>
        </div>
      </main>

      {/* Sign-in modal */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-4">
            <div className="bg-[#0f0f18] border border-white/10 rounded-2xl p-7 shadow-2xl space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-white font-semibold text-xl">Sign in to continue</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Create a free account to process your first video. No credit card needed.
                </p>
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
            </div>
          </div>
        </>
      )}
    </div>
  );
}
