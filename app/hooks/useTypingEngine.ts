"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { updateSession } from "@/app/lib/storage";

export type CharStatus = "pending" | "correct" | "incorrect";

export interface TypingState {
  currentIndex: number;
  charStatuses: CharStatus[];
  correctCount: number;
  errorCount: number;
  wpm: number;
  accuracy: number;
  progress: number;
  elapsedMs: number;
  started: boolean;
  completed: boolean;
}

const SAVE_INTERVAL_MS = 3000;

const IGNORED_KEYS = new Set([
  "Shift", "Control", "Alt", "Meta", "CapsLock", "Escape",
  "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
  "Home", "End", "PageUp", "PageDown", "Insert", "Delete",
  "F1", "F2", "F3", "F4", "F5", "F6",
  "F7", "F8", "F9", "F10", "F11", "F12",
]);

export function useTypingEngine(
  sourceText: string,
  sessionId: string,
  initialIndex: number = 0,
  initialCorrect: number = 0,
  initialErrors: number = 0,
  initialElapsedMs: number = 0
) {
  const [state, setState] = useState<TypingState>(() => {
    const statuses: CharStatus[] = new Array(sourceText.length).fill("pending");
    for (let i = 0; i < initialIndex && i < sourceText.length; i++) {
      statuses[i] = "correct";
    }
    return {
      currentIndex: initialIndex,
      charStatuses: statuses,
      correctCount: initialCorrect,
      errorCount: initialErrors,
      wpm: 0,
      accuracy: initialCorrect + initialErrors > 0
        ? Math.round((initialCorrect / (initialCorrect + initialErrors)) * 100)
        : 100,
      progress: sourceText.length > 0
        ? Math.round((initialIndex / sourceText.length) * 100)
        : 0,
      elapsedMs: initialElapsedMs,
      started: initialIndex > 0,
      completed: false,
    };
  });

  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSaveRef = useRef<number>(Date.now());
  const stateRef = useRef(state);
  stateRef.current = state;

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    startTimeRef.current = Date.now() - stateRef.current.elapsedMs;
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - (startTimeRef.current ?? now);
      const minutes = elapsed / 60000;
      const wpm = minutes > 0
        ? Math.round((stateRef.current.correctCount / 5) / minutes)
        : 0;

      setState((prev) => ({
        ...prev,
        elapsedMs: elapsed,
        wpm,
      }));
    }, 200);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const saveProgress = useCallback(() => {
    const s = stateRef.current;
    updateSession(sessionId, {
      currentIndex: s.currentIndex,
      correctCount: s.correctCount,
      errorCount: s.errorCount,
      elapsedMs: s.elapsedMs,
      completed: s.completed,
    });
  }, [sessionId]);

  const applyBackspace = useCallback(() => {
    setState((prev) => {
      if (prev.currentIndex <= 0) return prev;
      const newStatuses = [...prev.charStatuses];
      const wasCorrect = newStatuses[prev.currentIndex - 1] === "correct";
      newStatuses[prev.currentIndex - 1] = "pending";
      return {
        ...prev,
        currentIndex: prev.currentIndex - 1,
        charStatuses: newStatuses,
        correctCount: wasCorrect
          ? prev.correctCount - 1
          : prev.correctCount,
        errorCount: !wasCorrect ? prev.errorCount - 1 : prev.errorCount,
        progress: Math.round(
          ((prev.currentIndex - 1) / sourceText.length) * 100
        ),
      };
    });
  }, [sourceText.length]);

  const applyTypedChar = useCallback(
    (typed: string) => {
      if (typed.length !== 1) return;

      if (!stateRef.current.started) {
        startTimer();
      }

      setState((prev) => {
        if (prev.currentIndex >= sourceText.length) return prev;

        const expected = sourceText[prev.currentIndex];
        const isCorrect = typed === expected;
        const newStatuses = [...prev.charStatuses];
        newStatuses[prev.currentIndex] = isCorrect ? "correct" : "incorrect";

        const newIndex = prev.currentIndex + 1;
        const newCorrect = prev.correctCount + (isCorrect ? 1 : 0);
        const newErrors = prev.errorCount + (isCorrect ? 0 : 1);
        const total = newCorrect + newErrors;
        const isCompleted = newIndex >= sourceText.length;

        return {
          ...prev,
          currentIndex: newIndex,
          charStatuses: newStatuses,
          correctCount: newCorrect,
          errorCount: newErrors,
          accuracy: total > 0 ? Math.round((newCorrect / total) * 100) : 100,
          progress: Math.round((newIndex / sourceText.length) * 100),
          started: true,
          completed: isCompleted,
        };
      });

      if (Date.now() - lastSaveRef.current > SAVE_INTERVAL_MS) {
        lastSaveRef.current = Date.now();
        setTimeout(saveProgress, 0);
      }
    },
    [sourceText, startTimer, saveProgress]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (stateRef.current.completed) return;

      if (IGNORED_KEYS.has(e.key)) return;

      e.preventDefault();

      if (e.key === "Backspace") {
        applyBackspace();
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return;

      let typed = e.key;
      if (e.key === "Enter") typed = "\n";
      if (e.key === "Tab") typed = "\t";

      applyTypedChar(typed);
    },
    [applyBackspace, applyTypedChar]
  );

  const handleTextInput = useCallback(
    (text: string) => {
      for (const char of text) {
        applyTypedChar(char);
      }
    },
    [applyTypedChar]
  );

  const handleBackspace = useCallback(() => {
    if (stateRef.current.completed) return;
    applyBackspace();
  }, [applyBackspace]);

  useEffect(() => {
    if (stateRef.current.completed) {
      stopTimer();
      saveProgress();
    }
  }, [state.completed, stopTimer, saveProgress]);

  useEffect(() => {
    return () => {
      stopTimer();
      saveProgress();
    };
  }, [stopTimer, saveProgress]);

  const restart = useCallback(() => {
    stopTimer();
    startTimeRef.current = null;
    setState({
      currentIndex: 0,
      charStatuses: new Array(sourceText.length).fill("pending"),
      correctCount: 0,
      errorCount: 0,
      wpm: 0,
      accuracy: 100,
      progress: 0,
      elapsedMs: 0,
      started: false,
      completed: false,
    });
    updateSession(sessionId, {
      currentIndex: 0,
      correctCount: 0,
      errorCount: 0,
      elapsedMs: 0,
      completed: false,
    });
  }, [sourceText.length, sessionId, stopTimer]);

  return {
    state,
    handleKeyDown,
    handleTextInput,
    handleBackspace,
    restart,
  };
}
