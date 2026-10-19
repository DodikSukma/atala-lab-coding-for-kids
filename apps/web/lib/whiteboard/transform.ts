import {
  BOARD_PAGE_HEIGHT,
  BOARD_WIDTH,
  type NoteElement,
  type Point,
} from "./schema";

export type BoundingBox = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type ResizeHandle = "nw" | "ne" | "sw" | "se";

export type AlignmentKind =
  | "left"
  | "center"
  | "right"
  | "top"
  | "middle"
  | "bottom";

export type LayerOrderKind = "forward" | "backward" | "front" | "back";

export function clampZoom(zoom: number): number {
  return Math.max(0.4, Math.min(2.5, Math.round(zoom * 100) / 100));
}

export function fitToPageZoom(
  containerWidth: number,
  padding = 48,
): number {
  if (!Number.isFinite(containerWidth) || containerWidth <= 0) return 1;
  const available = Math.max(240, containerWidth - padding);
  return clampZoom(Math.min(1.25, available / BOARD_WIDTH));
}

export function screenToBoardPoint(params: {
  clientX: number;
  clientY: number;
  svgRect: { left: number; top: number; width: number; height: number };
  pageIndex: number;
}): Point {
  const { clientX, clientY, svgRect, pageIndex } = params;
  const safeWidth = Math.max(1, svgRect.width);
  const safeHeight = Math.max(1, svgRect.height);
  const localX = ((clientX - svgRect.left) * BOARD_WIDTH) / safeWidth;
  const localY = ((clientY - svgRect.top) * BOARD_PAGE_HEIGHT) / safeHeight;
  return {
    x: Math.max(0, Math.min(BOARD_WIDTH, Math.round(localX * 10) / 10)),
    y:
      pageIndex * BOARD_PAGE_HEIGHT +
      Math.max(0, Math.min(BOARD_PAGE_HEIGHT, Math.round(localY * 10) / 10)),
  };
}

export function boardToScreenPoint(params: {
  point: Point;
  svgRect: { left: number; top: number; width: number; height: number };
  pageIndex: number;
}): Point {
  const { point, svgRect, pageIndex } = params;
  const localY = point.y - pageIndex * BOARD_PAGE_HEIGHT;
  return {
    x: svgRect.left + (point.x / BOARD_WIDTH) * svgRect.width,
    y: svgRect.top + (localY / BOARD_PAGE_HEIGHT) * svgRect.height,
  };
}

export function smoothPoints(points: Point[], minDistance = 2.5): Point[] {
  if (points.length <= 2) return points;
  const filtered: Point[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = filtered[filtered.length - 1];
    const curr = points[i];
    if (Math.hypot(curr.x - prev.x, curr.y - prev.y) >= minDistance) {
      filtered.push(curr);
    }
  }
  filtered.push(points[points.length - 1]);
  if (filtered.length <= 2) return filtered;

  const smoothed: Point[] = [filtered[0]];
  for (let i = 0; i < filtered.length - 1; i++) {
    const p0 = filtered[i];
    const p1 = filtered[i + 1];
    smoothed.push({
      x: Math.round((0.75 * p0.x + 0.25 * p1.x) * 10) / 10,
      y: Math.round((0.75 * p0.y + 0.25 * p1.y) * 10) / 10,
    });
    smoothed.push({
      x: Math.round((0.25 * p0.x + 0.75 * p1.x) * 10) / 10,
      y: Math.round((0.25 * p0.y + 0.75 * p1.y) * 10) / 10,
    });
  }
  smoothed.push(filtered[filtered.length - 1]);
  return smoothed;
}

export function getElementBounds(el: NoteElement): BoundingBox {
  if (el.type === "stroke" || el.type === "highlighter") {
    if (!el.points.length) return { x: 0, y: 0, w: 0, h: 0 };
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const p of el.points) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    const pad = Math.max(4, el.width / 2);
    return {
      x: minX - pad,
      y: minY - pad,
      w: Math.max(8, maxX - minX + pad * 2),
      h: Math.max(8, maxY - minY + pad * 2),
    };
  }
  if (el.type === "arrow" || el.type === "line") {
    const minX = Math.min(el.x1, el.x2);
    const minY = Math.min(el.y1, el.y2);
    const maxX = Math.max(el.x1, el.x2);
    const maxY = Math.max(el.y1, el.y2);
    return {
      x: minX,
      y: minY,
      w: Math.max(12, maxX - minX),
      h: Math.max(12, maxY - minY),
    };
  }
  if (el.type === "text") {
    const fontSize = el.fontSize ?? 24;
    const lines = el.text.split("\n");
    const maxChars = Math.max(4, ...lines.map((l) => l.length));
    const w = el.w ?? Math.max(80, Math.round(maxChars * fontSize * 0.58));
    const h = el.h ?? Math.max(32, Math.round(lines.length * fontSize * 1.35));
    return {
      x: el.x,
      y: el.y - fontSize,
      w,
      h,
    };
  }
  return {
    x: el.x,
    y: el.y,
    w: el.w,
    h: el.h,
  };
}

