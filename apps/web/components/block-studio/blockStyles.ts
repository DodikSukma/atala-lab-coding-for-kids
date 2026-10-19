import type { BlockKind } from "@/lib/curriculum";

export const blockClass: Record<BlockKind, string> = {
  start: "event",
  key: "event",
  move: "motion",
  left: "motion",
  right: "motion",
  say: "looks",
  wait: "looks",
  repeat: "control",
  ifStar: "control",
  score: "variable",
};
