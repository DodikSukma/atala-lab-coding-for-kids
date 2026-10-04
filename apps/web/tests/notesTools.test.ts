import assert from "node:assert/strict";
import { test } from "node:test";
import { arrowHead, isNote } from "../lib/notes";
import { buildNotePdf } from "../lib/notePdf";

const tinyPng =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC";

test("arrowhead points toward the dragged endpoint in either direction", () => {
  const [rightTip, rightA, rightB] = arrowHead(
    { x: 10, y: 20 },
    { x: 100, y: 20 },
  );
  const [leftTip, leftA, leftB] = arrowHead(
    { x: 100, y: 20 },
    { x: 10, y: 20 },
  );
  assert.equal(rightTip.x, 100);
  assert.ok(rightA.x < 100 && rightB.x < 100);
  assert.equal(leftTip.x, 10);
  assert.ok(leftA.x > 10 && leftB.x > 10);
});

test("pasted image and arrow survive note validation and A4 export", () => {
  const elements = [
    {
      id: "arrow",
      type: "arrow" as const,
      x1: 50,
      y1: 1450,
      x2: 300,
      y2: 1500,
      color: "#2563eb",
      width: 5,
    },
    {
      id: "image",
      type: "image" as const,
      x: 80,
      y: 1600,
      w: 200,
      h: 100,
      dataUrl: tinyPng,
      color: "#17213b",
    },
  ];
  assert.equal(
    isNote({
      id: "n",
      title: "Uji",
      elements,
      pageCount: 2,
      updatedAt: "2026-10-01T00:00:00Z",
    }),
    true,
  );
  const pdf = buildNotePdf("Uji", elements, 2);
  assert.equal(pdf.getNumberOfPages(), 2);
  assert.ok(pdf.output("arraybuffer").byteLength > 1000);
});
