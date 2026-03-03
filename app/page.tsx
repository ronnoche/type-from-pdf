"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DropZone from "@/app/components/DropZone";
import SessionList from "@/app/components/SessionList";
import { extractTextFromPdf } from "@/app/lib/pdf";
import {
  Session,
  getSessions,
  createSession,
  deleteSession,
} from "@/app/lib/storage";
import { SAMPLE_TEXT } from "@/app/lib/sample";

export default function UploadPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  const handleFileSelected = useCallback(
    async (file: File) => {
      setError(null);
      setLoading(true);

      try {
        const text = await extractTextFromPdf(file);
        if (!text.trim()) {
          setError("No readable text found in this PDF.");
          setLoading(false);
          return;
        }
        const session = createSession(file.name, text);
        router.push(`/practice?id=${session.id}`);
      } catch (err) {
        console.error("PDF extraction failed:", err);
        setError("Failed to extract text from PDF. Try a different file.");
        setLoading(false);
      }
    },
    [router]
  );

  const handleResume = useCallback(
    (session: Session) => {
      router.push(`/practice?id=${session.id}`);
    },
    [router]
  );

  const handleDelete = useCallback((id: string) => {
    deleteSession(id);
    setSessions(getSessions());
  }, []);

  const handleStartSample = useCallback(() => {
    setError(null);
    setLoading(true);
    try {
      const session = createSession(
        "Sample: Retyping over passive reading",
        SAMPLE_TEXT,
        true
      );
      router.push(`/practice?id=${session.id}`);
    } finally {
      setLoading(false);
    }
  }, [router]);

  return (
    <main className="flex flex-col items-center px-6 py-16">
      <div className="mb-4 text-[var(--accent)]" aria-hidden="true">
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          <rect x="10" y="12" width="40" height="50" rx="8" stroke="currentColor" strokeWidth="2.5" />
          <path d="M39 12V24H50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M18 27H40M18 34H35M18 41H28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="36" y="40" width="26" height="18" rx="5" fill="currentColor" fillOpacity="0.12" />
          <path
            d="M42 49L46 45L50 49L56 43"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="56" cy="22" r="6" fill="currentColor" fillOpacity="0.16" />
          <path d="M53.5 22H58.5M56 19.5V24.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Retype to Remember</h1>
      <p className="text-[var(--text-muted)] mb-10 text-center max-w-md">
        Turn any PDF into an active learning session
      </p>

      <DropZone
        onFileSelected={handleFileSelected}
        loading={loading}
        error={error}
      />

      <button
        type="button"
        onClick={handleStartSample}
        disabled={loading}
        className="mt-4 text-sm text-[var(--accent)] hover:text-[var(--accent)]/80 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Practice with a sample passage
      </button>

      <SessionList
        sessions={sessions}
        onResume={handleResume}
        onDelete={handleDelete}
      />
    </main>
  );
}
