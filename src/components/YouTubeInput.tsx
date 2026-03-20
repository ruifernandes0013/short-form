"use client";

import { useState } from "react";
import { clsx } from "clsx";

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
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 text-lg">
            ▶
          </span>
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            placeholder="https://youtube.com/watch?v=..."
            disabled={disabled}
            className={clsx(
              "w-full pl-9 pr-4 py-3 bg-gray-800 border rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all",
              {
                "border-gray-700 focus:ring-violet-500 focus:border-violet-500":
                  !error,
                "border-red-500 focus:ring-red-500": error,
                "opacity-50 cursor-not-allowed": disabled,
              }
            )}
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !url.trim()}
          className={clsx(
            "px-5 py-3 rounded-lg font-semibold transition-all duration-200",
            {
              "bg-violet-600 hover:bg-violet-500 text-white": !disabled && url.trim(),
              "bg-gray-800 text-gray-600 cursor-not-allowed":
                disabled || !url.trim(),
            }
          )}
        >
          Process
        </button>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {url && !isValid && !error && (
        <p className="text-yellow-500 text-sm">
          Supports youtube.com/watch, youtube.com/shorts, and youtu.be links
        </p>
      )}
    </form>
  );
}