export function getSelectionBounds(
  elements: NoteElement[],
  selectedIds: string[],
): BoundingBox | null {
  const selected = elements.filter((el) => selectedIds.includes(el.id));
  if (!selected.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const el of selected) {
    const b = getElementBounds(el);
    if (b.x < minX) minX = b.x;
    if (b.y < minY) minY = b.y;
    if (b.x + b.w > maxX) maxX = b.x + b.w;
    if (b.y + b.h > maxY) maxY = b.y + b.h;
  }
  return {
    x: minX,
    y: minY,
    w: Math.max(1, maxX - minX),
    h: Math.max(1, maxY - minY),
  };
}

export function boxesIntersect(a: BoundingBox, b: BoundingBox): boolean {
  return (
    a.x <= b.x + b.w &&
    a.x + a.w >= b.x &&
    a.y <= b.y + b.h &&
    a.y + a.h >= b.y
  );
}

export function pointInBox(p: Point, box: BoundingBox, padding = 6): boolean {
  return (
    p.x >= box.x - padding &&
    p.x <= box.x + box.w + padding &&
    p.y >= box.y - padding &&
    p.y <= box.y + box.h + padding
  );
}

export function moveSingleElement(
  el: NoteElement,
  dx: number,
  dy: number,
  pageCount = 10,
): NoteElement {
  const maxY = Math.max(1, pageCount) * BOARD_PAGE_HEIGHT;
  const clampX = (v: number) => Math.max(0, Math.min(BOARD_WIDTH, v));
  const clampY = (v: number) => Math.max(0, Math.min(maxY, v));

  if (el.type === "stroke" || el.type === "highlighter") {
    return {
      ...el,
      points: el.points.map((p) => ({
        x: clampX(p.x + dx),
        y: clampY(p.y + dy),
      })),
    };
  }
  if (el.type === "arrow" || el.type === "line") {
    return {
      ...el,
      x1: clampX(el.x1 + dx),
      y1: clampY(el.y1 + dy),
      x2: clampX(el.x2 + dx),
      y2: clampY(el.y2 + dy),
    };
  }
  if (el.type === "text") {
    return {
      ...el,
      x: Math.max(8, Math.min(BOARD_WIDTH - 40, el.x + dx)),
      y: Math.max(24, Math.min(maxY - 12, el.y + dy)),
    };
  }
  return {
    ...el,
    x: Math.max(0, Math.min(BOARD_WIDTH - el.w, el.x + dx)),
    y: Math.max(0, Math.min(maxY - el.h, el.y + dy)),
  };
}

export function moveElements(
  elements: NoteElement[],
  selectedIds: string[],
  dx: number,
  dy: number,
  pageCount = 10,
): NoteElement[] {
  if (!selectedIds.length || (dx === 0 && dy === 0)) return elements;
  const idSet = new Set(selectedIds);
  return elements.map((el) =>
    idSet.has(el.id) ? moveSingleElement(el, dx, dy, pageCount) : el,
  );
}

