"use client";

import { useState } from "react";
import { PLANS } from "@/lib/plans";

interface AccountPageProps {
  user: { name: string | null; email: string; image: string | null };
  subscription: {
    plan: "FREE" | "CREATOR" | "PRO";
    status: string;
    currentPeriodEnd: string | null;
  } | null;
  credits: {
    monthly: number;
    bonus: number;
    lastResetAt: string | null;
  };
  videosGenerated: number;
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function AccountPage({ user, subscription, credits, videosGenerated }: AccountPageProps) {
  const [portalLoading, setPortalLoading] = useState(false);

  const plan = subscription?.plan ?? "FREE";
  const planConfig = PLANS[plan];
  const totalCredits = credits.monthly + credits.bonus;

  const isPaid = plan !== "FREE";
  const renewDate = formatDate(subscription?.currentPeriodEnd ?? null);
  const resetDate = formatDate(credits.lastResetAt);

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPortalLoading(false);
    }
  }

  const PLAN_COLORS: Record<string, string> = {
    FREE: "text-gray-400 bg-gray-400/10 border-gray-400/20",
    CREATOR: "text-violet-400 bg-violet-400/10 border-violet-400/20",
    PRO: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  };

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-violet-600/6 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/[0.06] bg-[#080810]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-5 flex items-center gap-4" style={{ height: "52px" }}>
          <a href="/" className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-sm">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 1L3 7l6 6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </a>
          <span className="text-white/20">·</span>
          <span className="font-semibold text-white tracking-tight">Account</span>
        </div>
      </header>

      <main className="relative flex-1 max-w-4xl mx-auto w-full px-5 py-12 space-y-8">

        {/* Profile */}
        <div className="flex items-center gap-4">
          {user.image ? (
            <img src={user.image} alt="" className="w-14 h-14 rounded-full border border-white/10" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-white text-xl font-semibold border border-white/8">
              {(user.name ?? user.email)[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-white font-semibold text-lg">{user.name ?? "—"}</p>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-1">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Videos left</p>
            <p className="text-3xl font-bold text-white tabular-nums">{totalCredits}</p>
            {credits.bonus > 0 && (
              <p className="text-gray-600 text-xs">{credits.monthly} monthly + {credits.bonus} extra</p>
            )}
          </div>
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-1">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Videos made</p>
            <p className="text-3xl font-bold text-white tabular-nums">{videosGenerated}</p>
            <p className="text-gray-600 text-xs">last 10 shown</p>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-1">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Plan</p>
            <span className={`inline-flex items-center text-sm font-semibold px-2.5 py-0.5 rounded-full border ${PLAN_COLORS[plan]}`}>
              {planConfig.name}
            </span>
            {resetDate && <p className="text-gray-600 text-xs">Videos reset {resetDate}</p>}
          </div>
        </div>

        {/* Subscription card */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between">
            <h2 className="text-white font-medium">Subscription</h2>
            <a
              href="/pricing"
              className="text-violet-400 hover:text-violet-300 text-sm transition-colors"
            >
              {isPaid ? "Change plan" : "Upgrade"}
            </a>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold text-lg">{planConfig.name}</p>
                <p className="text-gray-500 text-sm mt-0.5">
                  {planConfig.price === 0 ? "Free forever" : `€${planConfig.price}/month`}
                </p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                subscription?.status === "ACTIVE"
                  ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                  : "text-gray-400 bg-gray-400/10 border-gray-400/20"
              }`}>
                {subscription?.status ?? "Free"}
              </span>
            </div>

            <ul className="space-y-2">
              {planConfig.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-400">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 shrink-0">
                    <path d="M2 6.5l3 3L11 3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            {renewDate && (
              <p className="text-gray-600 text-xs pt-1">Renews {renewDate}</p>
            )}

            {isPaid && (
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="mt-2 text-sm text-gray-400 hover:text-white border border-white/8 hover:border-white/20 px-4 py-2 rounded-lg transition-colors disabled:opacity-40"
              >
                {portalLoading ? "Loading…" : "Manage billing →"}
              </button>
            )}
          </div>
        </div>

        {!isPaid && (
          <a
            href="/pricing"
            className="block bg-violet-600/10 border border-violet-500/20 hover:bg-violet-600/15 hover:border-violet-500/30 rounded-2xl px-6 py-5 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Unlock more videos</p>
                <p className="text-gray-500 text-sm mt-0.5">Creator from €19/mo · 80 videos/mo · no watermark</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-violet-400 shrink-0">
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </a>
        )}
      </main>
    </div>
  );
}
