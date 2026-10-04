export type Point = { x: number; y: number };
export type Stroke = {
  id: string;
  type: "stroke";
  points: Point[];
  color: string;
  width: number;
};
export type Shape = {
  id: string;
  type: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  width: number;
};
export type Ellipse = Omit<Shape, "type"> & { type: "ellipse" };
export type TextItem = {
  id: string;
  type: "text";
  x: number;
  y: number;
  text: string;
  color: string;
};
export type ArrowItem = {
  id: string;
  type: "arrow";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
};
export type ImageItem = {
  id: string;
  type: "image";
  x: number;
  y: number;
  w: number;
  h: number;
  dataUrl: string;
  color: string;
};
export type NoteElement =
  Stroke | Shape | Ellipse | TextItem | ArrowItem | ImageItem;
export type Note = {
  id: string;
  title: string;
  elements: NoteElement[];
  pageCount?: number;
  updatedAt: string;
};
export const BOARD_WIDTH = 960;
export const BOARD_PAGE_HEIGHT = 1358;
const KEY = "atala-lab-notes-v1";
export function readNotes(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? value.filter(isNote) : [];
  } catch {
    return [];
  }
}
export function isNote(value: unknown): value is Note {
  if (!value || typeof value !== "object") return false;
  const note = value as Record<string, unknown>;
  return (
    typeof note.id === "string" &&
    typeof note.title === "string" &&
    note.title.length <= 100 &&
    (note.pageCount === undefined ||
      (Number.isInteger(note.pageCount) && (note.pageCount as number) > 0)) &&
    Array.isArray(note.elements) &&
    note.elements.length <= 500 &&
    note.elements.every(isNoteElement)
  );
}
function isNoteElement(value: unknown): value is NoteElement {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.color !== "string")
    return false;
  if (item.type === "stroke")
    return (
      Array.isArray(item.points) &&
      item.points.length <= 5000 &&
      item.points.every(
        (p: Point) => Number.isFinite(p.x) && Number.isFinite(p.y),
      )
    );
  if (item.type === "rect" || item.type === "ellipse")
    return ["x", "y", "w", "h"].every((k) => Number.isFinite(item[k]));
  if (item.type === "arrow")
    return ["x1", "y1", "x2", "y2", "width"].every((k) =>
      Number.isFinite(item[k]),
    );
  if (item.type === "image")
    return (
      ["x", "y", "w", "h"].every((k) => Number.isFinite(item[k])) &&
      (item.w as number) > 0 &&
      (item.h as number) > 0 &&
      typeof item.dataUrl === "string" &&
      item.dataUrl.length < 4_000_000 &&
      /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(item.dataUrl)
    );
  if (item.type === "text")
    return (
      typeof item.text === "string" &&
      item.text.length <= 200 &&
      Number.isFinite(item.x) &&
      Number.isFinite(item.y)
    );
  return false;
}
export function saveNote(note: Note) {
  const other = readNotes().filter((n) => n.id !== note.id);
  localStorage.setItem(KEY, JSON.stringify([note, ...other]));
}
export function deleteNote(id: string) {
  localStorage.setItem(
    KEY,
    JSON.stringify(readNotes().filter((n) => n.id !== id)),
  );
}
export function normalizeShape(start: Point, end: Point) {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    w: Math.abs(end.x - start.x),
    h: Math.abs(end.y - start.y),
  };
}
export function arrowHead(
  start: Point,
  end: Point,
  size = 18,
): [Point, Point, Point] {
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const wing = Math.PI / 6;
  return [
    end,
    {
      x: end.x - size * Math.cos(angle - wing),
      y: end.y - size * Math.sin(angle - wing),
    },
    {
      x: end.x - size * Math.cos(angle + wing),
      y: end.y - size * Math.sin(angle + wing),
    },
  ];
}
