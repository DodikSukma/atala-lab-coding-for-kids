"use client";
import { useEffect } from "react";
import type { WhiteboardAction } from "@/lib/whiteboard/reducer";
import {
  isEditableElement,
  resolveWhiteboardShortcut,
  type ShortcutInput,
} from "@/lib/whiteboard/shortcuts";

export { isEditableElement, resolveWhiteboardShortcut, type ShortcutInput };

export function useWhiteboardShortcuts({
  dispatch,
  isInlineEditing,
  onSpaceHoldChange,
}: {
  dispatch: (action: WhiteboardAction) => void;
  isInlineEditing: boolean;
  onSpaceHoldChange?: (holding: boolean) => void;
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const editingDom = isInlineEditing || isEditableElement(e.target);
      if (editingDom) return;

      if (e.code === "Space" && !e.repeat) {
        onSpaceHoldChange?.(true);
      }

      const action = resolveWhiteboardShortcut({
        key: e.key,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        isEditingInput: editingDom,
      });

      if (action) {
        if (action.type === "PASTE_CLIPBOARD") {
          dispatch(action);
          return;
        }
        e.preventDefault();
        dispatch(action);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        onSpaceHoldChange?.(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [dispatch, isInlineEditing, onSpaceHoldChange]);
}
