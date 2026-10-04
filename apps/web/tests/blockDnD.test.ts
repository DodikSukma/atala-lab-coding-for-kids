import { test } from "node:test";
import { strict as assert } from "node:assert";
import { insertBlock, reorderBlock } from "../lib/blockDnD";
import type { Block } from "../lib/curriculum";
const blocks: Block[] = [
  { id: "a", kind: "start" },
  { id: "b", kind: "move" },
  { id: "c", kind: "say" },
];
test("palette block inserts at drop position", () =>
  assert.deepEqual(
    insertBlock(blocks, "right", 1, "d").map((b) => b.id),
    ["a", "d", "b", "c"],
  ));
test("workspace drag reorders without duplicating", () =>
  assert.deepEqual(
    reorderBlock(blocks, "a", 3).map((b) => b.id),
    ["b", "c", "a"],
  ));