export function resizeElement(
  el: NoteElement,
  handle: ResizeHandle,
  dx: number,
  dy: number,
): NoteElement {
  if (
    el.type === "rect" ||
    el.type === "ellipse" ||
    el.type === "image" ||
    el.type === "sticky"
  ) {
    let { x, y, w, h } = el;
    const minSize = el.type === "sticky" ? 80 : 24;
    if (handle.includes("e")) {
      w = Math.max(minSize, Math.min(BOARD_WIDTH - x, w + dx));
    }
    if (handle.includes("s")) {
      h = Math.max(minSize, h + dy);
    }
    if (handle.includes("w")) {
      const nextX = Math.max(0, Math.min(x + w - minSize, x + dx));
      w = w + (x - nextX);
      x = nextX;
    }
    if (handle.includes("n")) {
      const nextY = Math.max(0, Math.min(y + h - minSize, y + dy));
      h = h + (y - nextY);
      y = nextY;
    }
    return { ...el, x, y, w, h };
  }
  if (el.type === "arrow" || el.type === "line") {
    if (handle === "nw" || handle === "sw") {
      return {
        ...el,
        x1: Math.max(0, Math.min(BOARD_WIDTH, el.x1 + dx)),
        y1: Math.max(0, el.y1 + dy),
      };
    }
    return {
      ...el,
      x2: Math.max(0, Math.min(BOARD_WIDTH, el.x2 + dx)),
      y2: Math.max(0, el.y2 + dy),
    };
  }
  if (el.type === "text") {
    const baseFontSize = el.fontSize ?? 24;
    const scaleDelta = (dx + dy) / 8;
    const nextFontSize = Math.max(
      14,
      Math.min(64, Math.round(baseFontSize + scaleDelta)),
    );
    const lines = el.text.split("\n");
    const maxChars = Math.max(4, ...lines.map((l) => l.length));
    return {
      ...el,
      fontSize: nextFontSize,
      w: Math.max(80, Math.round(maxChars * nextFontSize * 0.58)),
      h: Math.max(32, Math.round(lines.length * nextFontSize * 1.35)),
    };
  }
  if (el.type === "stroke" || el.type === "highlighter") {
    const bounds = getElementBounds(el);
    if (bounds.w < 4 || bounds.h < 4) return el;
    const scaleX = Math.max(0.25, (bounds.w + dx) / bounds.w);
    const scaleY = Math.max(0.25, (bounds.h + dy) / bounds.h);
    return {
      ...el,
      points: el.points.map((p) => ({
        x: Math.max(
          0,
          Math.min(BOARD_WIDTH, bounds.x + (p.x - bounds.x) * scaleX),
        ),
        y: Math.max(0, bounds.y + (p.y - bounds.y) * scaleY),
      })),
    };
  }
  return el;
}

export function cloneAndOffsetElements(
  elements: NoteElement[],
  offsetX = 24,
  offsetY = 24,
  pageCount = 10,
): NoteElement[] {
  return elements.map((el) => {
    const moved = moveSingleElement(el, offsetX, offsetY, pageCount);
    return {
      ...moved,
      id: crypto.randomUUID(),
    };
  });
}

export function alignElements(
  elements: NoteElement[],
  selectedIds: string[],
  alignment: AlignmentKind,
  pageCount = 10,
): NoteElement[] {
  if (selectedIds.length < 2) return elements;
  const groupBounds = getSelectionBounds(elements, selectedIds);
  if (!groupBounds) return elements;
  const idSet = new Set(selectedIds);

  return elements.map((el) => {
    if (!idSet.has(el.id)) return el;
    const b = getElementBounds(el);
    let dx = 0;
    let dy = 0;
    switch (alignment) {
      case "left":
        dx = groupBounds.x - b.x;
        break;
      case "center":
        dx = groupBounds.x + groupBounds.w / 2 - (b.x + b.w / 2);
        break;
      case "right":
        dx = groupBounds.x + groupBounds.w - (b.x + b.w);
        break;
      case "top":
        dy = groupBounds.y - b.y;
        break;
      case "middle":
        dy = groupBounds.y + groupBounds.h / 2 - (b.y + b.h / 2);
        break;
      case "bottom":
        dy = groupBounds.y + groupBounds.h - (b.y + b.h);
        break;
    }
    return moveSingleElement(el, dx, dy, pageCount);
  });
}

export function reorderElements(
  elements: NoteElement[],
  selectedIds: string[],
  order: LayerOrderKind,
): NoteElement[] {
  if (!selectedIds.length) return elements;
  const idSet = new Set(selectedIds);
  const selected = elements.filter((el) => idSet.has(el.id));
  const unselected = elements.filter((el) => !idSet.has(el.id));

  if (order === "front") {
    return [...unselected, ...selected];
  }
  if (order === "back") {
    return [...selected, ...unselected];
  }
  const next = [...elements];
  if (order === "forward") {
    for (let i = next.length - 2; i >= 0; i--) {
      if (idSet.has(next[i].id) && !idSet.has(next[i + 1].id)) {
        [next[i], next[i + 1]] = [next[i + 1], next[i]];
      }
    }
    return next;
  }
  for (let i = 1; i < next.length; i++) {
    if (idSet.has(next[i].id) && !idSet.has(next[i - 1].id)) {
      [next[i], next[i - 1]] = [next[i - 1], next[i]];
    }
  }
  return next;
}
