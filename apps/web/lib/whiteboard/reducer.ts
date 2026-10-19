import {
  migrateNote,
  type Note,
  type NoteElement,
  type StrokeStyle,
} from "./schema";
import {
  alignElements,
  boxesIntersect,
  clampZoom,
  cloneAndOffsetElements,
  getElementBounds,
  moveElements,
  reorderElements,
  resizeElement,
  type AlignmentKind,
  type BoundingBox,
  type LayerOrderKind,
  type ResizeHandle,
} from "./transform";

export type WhiteboardTool =
  | "select"
  | "hand"
  | "pen"
  | "highlighter"
  | "erase"
  | "rect"
  | "ellipse"
  | "line"
  | "arrow"
  | "text"
  | "sticky";

export type GridMode = "dots" | "grid" | "plain";

export type StyleConfig = {
  color: string;
  fill: string;
  width: number;
  opacity: number;
  strokeStyle: StrokeStyle;
  fontSize: number;
  fontWeight: "normal" | "bold";
};

export type HistorySnapshot = {
  elements: NoteElement[];
  pageCount: number;
};

export type WhiteboardState = {
  noteId: string;
  title: string;
  tool: WhiteboardTool;
  style: StyleConfig;
  past: HistorySnapshot[];
  present: HistorySnapshot;
  future: HistorySnapshot[];
  selectedIds: string[];
  clipboard: NoteElement[];
  zoom: number;
  pan: { x: number; y: number };
  gridMode: GridMode;
  isDirty: boolean;
  lastSavedAt: string | null;
};

export const MAX_HISTORY = 50;

export const DEFAULT_STYLE: StyleConfig = {
  color: "#17213b",
  fill: "transparent",
  width: 4,
  opacity: 1,
  strokeStyle: "solid",
  fontSize: 24,
  fontWeight: "normal",
};

export function createInitialWhiteboardState(
  noteId = "default-note-id",
): WhiteboardState {
  return {
    noteId,
    title: "Catatan baru",
    tool: "pen",
    style: { ...DEFAULT_STYLE },
    past: [],
    present: { elements: [], pageCount: 1 },
    future: [],
    selectedIds: [],
    clipboard: [],
    zoom: 1,
    pan: { x: 0, y: 0 },
    gridMode: "dots",
    isDirty: false,
    lastSavedAt: null,
  };
}

export type WhiteboardAction =
  | { type: "NEW_NOTE"; id: string }
  | { type: "LOAD_NOTE"; note: Note }
  | { type: "SET_TITLE"; title: string }
  | { type: "SET_TOOL"; tool: WhiteboardTool }
  | { type: "SET_GRID_MODE"; gridMode: GridMode }
  | { type: "SET_ZOOM"; zoom: number }
  | { type: "ZOOM_BY"; delta: number }
  | { type: "RESET_VIEW" }
  | { type: "SET_PAN"; pan: { x: number; y: number } }
  | { type: "SELECT_SINGLE"; id: string | null }
  | { type: "TOGGLE_SELECT"; id: string }
  | { type: "SELECT_MARQUEE"; box: BoundingBox; append?: boolean }
  | { type: "SELECT_ALL" }
  | { type: "CLEAR_SELECTION" }
  | { type: "ADD_ELEMENT"; element: NoteElement; selectNew?: boolean }
  | { type: "UPDATE_ELEMENT"; element: NoteElement }
  | { type: "REPLACE_ELEMENTS"; elements: NoteElement[] }
  | { type: "DELETE_IDS"; ids: string[] }
  | { type: "DELETE_SELECTED" }
  | { type: "MOVE_SELECTED"; dx: number; dy: number }
  | {
      type: "RESIZE_ELEMENT";
      id: string;
      handle: ResizeHandle;
      dx: number;
      dy: number;
    }
  | { type: "DUPLICATE_SELECTED" }
  | { type: "COPY_SELECTED" }
  | { type: "CUT_SELECTED" }
  | { type: "PASTE_CLIPBOARD" }
  | { type: "ALIGN_SELECTED"; alignment: AlignmentKind }
  | { type: "REORDER_SELECTED"; order: LayerOrderKind }
  | { type: "UPDATE_STYLE"; patch: Partial<StyleConfig> }
  | { type: "ADD_PAGE" }
  | { type: "CLEAR_BOARD" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "MARK_SAVED"; savedAt: string };

function pushHistory(
  state: WhiteboardState,
  nextPresent: HistorySnapshot,
  selectedIds = state.selectedIds,
): WhiteboardState {
  return {
    ...state,
    past: [...state.past, state.present].slice(-MAX_HISTORY),
    present: nextPresent,
    future: [],
    selectedIds,
    isDirty: true,
  };
}

