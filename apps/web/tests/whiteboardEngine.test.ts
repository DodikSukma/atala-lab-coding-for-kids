import assert from "node:assert/strict";
import { test } from "node:test";
import { migrateNote, type NoteElement } from "../lib/notes";
import {
  createInitialWhiteboardState,
  whiteboardReducer,
} from "../lib/whiteboard/reducer";
import {
  boardToScreenPoint,
  clampZoom,
  fitToPageZoom,
  getElementBounds,
  moveElements,
  resizeElement,
  screenToBoardPoint,
  smoothPoints,
} from "../lib/whiteboard/transform";
import {
  parseImportedNoteJson,
  renderPageToSvgString,
  serializeNoteJson,
} from "../lib/whiteboard/persistence";
import { buildNotePdf } from "../lib/notePdf";
import { resolveWhiteboardShortcut } from "../lib/whiteboard/shortcuts";

test("whiteboard reducer manages history, multi-select, copy/paste, duplicate, and alignment", () => {
  let state = createInitialWhiteboardState("note-1");

  const rectA: NoteElement = {
    id: "r1",
    type: "rect",
    x: 100,
    y: 120,
    w: 80,
    h: 60,
    color: "#2563eb",
    width: 4,
  };
  const rectB: NoteElement = {
    id: "r2",
    type: "rect",
    x: 300,
    y: 240,
    w: 100,
    h: 80,
    color: "#7c3aed",
    width: 4,
  };

  state = whiteboardReducer(state, {
    type: "ADD_ELEMENT",
    element: rectA,
    selectNew: true,
  });
  state = whiteboardReducer(state, {
    type: "ADD_ELEMENT",
    element: rectB,
    selectNew: false,
  });
  assert.equal(state.present.elements.length, 2);
  assert.equal(state.past.length, 2);

  state = whiteboardReducer(state, {
    type: "SELECT_MARQUEE",
    box: { x: 50, y: 50, w: 400, h: 350 },
  });
  assert.deepEqual(state.selectedIds, ["r1", "r2"]);

  state = whiteboardReducer(state, { type: "MOVE_SELECTED", dx: 20, dy: 30 });
  assert.equal((state.present.elements[0] as typeof rectA).x, 120);
  assert.equal((state.present.elements[1] as typeof rectB).y, 270);

  state = whiteboardReducer(state, {
    type: "ALIGN_SELECTED",
    alignment: "left",
  });
  assert.equal(
    (state.present.elements[0] as typeof rectA).x,
    (state.present.elements[1] as typeof rectB).x,
  );

  state = whiteboardReducer(state, { type: "COPY_SELECTED" });
  state = whiteboardReducer(state, { type: "PASTE_CLIPBOARD" });
  assert.equal(state.present.elements.length, 4);

  state = whiteboardReducer(state, { type: "SELECT_SINGLE", id: "r1" });
  state = whiteboardReducer(state, { type: "DUPLICATE_SELECTED" });
  assert.equal(state.present.elements.length, 5);

  state = whiteboardReducer(state, { type: "UNDO" });
  assert.equal(state.present.elements.length, 4);
  state = whiteboardReducer(state, { type: "REDO" });
  assert.equal(state.present.elements.length, 5);
});

