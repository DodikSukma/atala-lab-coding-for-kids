import {
  BOARD_PAGE_HEIGHT,
  BOARD_WIDTH,
  NOTE_SCHEMA_VERSION,
  NOTES_STORAGE_KEY,
  arrowHead,
  migrateNote,
  type Note,
  type NoteElement,
} from "../notes";

const escapeXml = (str: string) =>
  str.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c]!,
  );

export function isElementVisibleOnPage(
  item: NoteElement,
  pageIndex: number,
): boolean {
  const low = pageIndex * BOARD_PAGE_HEIGHT;
  const high = low + BOARD_PAGE_HEIGHT;
  if (item.type === "stroke" || item.type === "highlighter") {
    return item.points.some((p) => p.y >= low && p.y <= high);
  }
  if (item.type === "arrow" || item.type === "line") {
    return (
      (item.y1 >= low && item.y1 <= high) ||
      (item.y2 >= low && item.y2 <= high)
    );
  }
  return item.y >= low && item.y < high;
}

export function renderPageToSvgString(
  elements: NoteElement[],
  pageIndex = 0,
): string {
  const offset = pageIndex * BOARD_PAGE_HEIGHT;
  const pageElements = elements.filter((el) =>
    isElementVisibleOnPage(el, pageIndex),
  );

  const body = pageElements
    .map((item) => {
      const opacity =
        item.opacity ?? (item.type === "highlighter" ? 0.38 : 1);
      const dash =
        item.strokeStyle === "dashed" ? ` stroke-dasharray="10 6"` : "";

      if (item.type === "stroke" || item.type === "highlighter") {
        const pts = item.points
          .map((p) => `${p.x},${p.y - offset}`)
          .join(" ");
        return `<polyline points="${pts}" fill="none" stroke="${escapeXml(item.color)}" stroke-width="${item.width}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"${dash}/>`;
      }
      if (item.type === "rect") {
        const fill =
          item.fill && item.fill !== "transparent"
            ? escapeXml(item.fill)
            : "none";
        return `<rect x="${item.x}" y="${item.y - offset}" width="${item.w}" height="${item.h}" fill="${fill}" stroke="${escapeXml(item.color)}" stroke-width="${item.width}" opacity="${opacity}"${dash}/>`;
      }
      if (item.type === "ellipse") {
        const fill =
          item.fill && item.fill !== "transparent"
            ? escapeXml(item.fill)
            : "none";
        return `<ellipse cx="${item.x + item.w / 2}" cy="${item.y - offset + item.h / 2}" rx="${item.w / 2}" ry="${item.h / 2}" fill="${fill}" stroke="${escapeXml(item.color)}" stroke-width="${item.width}" opacity="${opacity}"${dash}/>`;
      }
      if (item.type === "line") {
        return `<line x1="${item.x1}" y1="${item.y1 - offset}" x2="${item.x2}" y2="${item.y2 - offset}" stroke="${escapeXml(item.color)}" stroke-width="${item.width}" stroke-linecap="round" opacity="${opacity}"${dash}/>`;
      }
      if (item.type === "arrow") {
        const [tip, left, right] = arrowHead(
          { x: item.x1, y: item.y1 - offset },
          { x: item.x2, y: item.y2 - offset },
        );
        return `<g opacity="${opacity}"><line x1="${item.x1}" y1="${item.y1 - offset}" x2="${item.x2}" y2="${item.y2 - offset}" stroke="${escapeXml(item.color)}" stroke-width="${item.width}" stroke-linecap="round"${dash}/><polygon points="${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}" fill="${escapeXml(item.color)}"/></g>`;
      }
      if (item.type === "sticky") {
        const fill = escapeXml(item.fill || "#fef08a");
        const fontSize = item.fontSize || 20;
        const lines = item.text.split("\n");
        const textNodes = lines
          .map(
            (line, idx) =>
              `<text x="${item.x + 16}" y="${item.y - offset + 34 + idx * fontSize * 1.3}" fill="${escapeXml(item.color)}" font-family="Arial, sans-serif" font-size="${fontSize}">${escapeXml(line)}</text>`,
          )
          .join("");
        return `<g opacity="${opacity}"><rect x="${item.x}" y="${item.y - offset}" width="${item.w}" height="${item.h}" rx="8" fill="${fill}" stroke="#eab308" stroke-width="2"/>${textNodes}</g>`;
      }
      if (item.type === "image") {
        return `<image href="${escapeXml(item.dataUrl)}" x="${item.x}" y="${item.y - offset}" width="${item.w}" height="${item.h}" preserveAspectRatio="none" opacity="${opacity}"/>`;
      }
      if (item.type === "text") {
        const fontSize = item.fontSize || 24;
        const weight = item.fontWeight === "bold" ? "bold" : "normal";
        const lines = item.text.split("\n");
        return lines
          .map(
            (line, idx) =>
              `<text x="${item.x}" y="${item.y - offset + idx * fontSize * 1.3}" fill="${escapeXml(item.color)}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="${weight}" opacity="${opacity}">${escapeXml(line)}</text>`,
          )
          .join("");
      }
      return "";
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${BOARD_WIDTH}" height="${BOARD_PAGE_HEIGHT}" viewBox="0 0 ${BOARD_WIDTH} ${BOARD_PAGE_HEIGHT}"><rect width="100%" height="100%" fill="#ffffff"/>${body}</svg>`;
}

export async function exportPageAsPng(
  title: string,
  elements: NoteElement[],
  pageIndex = 0,
): Promise<void> {
  const svgString = renderPageToSvgString(elements, pageIndex);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Gagal merender halaman ke PNG."));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = BOARD_WIDTH;
    canvas.height = BOARD_PAGE_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Kanvas PNG tidak tersedia.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_PAGE_HEIGHT);
    ctx.drawImage(img, 0, 0, BOARD_WIDTH, BOARD_PAGE_HEIGHT);
    const pngUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = pngUrl;
    const slug =
      title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "catatan";
    a.download = `atala-${slug}-hal-${pageIndex + 1}.png`;
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function serializeNoteJson(note: Note): string {
  const payload = {
    format: "atala-lab-note",
    version: NOTE_SCHEMA_VERSION,
    note: migrateNote(note) || note,
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadNoteJson(note: Note): void {
  const json = serializeNoteJson(note);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const slug =
    note.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "catatan";
  a.download = `atala-catatan-${slug}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseImportedNoteJson(rawText: string): Note {
  if (rawText.length > 5_000_000) {
    throw new Error("File catatan terlalu besar (maksimal 5 MB).");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("Format JSON catatan tidak valid.");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Isi file catatan tidak dikenali.");
  }
  const obj = parsed as Record<string, unknown>;
  const rawNote = obj.format === "atala-lab-note" ? obj.note : obj;
  const migrated = migrateNote(rawNote);
  if (!migrated) {
    throw new Error("File ini bukan catatan Papan Guru Atala Lab yang valid.");
  }
  return {
    ...migrated,
    id: crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
  };
}

export async function importNoteFromFile(file: File): Promise<Note> {
  if (file.size > 5_000_000) {
    throw new Error("File catatan terlalu besar (maksimal 5 MB).");
  }
  const text = await file.text();
  return parseImportedNoteJson(text);
}

export function checkStorageQuotaWarning(): {
  usedBytes: number;
  nearLimit: boolean;
  percentUsed: number;
} {
  if (typeof window === "undefined") {
    return { usedBytes: 0, nearLimit: false, percentUsed: 0 };
  }
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY) || "";
    const usedBytes = raw.length * 2;
    const maxBytes = 4.5 * 1024 * 1024;
    const percentUsed = Math.min(100, Math.round((usedBytes / maxBytes) * 100));
    return {
      usedBytes,
      nearLimit: percentUsed >= 75,
      percentUsed,
    };
  } catch {
    return { usedBytes: 0, nearLimit: false, percentUsed: 0 };
  }
}
