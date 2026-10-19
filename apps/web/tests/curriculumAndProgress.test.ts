import assert from "node:assert/strict";
import { test } from "node:test";
import {
  evaluateCriterion,
  isValidLessonSchema,
  lessons,
  months,
} from "../lib/curriculum";
import {
  getLessonProgress,
  getMonthProgressSummary,
  markLessonCompleted,
  markLessonEdited,
  markLessonRan,
} from "../lib/progress";

test("all 10 Month 1-2 lessons satisfy enriched schema without placeholders", () => {
  assert.equal(lessons.length, 10);
  assert.equal(months.length, 6);

  for (const lesson of lessons) {
    assert.equal(
      isValidLessonSchema(lesson),
      true,
      `Lesson ${lesson.id} failed schema check`,
    );
    const serialized = JSON.stringify(lesson).toLowerCase();
    assert.doesNotMatch(serialized, /lorem|ipsum|todo|placeholder/);
    assert.equal(lesson.challengeLevels.length, 3);
    assert.deepEqual(
      lesson.challengeLevels.map((c) => c.level),
      ["Mudah", "Hebat", "Bintang"],
    );
    assert.ok(lesson.vocabulary.length >= 1 && lesson.vocabulary.length <= 3);
  }
});

test("evaluateCriterion deterministically checks student progress", () => {
  const blocks = [
    { id: "1", kind: "start" as const },
    { id: "2", kind: "repeat" as const, value: 3 },
    { id: "3", kind: "move" as const },
    { id: "4", kind: "ifStar" as const },
    { id: "5", kind: "score" as const },
  ];
  assert.equal(
    evaluateCriterion("has_start", {
      blocks,
      hasRun: false,
      starCaught: false,
      saved: false,
    }),
    true,
  );
  assert.equal(
    evaluateCriterion("reach_star", {
      blocks,
      hasRun: false,
      starCaught: true,
      saved: false,
    }),
    false,
  );
  assert.equal(
    evaluateCriterion("reach_star", {
      blocks,
      hasRun: true,
      starCaught: true,
      saved: false,
    }),
    true,
  );
  assert.equal(
    evaluateCriterion("saved_project", {
      blocks,
      hasRun: true,
      starCaught: true,
      saved: true,
    }),
    true,
  );
});

test("local progress persists across reload and never marks completed merely on read", () => {
  const store = new Map<string, string>();
  const prevWin = (globalThis as Record<string, unknown>).window;
  const prevStorage = (globalThis as Record<string, unknown>).localStorage;

  (globalThis as Record<string, unknown>).window = {
    dispatchEvent: () => true,
  };
  (globalThis as Record<string, unknown>).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
  };

  try {
    const initial = getLessonProgress("1-1");
    assert.equal(initial.status, "not_started");

    const edited = markLessonEdited("1-1");
    assert.equal(edited.status, "in_progress");

    const ran = markLessonRan("1-1", true);
    assert.equal(ran.status, "ran");
    assert.equal(ran.starReached, true);
    assert.equal(ran.runsCount, 1);

    const completed = markLessonCompleted("1-1", "proj-123");
    assert.equal(completed.status, "completed");
    assert.equal(completed.savedProjectId, "proj-123");

    const reEdited = markLessonEdited("1-1");
    assert.equal(reEdited.status, "completed");

    const summary = getMonthProgressSummary(["1-1", "1-2", "1-3", "1-4", "1-p"]);
    assert.equal(summary.total, 5);
    assert.equal(summary.completed, 1);
    assert.equal(summary.percent, 20);
  } finally {
    (globalThis as Record<string, unknown>).window = prevWin;
    (globalThis as Record<string, unknown>).localStorage = prevStorage;
  }
});
