"use client";

import { ClipResult } from "@/types";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function ClipsGrid({ clips }: { clips: ClipResult[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {clips.map((clip) => (
        <div
          key={clip.index}
          className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
        >
          <video
            className="w-full aspect-video bg-black"
            src={clip.url}
            controls
            preload="metadata"
            playsInline
          />
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-white font-semibold text-sm leading-snug">
                {clip.title}
              </h3>
              <span className="text-xs text-gray-500 shrink-0 bg-gray-800 px-2 py-0.5 rounded">
                {formatDuration(clip.duration)}
              </span>
            </div>
            <a
              href={clip.url}
              download={`${clip.title.replace(/\s+/g, "-").toLowerCase()}.mp4`}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              ↓ Download
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
