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
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <header className="px-6 py-5">
        <span className="font-semibold text-white tracking-tight">Short Form</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-white tracking-tight leading-snug">
              Turn long videos into<br />
              short clips — automatically.
            </h1>
            <p className="text-gray-500 leading-relaxed">
              Upload a video or paste a YouTube link. AI finds the best moments and cuts them for you.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-900 font-medium py-3 px-5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            <p className="text-center text-gray-600 text-xs">
              Free to try · No credit card required
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
