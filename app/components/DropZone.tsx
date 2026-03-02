"use client";

import { useCallback, useRef, useState } from "react";

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  loading: boolean;
  error: string | null;
}

export default function DropZone({ onFileSelected, loading, error }: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type !== "application/pdf") {
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center
        w-full max-w-xl mx-auto h-64
        border-2 border-dashed rounded-xl
        cursor-pointer transition-all duration-200
        ${dragOver
          ? "border-[var(--accent)] bg-[var(--accent)]/10"
          : "border-[var(--text-muted)] hover:border-[var(--accent)] hover:bg-[var(--bg-surface)]"
        }
        ${loading ? "pointer-events-none opacity-60" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={onChange}
        className="hidden"
      />

      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--text-muted)]">Extracting text...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 px-6 text-center">
          <svg
            className="w-12 h-12 text-[var(--text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          <p className="text-[var(--text-primary)]">
            Drop a PDF here or click to browse
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            PDF text will be extracted for typing practice
          </p>
        </div>
      )}

      {error && (
        <p className="absolute bottom-4 text-sm text-[var(--text-error)]">
          {error}
        </p>
      )}
    </div>
  );
}
