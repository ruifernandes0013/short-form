"use client";

import { useCallback, useState } from "react";
import { clsx } from "clsx";

interface UploadZoneProps {
  onFile: (file: File) => void;
  disabled: boolean;
}

export function UploadZone({ onFile, disabled }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (!file.type.startsWith("video/")) {
        setError("Please select a video file (MP4, MOV, AVI, etc.)");
        return;
      }
      const maxBytes = 500 * 1024 * 1024;
      if (file.size > maxBytes) {
        setError("File too large. Maximum size is 500MB.");
        return;
      }
      setSelectedFile(file);
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

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <label
        className={clsx(
          "block w-full border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer",
          {
            "border-violet-500 bg-violet-500/10": dragging,
            "border-gray-700 hover:border-gray-500 hover:bg-gray-800/50":
              !dragging && !disabled,
            "border-gray-800 opacity-50 cursor-not-allowed": disabled,
            "border-green-600/50 bg-green-600/5": selectedFile && !disabled,
          }
        )}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          type="file"
          accept="video/*"
          className="hidden"
          onChange={onInputChange}
          disabled={disabled}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl">
            {selectedFile ? "🎬" : "📁"}
          </div>
          {selectedFile ? (
            <>
              <p className="text-green-400 font-medium">{selectedFile.name}</p>
              <p className="text-gray-500 text-sm">
                {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-300 font-medium">
                Drop your video here or click to browse
              </p>
              <p className="text-gray-500 text-sm">
                MP4, MOV, AVI, MKV — up to 500MB
              </p>
            </>
          )}
        </div>
      </label>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
