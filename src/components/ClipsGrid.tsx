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
          className="group bg-gray-900/60 border border-white/5 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors"
        >
          <div className="relative bg-black aspect-video">
            <video
              className="w-full h-full object-contain"
              src={clip.url}
              controls
              preload="metadata"
              playsInline
            />
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-white font-medium text-sm leading-snug line-clamp-2">
                {clip.title}
              </h3>
              <span className="shrink-0 text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-md tabular-nums">
                {formatDuration(clip.duration)}
              </span>
            </div>
            <a
              href={clip.url}
              download={`${clip.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.mp4`}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-sm font-semibold transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 1v8M4 6l3 3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 11v1a1 1 0 001 1h10a1 1 0 001-1v-1" strokeLinecap="round"/>
              </svg>
              Download clip
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
