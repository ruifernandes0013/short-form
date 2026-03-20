"use client";

import { useState } from "react";

const YT_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)/;

interface YouTubeInputProps {
  onUrl: (url: string) => void;
  disabled: boolean;
}

export function YouTubeInput({ onUrl, disabled }: YouTubeInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isValid = YT_REGEX.test(url.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    if (!isValid) {
      setError("Please enter a valid YouTube URL");
      return;
    }
    setError(null);
    onUrl(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4">
            <svg viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
              <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.5A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.75 15.5V8.5l6.25 3.5-6.25 3.5z"/>
            </svg>
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(null); }}
            placeholder="https://youtube.com/watch?v=..."
            disabled={disabled}
            className={`w-full pl-9 pr-4 py-3 bg-gray-800/60 border rounded-xl text-gray-100 placeholder-gray-600 text-sm focus:outline-none focus:ring-2 transition-all ${
              error
                ? "border-red-700 focus:ring-red-600/30"
                : "border-gray-700/60 focus:ring-violet-600/30 focus:border-violet-600/60"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !url.trim()}
          className="px-5 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
        >
          Process
        </button>
      </div>
      {error && <p className="text-red-400 text-xs flex items-center gap-1.5"><span>⚠</span> {error}</p>}
      {url && !isValid && !error && (
        <p className="text-amber-600 text-xs">Supports youtube.com/watch, /shorts, and youtu.be links</p>
      )}
    </form>
  );
}
