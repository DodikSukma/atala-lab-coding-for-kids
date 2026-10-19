import type { WhiteboardAction, WhiteboardTool } from "./reducer";

export type ShortcutInput = {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  isEditingInput?: boolean;
};

const TOOL_HOTKEYS: Record<string, WhiteboardTool> = {
  v: "select",
  "1": "select",
  h: "hand",
  p: "pen",
  "2": "pen",
  m: "highlighter",
  r: "rect",
  "3": "rect",
  o: "ellipse",
  "4": "ellipse",
  l: "line",
  a: "arrow",
  "5": "arrow",
  t: "text",
  "6": "text",
  s: "sticky",
  e: "erase",
  "0": "select",
};

export function isEditableElement(target: EventTarget | null): boolean {
  if (!target || typeof target !== "object") return false;
  const el = target as HTMLElement;
  const tag = el.tagName ? el.tagName.toLowerCase() : "";
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (el.isContentEditable) return true;
  return false;
}

export function resolveWhiteboardShortcut(
  input: ShortcutInput,
): WhiteboardAction | null {
  if (input.isEditingInput) return null;
  const mod = Boolean(input.ctrlKey || input.metaKey);
  const k = input.key.toLowerCase();

  if (mod) {
    if (k === "z") {
      return input.shiftKey ? { type: "REDO" } : { type: "UNDO" };
    }
    if (k === "y") {
      return { type: "REDO" };
    }
    if (k === "c") {
      return { type: "COPY_SELECTED" };
    }
    if (k === "x") {
      return { type: "CUT_SELECTED" };
    }
    if (k === "v") {
      return { type: "PASTE_CLIPBOARD" };
    }
    if (k === "d") {
      return { type: "DUPLICATE_SELECTED" };
    }
    if (k === "a") {
      return { type: "SELECT_ALL" };
    }
    if (k === "=" || k === "+") {
      return { type: "ZOOM_BY", delta: 0.15 };
    }
    if (k === "-") {
      return { type: "ZOOM_BY", delta: -0.15 };
    }
    if (k === "0") {
      return { type: "RESET_VIEW" };
    }
    return null;
  }

  if (input.key === "Delete" || input.key === "Backspace") {
    return { type: "DELETE_SELECTED" };
  }
  if (input.key === "Escape") {
    return { type: "CLEAR_SELECTION" };
  }
  if (input.key === "+" || input.key === "=") {
    return { type: "ZOOM_BY", delta: 0.15 };
  }
  if (input.key === "-") {
    return { type: "ZOOM_BY", delta: -0.15 };
  }
  if (input.key === "0") {
    return { type: "RESET_VIEW" };
  }

  if (!input.altKey && k in TOOL_HOTKEYS) {
    return { type: "SET_TOOL", tool: TOOL_HOTKEYS[k] };
  }

  return null;
}
