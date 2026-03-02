export interface Session {
  id: string;
  fileName: string;
  sourceText: string;
  currentIndex: number;
  correctCount: number;
  errorCount: number;
  startedAt: string;
  elapsedMs: number;
  completed: boolean;
}

const STORAGE_KEY = "pdf-typing-sessions";

function readSessions(): Session[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeSessions(sessions: Session[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function getSessions(): Session[] {
  return readSessions();
}

export function getSession(id: string): Session | undefined {
  return readSessions().find((s) => s.id === id);
}

export function createSession(fileName: string, sourceText: string): Session {
  const session: Session = {
    id: crypto.randomUUID(),
    fileName,
    sourceText,
    currentIndex: 0,
    correctCount: 0,
    errorCount: 0,
    startedAt: new Date().toISOString(),
    elapsedMs: 0,
    completed: false,
  };
  const sessions = readSessions();
  sessions.unshift(session);
  writeSessions(sessions);
  return session;
}

export function updateSession(
  id: string,
  updates: Partial<Omit<Session, "id" | "fileName" | "sourceText">>
): void {
  const sessions = readSessions();
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx === -1) return;
  sessions[idx] = { ...sessions[idx], ...updates };
  writeSessions(sessions);
}

export function deleteSession(id: string): void {
  const sessions = readSessions().filter((s) => s.id !== id);
  writeSessions(sessions);
}
