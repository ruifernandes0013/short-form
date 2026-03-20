"use client";

import { useState } from "react";
import { PLANS, TOPUP } from "@/lib/plans";
import { Plan } from "@/types";

interface PricingPageProps {
  currentPlan?: Plan;
}

export function PricingPage({ currentPlan = Plan.FREE }: PricingPageProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(plan: Plan) {
    setLoading(plan);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  async function handleTopup() {
    setLoading("topup");
    try {
      const res = await fetch("/api/billing/topup", { method: "POST" });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  async function handleManage() {
    setLoading("portal");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-violet-600/8 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/[0.06] bg-[#080810]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-5 flex items-center gap-4" style={{ height: "52px" }}>
          <a
            href="/"
            className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-sm"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 1L3 7l6 6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </a>
          <span className="text-white/20">·</span>
          <span className="font-semibold text-white tracking-tight">Plans</span>
        </div>
      </header>

      {/* Content */}
      <main className="relative flex-1 max-w-4xl mx-auto w-full px-5 py-12 space-y-10">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">
            Choose your plan
          </h1>
          <p className="text-gray-500 text-sm">
            1 video per credit. Monthly videos reset automatically.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {Object.values(PLANS).map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isUpgrade = plan.price > (PLANS[currentPlan]?.price ?? 0);

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl p-6 space-y-6 transition-colors ${
                  plan.highlighted
                    ? "bg-violet-950/50 border border-violet-500/30 ring-1 ring-violet-500/10"
                    : isCurrent
                    ? "bg-white/[0.06] border border-white/12"
                    : "bg-white/[0.03] border border-white/8 hover:bg-white/[0.05]"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
                )}

                {isCurrent && (
                  <span className="absolute top-4 right-4 text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}

                <div>
                  <p className="text-gray-400 text-sm font-medium">{plan.name}</p>
                  <div className="mt-2 flex items-baseline gap-1">
                    {plan.price === 0 ? (
                      <span className="text-3xl font-bold text-white">Free</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-white">€{plan.price}</span>
                        <span className="text-gray-500 text-sm">/mo</span>
                      </>
                    )}
                  </div>
                </div>

                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" className={`mt-0.5 shrink-0 ${plan.highlighted ? "text-violet-400" : "text-gray-500"}`}>
                        <path d="M2 7l3.5 3.5L12 3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button
                    onClick={handleManage}
                    disabled={loading === "portal"}
                    className="w-full py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm font-medium hover:border-white/20 hover:text-white transition-colors disabled:opacity-40"
                  >
                    {loading === "portal" ? "Loading…" : "Manage billing"}
                  </button>
                ) : isUpgrade ? (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={!!loading}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 ${
                      plan.highlighted
                        ? "bg-violet-600 hover:bg-violet-500 text-white"
                        : "bg-white/10 hover:bg-white/15 text-white"
                    }`}
                  >
                    {loading === plan.id ? "Redirecting…" : `Upgrade to ${plan.name}`}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl border border-white/6 text-gray-600 text-sm font-medium cursor-not-allowed"
                  >
                    Downgrade
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Top-up */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <p className="text-white font-medium">Need a one-time boost?</p>
            <p className="text-gray-500 text-sm">
              {TOPUP.credits} extra videos for €{TOPUP.price}. They never expire.
            </p>
          </div>
          <button
            onClick={handleTopup}
            disabled={!!loading}
            className="shrink-0 px-5 py-2.5 bg-white/8 hover:bg-white/12 border border-white/10 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-40"
          >
            {loading === "topup" ? "Redirecting…" : `Buy ${TOPUP.credits} videos — €${TOPUP.price}`}
          </button>
        </div>
      </main>
    </div>
  );
}
