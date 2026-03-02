"use client";

interface StatsBarProps {
  wpm: number;
  accuracy: number;
  progress: number;
  elapsedMs: number;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function StatsBar({ wpm, accuracy, progress, elapsedMs }: StatsBarProps) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-center gap-8 py-4 text-sm">
        <Stat label="WPM" value={wpm.toString()} />
        <Stat label="Accuracy" value={`${accuracy}%`} />
        <Stat label="Progress" value={`${progress}%`} />
        <Stat label="Time" value={formatTime(elapsedMs)} />
      </div>
      <div className="w-full h-1 rounded-full bg-[var(--accent-dim)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-bold text-[var(--accent)]">{value}</span>
      <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
        {label}
      </span>
    </div>
  );
}
