"use client";

export function TranscriptPreview({ transcript }: { transcript: string }) {
  return (
    <details className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-800/50 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">📝</span>
          <span className="text-sm font-medium text-gray-300">
            Transcript Preview
          </span>
          <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
            {transcript.length.toLocaleString()} chars
          </span>
        </div>
        <span className="text-gray-600 text-sm group-open:rotate-180 transition-transform">
          ▼
        </span>
      </summary>
      <div className="px-4 pb-4">
        <div className="bg-gray-800/50 rounded-lg p-3 max-h-60 overflow-y-auto text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">
          {transcript}
        </div>
      </div>
    </details>
  );
}
