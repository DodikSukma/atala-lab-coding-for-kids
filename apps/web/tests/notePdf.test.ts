import assert from "node:assert/strict";
import { test } from "node:test";
import { buildNotePdf } from "../lib/notePdf";

test("all A4 board pages are exported in order", () => {
  const pdf = buildNotePdf("Catatan kelas", [
    { id: "a", type: "text", x: 100, y: 180, text: "Halaman pertama", color: "#17213b" },
    { id: "b", type: "text", x: 100, y: 1538, text: "Halaman kedua", color: "#17213b" },
  ], 2);
  assert.equal(pdf.getNumberOfPages(), 2);
  assert.ok(Math.abs(pdf.internal.pageSize.getWidth() - 595.28) < 1);
  assert.ok(Math.abs(pdf.internal.pageSize.getHeight() - 841.89) < 1);
  const data = pdf.output();
  assert.match(data, /Halaman pertama/);
  assert.match(data, /Halaman kedua/);
});
