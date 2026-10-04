import { test } from "node:test";
import { strict as assert } from "node:assert";
import { runBlocks } from "../lib/runtime";
import type { Block } from "../lib/curriculum";
const make = (...kinds: Block["kind"][]): Block[] =>
  kinds.map((kind, i) => ({ id: String(i), kind }));
test("move reaches star and conditional awards point", () => {
  const frames = runBlocks(
    make("start", "move", "move", "move", "ifStar", "score"),
  );
  assert.equal(frames.at(-1)?.x, 4);
  assert.equal(frames.at(-1)?.score, 1);
  assert.equal(frames.at(-1)?.starCaught, true);
});
test("conditional skips action before star", () => {
  const frames = runBlocks(make("start", "move", "ifStar", "score"));
  assert.equal(frames.at(-1)?.score, 0);
});
test("repeat applies next block three times", () => {
  const frames = runBlocks(make("start", "repeat", "move"));
  assert.equal(frames.at(-1)?.x, 4);
});
test("missing start gives clear error", () =>
  assert.throws(() => runBlocks(make("move")), /Ketika mulai/));

test("button event starts only when action button is pressed", () => {
  const blocks = make("key", "move");
  assert.equal(runBlocks(blocks, "key").at(-1)?.x, 2);
  assert.throws(() => runBlocks(blocks), /Ketika mulai/);
});
