"use client";

import { useEffect, useState } from "react";

interface CreditInfo {
  monthly: number;
  bonus: number;
  total: number;
  plan: string;
  renewsAt: string | null;
}

export function CreditBadge() {
  const [info, setInfo] = useState<CreditInfo | null>(null);

  useEffect(() => {
    fetch("/api/billing/credits")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setInfo(data as CreditInfo);
      })
      .catch(() => {});
  }, []);

  if (!info) return null;

  const isLow = info.total <= 1;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${
        isLow
          ? "border-red-500/40 bg-red-500/10 text-red-400"
          : "border-gray-700 bg-gray-800/60 text-gray-300"
      }`}
    >
      <span className={isLow ? "text-red-400" : "text-violet-400"}>◆</span>
      <span className="font-medium">{info.total}</span>
      <span className="text-gray-500">credits</span>
      {info.bonus > 0 && (
        <span className="text-xs text-gray-500">({info.bonus} bonus)</span>
      )}
    </div>
  );
}
