"use client";

import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSession, Session } from "@/app/lib/storage";
import { useTypingEngine } from "@/app/hooks/useTypingEngine";
import TypingArea from "@/app/components/TypingArea";
import StatsBar from "@/app/components/StatsBar";
import { truncateText } from "@/app/lib/text";

function PracticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("id");

  const [session, setSession] = useState<Session | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setNotFound(true);
      return;
    }
    const s = getSession(sessionId);
    if (!s) {
      setNotFound(true);
      return;
    }
    setSession(s);
  }, [sessionId]);

  if (notFound) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6">
        <p className="text-[var(--text-muted)] mb-4">Session not found.</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 text-sm rounded-lg bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 transition-opacity"
        >
          Back to Upload
        </button>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return <TypingSession session={session} />;
}

function TypingSession({ session }: { session: Session }) {
  const router = useRouter();
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const { state, handleKeyDown, handleTextInput, handleBackspace, restart } =
    useTypingEngine(
    session.sourceText,
    session.id,
    session.currentIndex,
    session.correctCount,
    session.errorCount,
    session.elapsedMs
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const focusMobileKeyboard = useCallback(() => {
    mobileInputRef.current?.focus();
  }, []);

  const handleMobileBeforeInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const native = e.nativeEvent as InputEvent;
      if (!native) return;

      if (native.inputType === "deleteContentBackward") {
        e.preventDefault();
        handleBackspace();
        return;
      }

      if (native.inputType === "insertLineBreak") {
        e.preventDefault();
        handleTextInput("\n");
        return;
      }

      if (
        native.inputType === "insertText" ||
        native.inputType === "insertCompositionText"
      ) {
        if (!native.data) return;
        e.preventDefault();
        handleTextInput(native.data);
      }
    },
    [handleBackspace, handleTextInput]
  );

  const goBack = useCallback(() => {
    router.push("/");
  }, [router]);

  const displayFileName = truncateText(session.fileName, 60);

  if (state.completed) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6 gap-6">
        <h1 className="text-2xl font-bold text-[var(--text-correct)]">
          Complete
        </h1>
        <p className="text-sm text-[var(--text-muted)]" title={session.fileName}>
          {displayFileName}
        </p>
        <StatsBar
          wpm={state.wpm}
          accuracy={state.accuracy}
          progress={100}
          elapsedMs={state.elapsedMs}
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={restart}
            className="px-4 py-2 text-sm rounded-lg border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-colors"
          >
            Restart
          </button>
          <button
            onClick={goBack}
            className="px-4 py-2 text-sm rounded-lg bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 transition-opacity"
          >
            New PDF
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col flex-1 px-6 py-8 overflow-hidden">
      <input
        ref={mobileInputRef}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="absolute opacity-0 pointer-events-none w-0 h-0"
        aria-label="Typing input"
        onBeforeInput={handleMobileBeforeInput}
        onKeyDown={(e) => {
          if (e.key === "Backspace") {
            e.preventDefault();
            handleBackspace();
          }
        }}
      />

      <div className="flex items-center justify-between max-w-3xl mx-auto w-full mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-sm"
          >
            &larr; Back
          </button>
          <span
            className="text-sm text-[var(--text-muted)] truncate max-w-xs"
            title={session.fileName}
          >
            {displayFileName}
          </span>
        </div>
        <button
          onClick={restart}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
        >
          Restart
        </button>
      </div>

      <StatsBar
        wpm={state.wpm}
        accuracy={state.accuracy}
        progress={state.progress}
        elapsedMs={state.elapsedMs}
      />

      <div className="mt-6 flex-1">
        <TypingArea
          sourceText={session.sourceText}
          charStatuses={state.charStatuses}
          currentIndex={state.currentIndex}
          onActivate={focusMobileKeyboard}
        />
      </div>

      {!state.started && (
        <p className="text-center text-sm text-[var(--text-muted)] mt-6 animate-pulse">
          Start typing to begin...
        </p>
      )}
    </main>
  );
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <main className="flex items-center justify-center min-h-screen">
          <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </main>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}
