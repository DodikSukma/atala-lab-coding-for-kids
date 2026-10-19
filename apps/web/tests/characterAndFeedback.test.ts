import assert from "node:assert/strict";
import { test } from "node:test";
import {
  deriveCharacterState,
  deriveDirectionLabel,
} from "../lib/characterState";
import {
  analyzeProgramRun,
  generateLearningFeedback,
} from "../lib/learningFeedback";
import { runBlocks, type Frame } from "../lib/runtime";
import type { Block } from "../lib/curriculum";

const baseFrame: Frame = {
  x: 1,
  y: 3,
  direction: 0,
  message: "",
  score: 0,
  active: "",
  starCaught: false,
};

test("character state derives idle, move, turn, talk, success, and error deterministically", () => {
  assert.equal(deriveCharacterState({ currentFrame: baseFrame }), "idle");

  assert.equal(
    deriveCharacterState({
      currentFrame: { ...baseFrame, x: 2 },
      prevFrame: baseFrame,
      playing: true,
    }),
    "move",
  );

  assert.equal(
    deriveCharacterState({
      currentFrame: { ...baseFrame, direction: 1 },
      prevFrame: baseFrame,
      playing: true,
    }),
    "turn",
  );

  assert.equal(
    deriveCharacterState({
      currentFrame: { ...baseFrame, message: "Halo!" },
      prevFrame: baseFrame,
      playing: true,
    }),
    "talk",
  );

  assert.equal(
    deriveCharacterState({
      currentFrame: { ...baseFrame, starCaught: true },
      prevFrame: baseFrame,
      playing: false,
    }),
    "success",
  );

  assert.equal(
    deriveCharacterState({
      currentFrame: baseFrame,
      hasError: true,
    }),
    "error",
  );

  assert.equal(deriveDirectionLabel(0), "Kanan →");
  assert.equal(deriveDirectionLabel(1), "Bawah ↓");
  assert.equal(deriveDirectionLabel(2), "Kiri ←");
  assert.equal(deriveDirectionLabel(3), "Atas ↑");
});

test("learning feedback produces specific deterministic messages for each program outcome", () => {
  const repeatBlocks: Block[] = [
    { id: "1", kind: "start" },
    { id: "2", kind: "repeat", value: 3 },
    { id: "3", kind: "move" },
  ];
  const repeatFrames = runBlocks(repeatBlocks, "start");
  const repeatFeedback = analyzeProgramRun({
    blocks: repeatBlocks,
    frames: repeatFrames,
    trigger: "start",
    sprite: "bot",
  });
  assert.equal(repeatFeedback.starCaught, true);
  assert.equal(repeatFeedback.usedRepeat, true);
  assert.match(repeatFeedback.message, /pengulangan/);

  const shortBlocks: Block[] = [
    { id: "1", kind: "start" },
    { id: "2", kind: "move" },
    { id: "3", kind: "move" },
  ];
  const shortFrames = runBlocks(shortBlocks, "start");
  const shortMsg = generateLearningFeedback({
    blocks: shortBlocks,
    frames: shortFrames,
    trigger: "start",
    sprite: "bot",
  });
  assert.match(shortMsg, /Kiko bergerak 2 langkah ke kanan/);
  assert.match(shortMsg, /tambahkan 1 blok Maju/);

  const ifBlocks: Block[] = [
    { id: "1", kind: "start" },
    { id: "2", kind: "move" },
    { id: "3", kind: "ifStar" },
    { id: "4", kind: "say", value: "Menang!" },
  ];
  const ifFrames = runBlocks(ifBlocks, "start");
  const ifMsg = generateLearningFeedback({
    blocks: ifBlocks,
    frames: ifFrames,
    trigger: "start",
    sprite: "cat",
  });
  assert.match(ifMsg, /Blok Jika belum aktif karena Kiki belum menyentuh target/);
});
