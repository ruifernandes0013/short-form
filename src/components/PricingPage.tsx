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
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Simple, credit-based pricing</h1>
        <p className="text-gray-400">Each video costs 1 credit. Credits reset monthly.</p>
      </div>

      {/* Plans */}
      <div className="grid gap-6 sm:grid-cols-3">
        {Object.values(PLANS).map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isUpgrade = plan.price > (PLANS[currentPlan]?.price ?? 0);

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-6 space-y-5 flex flex-col ${
                plan.highlighted
                  ? "border-violet-500 bg-violet-950/30"
                  : "border-gray-800 bg-gray-900"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most popular
                </span>
              )}

              <div>
                <h2 className="text-white font-bold text-xl">{plan.name}</h2>
                <div className="mt-2">
                  {plan.price === 0 ? (
                    <span className="text-3xl font-black text-white">Free</span>
                  ) : (
                    <span className="text-3xl font-black text-white">
                      €{plan.price}
                      <span className="text-base font-normal text-gray-400">/mo</span>
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-violet-400">✓</span> {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button
                  onClick={handleManage}
                  disabled={loading === "portal"}
                  className="w-full py-2.5 rounded-lg border border-gray-600 text-gray-400 text-sm font-medium hover:border-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
                >
                  {loading === "portal" ? "Loading..." : "Manage plan"}
                </button>
              ) : isUpgrade ? (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                    plan.highlighted
                      ? "bg-violet-600 hover:bg-violet-500 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-white"
                  }`}
                >
                  {loading === plan.id ? "Redirecting..." : `Upgrade to ${plan.name}`}
                </button>
              ) : (
                <button
                  onClick={handleManage}
                  disabled={loading === "portal"}
                  className="w-full py-2.5 rounded-lg border border-gray-700 text-gray-500 text-sm font-medium cursor-not-allowed"
                >
                  Downgrade
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Top-up */}
      <div className="border border-gray-800 bg-gray-900 rounded-2xl p-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-semibold">Need more credits?</h3>
          <p className="text-gray-400 text-sm mt-1">
            Buy {TOPUP.credits} bonus credits for €{TOPUP.price}. They never expire.
          </p>
        </div>
        <button
          onClick={handleTopup}
          disabled={loading === "topup"}
          className="shrink-0 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {loading === "topup" ? "Redirecting..." : `Buy ${TOPUP.credits} credits — €${TOPUP.price}`}
        </button>
      </div>
    </div>
  );
}
