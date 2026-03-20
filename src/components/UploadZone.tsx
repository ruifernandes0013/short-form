"use client";

import { useCallback, useState } from "react";

interface UploadZoneProps {
  onFile: (file: File) => void;
  disabled: boolean;
}

export function UploadZone({ onFile, disabled }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (!file.type.startsWith("video/")) {
        setError("Please select a video file (MP4, MOV, AVI, MKV…)");
        return;
      }
      if (file.size > 500 * 1024 * 1024) {
        setError("File too large. Maximum size is 500 MB.");
        return;
      }
      onFile(file);
    },
    [onFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile]
  );

  return (
    <div className="space-y-2">
      <label
        className={`group block w-full border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer ${
          disabled
            ? "border-gray-800 opacity-40 cursor-not-allowed"
            : dragging
            ? "border-violet-500 bg-violet-500/5"
            : "border-gray-800 hover:border-gray-600 hover:bg-gray-800/30"
        }`}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          disabled={disabled}
        />
        <div className="flex flex-col items-center gap-3 py-10 px-6 text-center">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            dragging ? "bg-violet-500/20" : "bg-gray-800 group-hover:bg-gray-700"
          }`}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5"
              className={dragging ? "text-violet-400" : "text-gray-400"}>
              <path d="M11 14V2M7 6l4-4 4 4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17v1a2 2 0 002 2h14a2 2 0 002-2v-1" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-gray-300 font-medium text-sm">
              {dragging ? "Drop to upload" : "Drop your video here"}
            </p>
            <p className="text-gray-600 text-xs mt-1">or click to browse · MP4, MOV, AVI, MKV · up to 500 MB</p>
          </div>
        </div>
      </label>
      {error && (
        <p className="text-red-400 text-xs flex items-center gap-1.5">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}
