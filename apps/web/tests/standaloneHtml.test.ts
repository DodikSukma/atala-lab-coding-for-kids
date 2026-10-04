import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { buildStandaloneHtml } from "../lib/standaloneHtml";
import { runBlocks } from "../lib/runtime";
import type { Project } from "../lib/projects";

const project: Project = {
  id: "demo",
  title: "Game Tangkap Bintang",
  lessonId: "2-p",
  updatedAt: "2026-10-01T00:00:00Z",
  scene: { backdrop: "garden", sprite: "cat" },
  blocks: [
    { id: "a", kind: "key" },
    { id: "b", kind: "repeat", value: 3 },
    { id: "c", kind: "move" },
    { id: "d", kind: "ifStar" },
    { id: "e", kind: "score" },
    { id: "f", kind: "say", value: "Aku berhasil!" },
  ],
};

test("standalone HTML has embedded content and safe student text", () => {
  const html = buildStandaloneHtml({
    ...project,
    title: '</script><script>alert("x")</script>',
  });
  assert.match(html, /<!doctype html>/i);
  assert.match(html, /default-src 'none'/);
  assert.doesNotMatch(html, /<(?:script|link|img)[^>]+(?:src|href)\s*=/i);
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;\/script&gt;/);
  assert.match(html, /\\u003c\/script/);
  assert.match(html, /Tokoh: Kiki/);
  assert.match(
    buildStandaloneHtml({
      ...project,
      scene: { backdrop: "space", sprite: "bot" },
    }),
    /Tokoh: Kiko/,
  );
});

test("embedded offline runtime matches game blocks", () => {
  const html = buildStandaloneHtml(project);
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script);
  const nodes = new Map<string, Record<string, unknown>>();
  const node = (id: string) => {
    if (!nodes.has(id))
      nodes.set(id, {
        style: {},
        classList: { toggle() {} },
        textContent: "",
        disabled: false,
        addEventListener() {},
      });
    return nodes.get(id);
  };
  const context = {
    document: { getElementById: node, querySelectorAll: () => [] },
    setInterval: () => 1,
    clearInterval: () => {},
  };
  const offlineFrames = vm.runInNewContext(
    `${script}\nrunBlocks("key")`,
    context,
  ) as Array<Record<string, unknown>>;
  const expected = runBlocks(project.blocks, "key");
  assert.deepEqual(
    JSON.parse(
      JSON.stringify(
        offlineFrames.map((f) => [
          f.x,
          f.y,
          f.direction,
          f.message,
          f.score,
          f.starCaught,
        ]),
      ),
    ),
    expected.map((f) => [
      f.x,
      f.y,
      f.direction,
      f.message,
      f.score,
      f.starCaught,
    ]),
  );
  assert.equal(offlineFrames.at(-1)?.score, 1);
  assert.equal(offlineFrames.at(-1)?.x, 4);
});

test("offline animation starts on open and matches turns, speech, wait, and score", () => {
  const animation: Project = {
    ...project,
    title: "Cerita Gerak",
    blocks: [
      { id: "s", kind: "start" },
      { id: "l", kind: "left" },
      { id: "r", kind: "right" },
      { id: "m", kind: "move" },
      { id: "w", kind: "wait" },
      { id: "t", kind: "say", value: "Halo!" },
      { id: "p", kind: "score" },
    ],
  };
  const script = buildStandaloneHtml(animation).match(
    /<script>([\s\S]*?)<\/script>/,
  )?.[1];
  assert.ok(script);
  let scheduled = 0;
  const node = () => ({
    style: {},
    classList: { toggle() {} },
    textContent: "",
    disabled: false,
    addEventListener() {},
  });
  const result = vm.runInNewContext(`${script}\nrunBlocks("start")`, {
    document: { getElementById: node, querySelectorAll: () => [] },
    setInterval: () => {
      scheduled++;
      return 1;
    },
    clearInterval: () => {},
  }) as Array<Record<string, unknown>>;
  assert.equal(
    scheduled,
    1,
    "opening a start-trigger project schedules playback",
  );
  assert.deepEqual(
    JSON.parse(
      JSON.stringify(
        result.map((f) => [f.x, f.y, f.direction, f.message, f.score]),
      ),
    ),
    runBlocks(animation.blocks, "start").map((f) => [
      f.x,
      f.y,
      f.direction,
      f.message,
      f.score,
    ]),
  );
});