export function whiteboardReducer(
  state: WhiteboardState,
  action: WhiteboardAction,
): WhiteboardState {
  switch (action.type) {
    case "NEW_NOTE":
      return {
        ...createInitialWhiteboardState(action.id),
        gridMode: state.gridMode,
        style: { ...state.style },
      };

    case "LOAD_NOTE": {
      const migrated = migrateNote(action.note) || action.note;
      return {
        ...state,
        noteId: migrated.id,
        title: migrated.title,
        past: [],
        present: {
          elements: migrated.elements,
          pageCount: migrated.pageCount || 1,
        },
        future: [],
        selectedIds: [],
        isDirty: false,
        lastSavedAt: migrated.updatedAt,
      };
    }

    case "SET_TITLE":
      return {
        ...state,
        title: action.title.slice(0, 100),
        isDirty: true,
      };

    case "SET_TOOL":
      return {
        ...state,
        tool: action.tool,
      };

    case "SET_GRID_MODE":
      return {
        ...state,
        gridMode: action.gridMode,
      };

    case "SET_ZOOM":
      return {
        ...state,
        zoom: clampZoom(action.zoom),
      };

    case "ZOOM_BY":
      return {
        ...state,
        zoom: clampZoom(state.zoom + action.delta),
      };

    case "RESET_VIEW":
      return {
        ...state,
        zoom: 1,
        pan: { x: 0, y: 0 },
      };

    case "SET_PAN":
      return {
        ...state,
        pan: action.pan,
      };

    case "SELECT_SINGLE":
      return {
        ...state,
        selectedIds: action.id ? [action.id] : [],
      };

    case "TOGGLE_SELECT": {
      const exists = state.selectedIds.includes(action.id);
      return {
        ...state,
        selectedIds: exists
          ? state.selectedIds.filter((id) => id !== action.id)
          : [...state.selectedIds, action.id],
      };
    }

    case "SELECT_MARQUEE": {
      const hitIds = state.present.elements
        .filter((el) => boxesIntersect(action.box, getElementBounds(el)))
        .map((el) => el.id);
      const combined = action.append
        ? Array.from(new Set([...state.selectedIds, ...hitIds]))
        : hitIds;
      return {
        ...state,
        selectedIds: combined,
      };
    }

    case "SELECT_ALL":
      return {
        ...state,
        selectedIds: state.present.elements.map((el) => el.id),
      };

    case "CLEAR_SELECTION":
      return {
        ...state,
        selectedIds: [],
      };

    case "ADD_ELEMENT": {
      const nextElements = [
        ...state.present.elements,
        action.element,
      ].slice(-500);
      return pushHistory(
        state,
        { ...state.present, elements: nextElements },
        action.selectNew ? [action.element.id] : state.selectedIds,
      );
    }

    case "UPDATE_ELEMENT": {
      const nextElements = state.present.elements.map((el) =>
        el.id === action.element.id ? action.element : el,
      );
      return pushHistory(state, {
        ...state.present,
        elements: nextElements,
      });
    }

    case "REPLACE_ELEMENTS":
      return pushHistory(state, {
        ...state.present,
        elements: action.elements.slice(0, 500),
      });

    case "DELETE_IDS": {
      if (!action.ids.length) return state;
      const idSet = new Set(action.ids);
      const nextElements = state.present.elements.filter(
        (el) => !idSet.has(el.id),
      );
      if (nextElements.length === state.present.elements.length) return state;
      return pushHistory(
        state,
        { ...state.present, elements: nextElements },
        state.selectedIds.filter((id) => !idSet.has(id)),
      );
    }

    case "DELETE_SELECTED": {
      if (!state.selectedIds.length) return state;
      const idSet = new Set(state.selectedIds);
      const nextElements = state.present.elements.filter(
        (el) => !idSet.has(el.id),
      );
      return pushHistory(
        state,
        { ...state.present, elements: nextElements },
        [],
      );
    }

    case "MOVE_SELECTED": {
      if (!state.selectedIds.length || (action.dx === 0 && action.dy === 0))
        return state;
      const nextElements = moveElements(
        state.present.elements,
        state.selectedIds,
        action.dx,
        action.dy,
        state.present.pageCount,
      );
      return pushHistory(state, {
        ...state.present,
        elements: nextElements,
      });
    }

    case "RESIZE_ELEMENT": {
      const nextElements = state.present.elements.map((el) =>
        el.id === action.id
          ? resizeElement(el, action.handle, action.dx, action.dy)
          : el,
      );
      return pushHistory(state, {
        ...state.present,
        elements: nextElements,
      });
    }

    case "DUPLICATE_SELECTED": {
      const selected = state.present.elements.filter((el) =>
        state.selectedIds.includes(el.id),
      );
      if (!selected.length) return state;
      const clones = cloneAndOffsetElements(
        selected,
        24,
        24,
        state.present.pageCount,
      );
      return pushHistory(
        state,
        {
          ...state.present,
          elements: [...state.present.elements, ...clones].slice(0, 500),
        },
        clones.map((c) => c.id),
      );
    }

    case "COPY_SELECTED": {
      const selected = state.present.elements.filter((el) =>
        state.selectedIds.includes(el.id),
      );
      if (!selected.length) return state;
      return {
        ...state,
        clipboard: selected,
      };
    }

    case "CUT_SELECTED": {
      const selected = state.present.elements.filter((el) =>
        state.selectedIds.includes(el.id),
      );
      if (!selected.length) return state;
      const idSet = new Set(state.selectedIds);
      const nextElements = state.present.elements.filter(
        (el) => !idSet.has(el.id),
      );
      return {
        ...pushHistory(state, { ...state.present, elements: nextElements }, []),
        clipboard: selected,
      };
    }

    case "PASTE_CLIPBOARD": {
      if (!state.clipboard.length) return state;
      const clones = cloneAndOffsetElements(
        state.clipboard,
        28,
        28,
        state.present.pageCount,
      );
      return {
        ...pushHistory(
          state,
          {
            ...state.present,
            elements: [...state.present.elements, ...clones].slice(0, 500),
          },
          clones.map((c) => c.id),
        ),
        clipboard: clones,
      };
    }

    case "ALIGN_SELECTED": {
      if (state.selectedIds.length < 2) return state;
      const nextElements = alignElements(
        state.present.elements,
        state.selectedIds,
        action.alignment,
        state.present.pageCount,
      );
      return pushHistory(state, {
        ...state.present,
        elements: nextElements,
      });
    }

    case "REORDER_SELECTED": {
      if (!state.selectedIds.length) return state;
      const nextElements = reorderElements(
        state.present.elements,
        state.selectedIds,
        action.order,
      );
      return pushHistory(state, {
        ...state.present,
        elements: nextElements,
      });
    }

    case "UPDATE_STYLE": {
      const nextStyle: StyleConfig = { ...state.style, ...action.patch };
      if (!state.selectedIds.length) {
        return {
          ...state,
          style: nextStyle,
        };
      }
      const idSet = new Set(state.selectedIds);
      const nextElements = state.present.elements.map((el) => {
        if (!idSet.has(el.id)) return el;
        const updated = { ...el };
        if (action.patch.color !== undefined) updated.color = action.patch.color;
        if (action.patch.opacity !== undefined)
          updated.opacity = action.patch.opacity;
        if (action.patch.strokeStyle !== undefined)
          updated.strokeStyle = action.patch.strokeStyle;
        if (action.patch.width !== undefined && "width" in updated) {
          updated.width = action.patch.width;
        }
        if (
          action.patch.fill !== undefined &&
          (updated.type === "rect" ||
            updated.type === "ellipse" ||
            updated.type === "sticky")
        ) {
          updated.fill = action.patch.fill;
        }
        if (
          action.patch.fontSize !== undefined &&
          (updated.type === "text" || updated.type === "sticky")
        ) {
          updated.fontSize = action.patch.fontSize;
        }
        if (action.patch.fontWeight !== undefined && updated.type === "text") {
          updated.fontWeight = action.patch.fontWeight;
        }
        return updated;
      });
      return {
        ...pushHistory(state, {
          ...state.present,
          elements: nextElements,
        }),
        style: nextStyle,
      };
    }

    case "ADD_PAGE":
      return pushHistory(state, {
        ...state.present,
        pageCount: state.present.pageCount + 1,
      });

    case "CLEAR_BOARD":
      if (!state.present.elements.length) return state;
      return pushHistory(
        state,
        {
          ...state.present,
          elements: [],
        },
        [],
      );

    case "UNDO": {
      if (!state.past.length) return state;
      const previous = state.past[state.past.length - 1];
      return {
        ...state,
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
        selectedIds: [],
        isDirty: true,
      };
    }

    case "REDO": {
      if (!state.future.length) return state;
      const next = state.future[0];
      return {
        ...state,
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
        selectedIds: [],
        isDirty: true,
      };
    }

    case "MARK_SAVED":
      return {
        ...state,
        isDirty: false,
        lastSavedAt: action.savedAt,
      };

    default:
      return state;
  }
}
