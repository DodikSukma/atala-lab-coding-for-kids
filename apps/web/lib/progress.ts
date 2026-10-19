export type LessonProgressStatus =
  | "not_started"
  | "in_progress"
  | "ran"
  | "completed";

export type LessonProgressEntry = {
  lessonId: string;
  status: LessonProgressStatus;
  runsCount: number;
  starReached: boolean;
  savedProjectId?: string;
  reflectionNote?: string;
  updatedAt: string;
};

export const PROGRESS_STORAGE_KEY = "atala-lab-progress-v1";

const STATUS_RANK: Record<LessonProgressStatus, number> = {
  not_started: 0,
  in_progress: 1,
  ran: 2,
  completed: 3,
};

export const PROGRESS_STATUS_LABELS: Record<LessonProgressStatus, string> = {
  not_started: "Belum mulai",
  in_progress: "Sedang dikerjakan",
  ran: "Pernah dijalankan",
  completed: "Selesai",
};

function isValidEntry(value: unknown): value is LessonProgressEntry {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.lessonId === "string" &&
    ["not_started", "in_progress", "ran", "completed"].includes(
      String(v.status),
    ) &&
    typeof v.runsCount === "number" &&
    typeof v.starReached === "boolean" &&
    typeof v.updatedAt === "string"
  );
}

export function readAllProgress(): Record<string, LessonProgressEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) || "{}");
    if (!raw || typeof raw !== "object") return {};
    const result: Record<string, LessonProgressEntry> = {};
    for (const [key, val] of Object.entries(raw)) {
      if (isValidEntry(val)) {
        result[key] = val;
      }
    }
    return result;
  } catch {
    return {};
  }
}

function writeAllProgress(map: Record<string, LessonProgressEntry>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(map));
    if (typeof CustomEvent !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent("atala-progress-updated"));
    }
  } catch {
    // Ignore storage quota errors in progress tracking
  }
}

export function getLessonProgress(lessonId: string): LessonProgressEntry {
  const all = readAllProgress();
  return (
    all[lessonId] || {
      lessonId,
      status: "not_started",
      runsCount: 0,
      starReached: false,
      updatedAt: new Date(0).toISOString(),
    }
  );
}

export function markLessonEdited(lessonId: string): LessonProgressEntry {
  const all = readAllProgress();
  const prev = getLessonProgress(lessonId);
  const nextStatus: LessonProgressStatus =
    STATUS_RANK[prev.status] >= STATUS_RANK.in_progress
      ? prev.status
      : "in_progress";
  const updated: LessonProgressEntry = {
    ...prev,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };
  all[lessonId] = updated;
  writeAllProgress(all);
  return updated;
}

export function markLessonRan(
  lessonId: string,
  starReached: boolean,
): LessonProgressEntry {
  const all = readAllProgress();
  const prev = getLessonProgress(lessonId);
  const nextStatus: LessonProgressStatus =
    prev.status === "completed" || prev.savedProjectId
      ? "completed"
      : "ran";
  const updated: LessonProgressEntry = {
    ...prev,
    status: nextStatus,
    runsCount: prev.runsCount + 1,
    starReached: prev.starReached || starReached,
    updatedAt: new Date().toISOString(),
  };
  all[lessonId] = updated;
  writeAllProgress(all);
  return updated;
}

export function markLessonCompleted(
  lessonId: string,
  savedProjectId?: string,
): LessonProgressEntry {
  const all = readAllProgress();
  const prev = getLessonProgress(lessonId);
  const updated: LessonProgressEntry = {
    ...prev,
    status: "completed",
    savedProjectId: savedProjectId || prev.savedProjectId,
    updatedAt: new Date().toISOString(),
  };
  all[lessonId] = updated;
  writeAllProgress(all);
  return updated;
}

export function saveLessonReflection(
  lessonId: string,
  reflectionNote: string,
): LessonProgressEntry {
  const all = readAllProgress();
  const prev = getLessonProgress(lessonId);
  const nextStatus: LessonProgressStatus =
    prev.status === "not_started" && reflectionNote.trim()
      ? "in_progress"
      : prev.status;
  const updated: LessonProgressEntry = {
    ...prev,
    status: nextStatus,
    reflectionNote: reflectionNote.slice(0, 300),
    updatedAt: new Date().toISOString(),
  };
  all[lessonId] = updated;
  writeAllProgress(all);
  return updated;
}

export function getMonthProgressSummary(monthLessonIds: string[]): {
  total: number;
  started: number;
  completed: number;
  ran: number;
  percent: number;
} {
  const all = readAllProgress();
  const total = monthLessonIds.length;
  let started = 0;
  let completed = 0;
  let ran = 0;
  for (const id of monthLessonIds) {
    const entry = all[id];
    if (!entry || entry.status === "not_started") continue;
    started++;
    if (entry.status === "ran" || entry.status === "completed") ran++;
    if (entry.status === "completed") completed++;
  }
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, started, completed, ran, percent };
}
