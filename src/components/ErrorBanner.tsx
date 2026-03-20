"use client";

import { useEffect, useState } from "react";

export function ErrorBanner({ error, onDismiss }: { error: string; onDismiss: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 8000);
    return () => clearTimeout(t);
  }, [error, onDismiss]);

  return (
    <div
      className={`transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      } bg-red-950/80 border border-red-800 rounded-xl p-4 flex items-start gap-3`}
    >
      <span className="text-red-400 mt-0.5 shrink-0">⚠</span>
      <p className="text-red-300 text-sm flex-1">{error}</p>
      <button
        onClick={onDismiss}
        className="text-red-600 hover:text-red-400 transition-colors shrink-0"
      >
        ✕
      </button>
    </div>
  );
}
