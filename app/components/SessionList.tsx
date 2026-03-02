"use client";

import { Session, deleteSession } from "@/app/lib/storage";

interface SessionListProps {
  sessions: Session[];
  onResume: (session: Session) => void;
  onDelete: (id: string) => void;
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SessionList({ sessions, onResume, onDelete }: SessionListProps) {
  if (sessions.length === 0) return null;

  return (
    <div className="w-full max-w-xl mx-auto mt-10">
      <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
        Previous Sessions
      </h2>
      <div className="flex flex-col gap-2">
        {sessions.map((session) => {
          const progress = session.sourceText.length > 0
            ? Math.round((session.currentIndex / session.sourceText.length) * 100)
            : 0;

          return (
            <div
              key={session.id}
              className="flex items-center justify-between px-4 py-3 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--accent-dim)] transition-colors"
            >
              <button
                onClick={() => onResume(session)}
                className="flex-1 text-left"
              >
                <p className="text-sm text-[var(--text-primary)] truncate">
                  {session.fileName}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {session.completed ? (
                    <span className="text-[var(--text-correct)]">Completed</span>
                  ) : (
                    <>{progress}% done</>
                  )}
                  {" / "}
                  {formatTime(session.elapsedMs)}
                </p>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(session.id);
                }}
                className="ml-3 p-1.5 text-[var(--text-muted)] hover:text-[var(--text-error)] transition-colors"
                title="Delete session"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
