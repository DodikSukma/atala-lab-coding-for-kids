"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, PlayCircle, Sparkles } from "lucide-react";
import {
  getLessonProgress,
  getMonthProgressSummary,
  PROGRESS_STATUS_LABELS,
  type LessonProgressStatus,
} from "@/lib/progress";

export function LessonStatusPill({ lessonId }: { lessonId: string }) {
  const [status, setStatus] = useState<LessonProgressStatus>("not_started");

  useEffect(() => {
    const sync = () => setStatus(getLessonProgress(lessonId).status);
    sync();
    window.addEventListener("atala-progress-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("atala-progress-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [lessonId]);

  const Icon =
    status === "completed"
      ? CheckCircle2
      : status === "ran"
        ? PlayCircle
        : status === "in_progress"
          ? Sparkles
          : Clock;

  return (
    <span className={`lesson-status-pill status-${status}`}>
      <Icon size={13} aria-hidden="true" />
      <span>{PROGRESS_STATUS_LABELS[status]}</span>
    </span>
  );
}

export function MonthProgressCard({
  lessonIds,
  label = "Progres Bulan Ini",
}: {
  lessonIds: string[];
  label?: string;
}) {
  const [summary, setSummary] = useState({
    total: lessonIds.length,
    started: 0,
    completed: 0,
    ran: 0,
    percent: 0,
  });

  useEffect(() => {
    const sync = () => setSummary(getMonthProgressSummary(lessonIds));
    sync();
    window.addEventListener("atala-progress-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("atala-progress-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [lessonIds]);

  return (
    <div className="month-progress-widget" aria-label={label}>
      <div className="month-progress-top">
        <span>
          <strong>{summary.completed}</strong> dari {summary.total} modul selesai
        </span>
        <span className="month-progress-pct">{summary.percent}%</span>
      </div>
      <div
        className="month-progress-bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={summary.percent}
      >
        <div
          className="month-progress-fill"
          style={{ width: `${Math.max(summary.started > 0 ? 8 : 0, summary.percent)}%` }}
        />
      </div>
      {summary.started > 0 && summary.completed < summary.total && (
        <small className="month-progress-sub">
          {summary.started} modul sudah dicoba · Terus lanjutkan misimu!
        </small>
      )}
    </div>
  );
}