test("coordinate conversion, resize, and pen smoothing work accurately", () => {
  const svgRect = { left: 100, top: 50, width: 480, height: 679 };
  const boardPt = screenToBoardPoint({
    clientX: 340,
    clientY: 389.5,
    svgRect,
    pageIndex: 1,
  });
  assert.equal(boardPt.x, 480);
  assert.equal(boardPt.y, 1358 + 679);

  const screenPt = boardToScreenPoint({
    point: boardPt,
    svgRect,
    pageIndex: 1,
  });
  assert.ok(Math.abs(screenPt.x - 340) < 1);
  assert.ok(Math.abs(screenPt.y - 389.5) < 1);

  assert.equal(clampZoom(5), 2.5);
  assert.equal(clampZoom(0.1), 0.4);
  assert.ok(fitToPageZoom(800) > 0.5 && fitToPageZoom(800) <= 1.25);

  const rawPoints = [
    { x: 10, y: 10 },
    { x: 20, y: 30 },
    { x: 40, y: 20 },
  ];
  const smoothed = smoothPoints(rawPoints);
  assert.ok(smoothed.length > rawPoints.length);
  assert.deepEqual(smoothed[0], rawPoints[0]);
  assert.deepEqual(smoothed.at(-1), rawPoints.at(-1));

  const sticky: NoteElement = {
    id: "st1",
    type: "sticky",
    x: 100,
    y: 100,
    w: 200,
    h: 150,
    text: "Ide guru\nBaris 2",
    color: "#17213b",
    fill: "#fef08a",
  };
  const resizedSticky = resizeElement(sticky, "se", 50, 40);
  assert.equal(resizedSticky.type, "sticky");
  if (resizedSticky.type === "sticky") {
    assert.equal(resizedSticky.w, 250);
    assert.equal(resizedSticky.h, 190);
  }

  const movedAll = moveElements([sticky], ["st1"], 15, 25, 2);
  assert.equal(getElementBounds(movedAll[0]).x, 115);
});

test("schema migration, JSON import/export, SVG/PNG page render, and multi-page A4 PDF work", () => {
  const legacyRaw = {
    id: "legacy-1",
    title: "Catatan Lama",
    elements: [
      { id: "t1", type: "text", x: 120, y: 200, text: "Baris 1\nBaris 2", color: "#17213b" },
      { id: "s1", type: "sticky", x: 150, y: 1500, w: 200, h: 140, text: "Catatan halaman 2", color: "#17213b" },
    ],
    updatedAt: "2026-10-01T00:00:00Z",
  };

  const migrated = migrateNote(legacyRaw);
  assert.ok(migrated);
  assert.equal(migrated.pageCount, 2);
  assert.equal(migrated.schemaVersion, 2);

  const jsonStr = serializeNoteJson(migrated);
  const reimported = parseImportedNoteJson(jsonStr);
  assert.notEqual(reimported.id, migrated.id);
  assert.equal(reimported.pageCount, 2);
  assert.equal(reimported.elements.length, 2);

  const svgPage1 = renderPageToSvgString(reimported.elements, 0);
  const svgPage2 = renderPageToSvgString(reimported.elements, 1);
  assert.match(svgPage1, /Baris 1/);
  assert.doesNotMatch(svgPage1, /Catatan halaman 2/);
  assert.match(svgPage2, /Catatan halaman 2/);

  const pdf = buildNotePdf(reimported.title, reimported.elements, reimported.pageCount);
  assert.equal(pdf.getNumberOfPages(), 2);
  assert.match(pdf.output(), /Catatan halaman 2/);
});

test("keyboard shortcuts resolve properly and are suppressed when typing in inputs", () => {
  assert.deepEqual(
    resolveWhiteboardShortcut({ key: "v", isEditingInput: false }),
    { type: "SET_TOOL", tool: "select" },
  );
  assert.deepEqual(
    resolveWhiteboardShortcut({ key: "z", ctrlKey: true, isEditingInput: false }),
    { type: "UNDO" },
  );
  assert.deepEqual(
    resolveWhiteboardShortcut({
      key: "z",
      ctrlKey: true,
      shiftKey: true,
      isEditingInput: false,
    }),
    { type: "REDO" },
  );
  assert.deepEqual(
    resolveWhiteboardShortcut({ key: "d", ctrlKey: true, isEditingInput: false }),
    { type: "DUPLICATE_SELECTED" },
  );
  assert.equal(
    resolveWhiteboardShortcut({ key: "v", isEditingInput: true }),
    null,
  );
  assert.equal(
    resolveWhiteboardShortcut({
      key: "Backspace",
      isEditingInput: true,
    }),
    null,
  );
});
