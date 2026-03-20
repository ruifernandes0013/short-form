"use client";

export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm text-gray-400">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
