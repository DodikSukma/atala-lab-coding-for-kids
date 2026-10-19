import {
  BOARD_PAGE_HEIGHT,
  BOARD_WIDTH,
  NOTE_SCHEMA_VERSION,
  arrowHead,
  isNote,
  isNoteElement,
  migrateElement,
  migrateNote,
  normalizeShape,
  type ArrowItem,
  type Ellipse,
  type HighlighterItem,
  type ImageItem,
  type LineItem,
  type Note,
  type NoteElement,
  type Point,
  type Shape,
  type StickyItem,
  type Stroke,
  type StrokeStyle,
  type TextItem,
} from "./whiteboard/schema";

export {
  BOARD_PAGE_HEIGHT,
  BOARD_WIDTH,
  NOTE_SCHEMA_VERSION,
  arrowHead,
  isNote,
  isNoteElement,
  migrateElement,
  migrateNote,
  normalizeShape,
  type ArrowItem,
  type Ellipse,
  type HighlighterItem,
  type ImageItem,
  type LineItem,
  type Note,
  type NoteElement,
  type Point,
  type Shape,
  type StickyItem,
  type Stroke,
  type StrokeStyle,
  type TextItem,
};

export const NOTES_STORAGE_KEY = "atala-lab-notes-v1";

export function readNotes(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(NOTES_STORAGE_KEY) || "[]",
    );
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => migrateNote(item))
      .filter((n): n is Note => n !== null);
  } catch {
    return [];
  }
}

export function saveNote(note: Note) {
  const migrated = migrateNote(note) || note;
  const other = readNotes().filter((n) => n.id !== migrated.id);
  localStorage.setItem(
    NOTES_STORAGE_KEY,
    JSON.stringify([migrated, ...other]),
  );
}

export function deleteNote(id: string) {
  localStorage.setItem(
    NOTES_STORAGE_KEY,
    JSON.stringify(readNotes().filter((n) => n.id !== id)),
  );
}
