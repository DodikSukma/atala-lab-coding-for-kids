export type Point = { x: number; y: number };
export type StrokeStyle = "solid" | "dashed";

export type BaseElementStyle = {
  opacity?: number;
  strokeStyle?: StrokeStyle;
  fill?: string;
  rotation?: number;
};

export type Stroke = BaseElementStyle & {
  id: string;
  type: "stroke";
  points: Point[];
  color: string;
  width: number;
};

export type HighlighterItem = BaseElementStyle & {
  id: string;
  type: "highlighter";
  points: Point[];
  color: string;
  width: number;
};

export type Shape = BaseElementStyle & {
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

export type LineItem = BaseElementStyle & {
  id: string;
  type: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
};

export type ArrowItem = BaseElementStyle & {
  id: string;
  type: "arrow";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
};

export type TextItem = BaseElementStyle & {
  id: string;
  type: "text";
  x: number;
  y: number;
  w?: number;
  h?: number;
  text: string;
  color: string;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
};

export type StickyItem = BaseElementStyle & {
  id: string;
  type: "sticky";
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  color: string;
  fill?: string;
  fontSize?: number;
};

export type ImageItem = BaseElementStyle & {
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
  | Stroke
  | HighlighterItem
  | Shape
  | Ellipse
  | LineItem
  | ArrowItem
  | TextItem
  | StickyItem
  | ImageItem;

export type Note = {
  id: string;
  title: string;
  elements: NoteElement[];
  pageCount?: number;
  schemaVersion?: number;
  updatedAt: string;
};

export const NOTE_SCHEMA_VERSION = 2;
export const BOARD_WIDTH = 960;
export const BOARD_PAGE_HEIGHT = 1358;

export function isNoteElement(value: unknown): value is NoteElement {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.color !== "string")
    return false;
  if (item.opacity !== undefined && (!Number.isFinite(item.opacity) || (item.opacity as number) < 0.05 || (item.opacity as number) > 1))
    return false;
  if (item.strokeStyle !== undefined && !["solid", "dashed"].includes(String(item.strokeStyle)))
    return false;

  if (item.type === "stroke" || item.type === "highlighter") {
    return (
      Number.isFinite(item.width) &&
      Array.isArray(item.points) &&
      item.points.length <= 5000 &&
      item.points.every(
        (p: Point) => Boolean(p) && Number.isFinite(p.x) && Number.isFinite(p.y),
      )
    );
  }
  if (item.type === "rect" || item.type === "ellipse") {
    return ["x", "y", "w", "h", "width"].every((k) => Number.isFinite(item[k]));
  }
  if (item.type === "arrow" || item.type === "line") {
    return ["x1", "y1", "x2", "y2", "width"].every((k) =>
      Number.isFinite(item[k]),
    );
  }
  if (item.type === "image") {
    return (
      ["x", "y", "w", "h"].every((k) => Number.isFinite(item[k])) &&
      (item.w as number) > 0 &&
      (item.h as number) > 0 &&
      typeof item.dataUrl === "string" &&
      item.dataUrl.length < 4_000_000 &&
      /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(item.dataUrl)
    );
  }
  if (item.type === "text") {
    return (
      typeof item.text === "string" &&
      item.text.length <= 1000 &&
      Number.isFinite(item.x) &&
      Number.isFinite(item.y)
    );
  }
  if (item.type === "sticky") {
    return (
      typeof item.text === "string" &&
      item.text.length <= 1000 &&
      ["x", "y", "w", "h"].every((k) => Number.isFinite(item[k])) &&
      (item.w as number) > 0 &&
      (item.h as number) > 0
    );
  }
  return false;
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

export function migrateElement(el: NoteElement): NoteElement {
  const base = {
    opacity: el.opacity ?? (el.type === "highlighter" ? 0.38 : 1),
    strokeStyle: el.strokeStyle ?? ("solid" as StrokeStyle),
  };
  if (el.type === "text") {
    const lines = el.text.split("\n");
    const fontSize = el.fontSize ?? 24;
    const maxChars = Math.max(4, ...lines.map((l) => l.length));
    return {
      ...el,
      ...base,
      fontSize,
      fontWeight: el.fontWeight ?? "normal",
      w: el.w ?? Math.max(80, Math.round(maxChars * fontSize * 0.58)),
      h: el.h ?? Math.max(32, Math.round(lines.length * fontSize * 1.35)),
    };
  }
  if (el.type === "sticky") {
    return {
      ...el,
      ...base,
      fill: el.fill ?? "#fef08a",
      fontSize: el.fontSize ?? 20,
    };
  }
  if (el.type === "rect" || el.type === "ellipse") {
    return {
      ...el,
      ...base,
      fill: el.fill ?? "transparent",
    };
  }
  return { ...el, ...base };
}

export function migrateNote(raw: unknown): Note | null {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as Record<string, unknown>;
  if (typeof candidate.id !== "string" || typeof candidate.title !== "string")
    return null;
  if (!Array.isArray(candidate.elements)) return null;

  const validElements = candidate.elements
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      if (obj.type === "stroke" && obj.width === undefined) {
        return { ...obj, width: 4 };
      }
      return obj;
    })
    .filter(isNoteElement)
    .map(migrateElement);

  const computedMaxPage = validElements.reduce((maxP, item) => {
    const y =
      item.type === "stroke" || item.type === "highlighter"
        ? Math.max(0, ...item.points.map((p) => p.y))
        : item.type === "arrow" || item.type === "line"
          ? Math.max(item.y1, item.y2)
          : item.y;
    return Math.max(maxP, Math.floor(y / BOARD_PAGE_HEIGHT) + 1);
  }, 1);

  const rawPageCount =
    typeof candidate.pageCount === "number" &&
    Number.isInteger(candidate.pageCount) &&
    candidate.pageCount > 0
      ? candidate.pageCount
      : 1;

  return {
    id: candidate.id,
    title: candidate.title.slice(0, 100) || "Catatan baru",
    elements: validElements.slice(0, 500),
    pageCount: Math.max(rawPageCount, computedMaxPage),
    schemaVersion: NOTE_SCHEMA_VERSION,
    updatedAt:
      typeof candidate.updatedAt === "string"
        ? candidate.updatedAt
        : new Date().toISOString(),
  };
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
