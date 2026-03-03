"use client";

import { useEffect, useMemo, useRef } from "react";
import { CharStatus } from "@/app/hooks/useTypingEngine";

interface TypingAreaProps {
  sourceText: string;
  charStatuses: CharStatus[];
  currentIndex: number;
  onActivate?: () => void;
}

const WINDOW_CHARS = 2000;

export default function TypingArea({
  sourceText,
  charStatuses,
  currentIndex,
  onActivate,
}: TypingAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  const { startIdx, endIdx } = useMemo(() => {
    if (sourceText.length <= WINDOW_CHARS) {
      return { startIdx: 0, endIdx: sourceText.length };
    }
    const half = Math.floor(WINDOW_CHARS / 2);
    let start = Math.max(0, currentIndex - half);
    let end = Math.min(sourceText.length, start + WINDOW_CHARS);
    if (end === sourceText.length) {
      start = Math.max(0, end - WINDOW_CHARS);
    }
    return { startIdx: start, endIdx: end };
  }, [sourceText.length, currentIndex]);

  useEffect(() => {
    if (cursorRef.current && containerRef.current) {
      const container = containerRef.current;
      const cursor = cursorRef.current;
      const containerRect = container.getBoundingClientRect();
      const cursorRect = cursor.getBoundingClientRect();
      const relativeTop = cursorRect.top - containerRect.top;

      if (relativeTop < 0 || relativeTop > containerRect.height - 40) {
        container.scrollTop += relativeTop - containerRect.height / 3;
      }
    }
  }, [currentIndex]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onClick={onActivate}
      className="w-full max-w-4xl mx-auto overflow-y-auto rounded-xl bg-[var(--bg-surface)] p-6 outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
      style={{ maxHeight: "60vh", lineHeight: "2em" }}
    >
      <pre className="whitespace-pre-wrap break-words text-lg font-mono leading-relaxed">
        {startIdx > 0 && (
          <span className="text-[var(--text-muted)]">...</span>
        )}
        {sourceText.slice(startIdx, endIdx).split("").map((char, offset) => {
          const i = startIdx + offset;
          const isCursor = i === currentIndex;
          const status = charStatuses[i];

          let style: React.CSSProperties = { color: "var(--text-muted)" };
          if (status === "correct") {
            style = { color: "var(--text-correct)" };
          } else if (status === "incorrect") {
            style = {
              color: "var(--text-error)",
              backgroundColor: "rgba(243, 139, 168, 0.2)",
              borderRadius: "2px",
            };
          }

          if (isCursor) {
            style.borderLeft = "2px solid var(--cursor)";
            style.marginLeft = "-1px";
          }

          const displayChar = char === "\n" ? "\u21B5\n" : char;

          return (
            <span key={i} ref={isCursor ? cursorRef : undefined} style={style}>
              {displayChar}
            </span>
          );
        })}
        {endIdx < sourceText.length && (
          <span className="text-[var(--text-muted)]">...</span>
        )}
      </pre>
    </div>
  );
}
