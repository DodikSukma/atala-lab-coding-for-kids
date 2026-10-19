"use client";
import { useRef, useState } from "react";
import { FilePlus2 } from "lucide-react";
import {
  BOARD_PAGE_HEIGHT,
  BOARD_WIDTH,
  arrowHead,
  normalizeShape,
  type NoteElement,
  type Point,
} from "@/lib/notes";
import {
  getSelectionBounds,
  moveElements,
  resizeElement,
  screenToBoardPoint,
  smoothPoints,
  type BoundingBox,
  type ResizeHandle,
} from "@/lib/whiteboard/transform";
import { isElementVisibleOnPage } from "@/lib/whiteboard/persistence";
import type {
  GridMode,
  StyleConfig,
  WhiteboardAction,
  WhiteboardTool,
} from "@/lib/whiteboard/reducer";

export type InlineEditingState = {
  id?: string;
  targetType: "text" | "sticky";
  x: number;
  y: number;
  w?: number;
  h?: number;
  page: number;
  value: string;
  color: string;
  fill?: string;
  fontSize: number;
  fontWeight: "normal" | "bold";
};

export default function WhiteboardCanvas({
  elements,
  pageCount,
  tool,
  style,
  selectedIds,
  zoom,
  pan,
  gridMode,
  spaceHeld,
  editing,
  textareaRef,
  dispatch,
  onActivePageChange,
  onBeginEdit,
  onChangeEdit,
  onFinishEdit,
}: {
  elements: NoteElement[];
  pageCount: number;
  tool: WhiteboardTool;
  style: StyleConfig;
  selectedIds: string[];
  zoom: number;
  pan: { x: number; y: number };
  gridMode: GridMode;
  spaceHeld: boolean;
  editing: InlineEditingState | null;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  dispatch: (action: WhiteboardAction) => void;
  onActivePageChange: (page: number) => void;
  onBeginEdit: (next: InlineEditingState) => void;
  onChangeEdit: (next: InlineEditingState) => void;
  onFinishEdit: (save?: boolean) => void;
}) {
  const [draft, setDraft] = useState<NoteElement | null>(null);
  const [previewElements, setPreviewElements] = useState<NoteElement[] | null>(
    null,
  );
  const [marquee, setMarquee] = useState<{
    page: number;
    box: BoundingBox;
  } | null>(null);

  const interactionRef = useRef<
    | {
        mode: "draw";
        start: Point;
        draft: NoteElement;
      }
    | {
        mode: "move";
        start: Point;
        lastDelta: Point;
      }
    | {
        mode: "resize";
        start: Point;
        id: string;
        handle: ResizeHandle;
        initial: NoteElement;
        lastDelta: Point;
      }
    | {
        mode: "marquee";
        page: number;
        start: Point;
        append: boolean;
        box: BoundingBox;
      }
    | {
        mode: "pan";
        startClient: Point;
        initialPan: { x: number; y: number };
      }
    | null
  >(null);

  const displayedElements = previewElements || elements;

  const idAt = (target: EventTarget | null): string | null =>
    target instanceof Element
      ? target.closest("[data-note-id]")?.getAttribute("data-note-id") || null
      : null;

  const resizeHandleAt = (
    target: EventTarget | null,
  ): { id: string; handle: ResizeHandle } | null => {
    if (!(target instanceof Element)) return null;
    const node = target.closest("[data-resize-handle]");
    if (!node) return null;
    const id = node.getAttribute("data-resize-id");
    const handle = node.getAttribute("data-resize-handle") as ResizeHandle;
    if (!id || !handle) return null;
    return { id, handle };
  };

  const handlePointerDown = (
    e: React.PointerEvent<SVGSVGElement>,
    page: number,
  ) => {
    onActivePageChange(page);

    if (tool === "hand" || spaceHeld || e.button === 1) {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      interactionRef.current = {
        mode: "pan",
        startClient: { x: e.clientX, y: e.clientY },
        initialPan: { ...pan },
      };
      return;
    }

    if (e.button !== 0) return;
    onFinishEdit(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const p = screenToBoardPoint({
      clientX: e.clientX,
      clientY: e.clientY,
      svgRect: rect,
      pageIndex: page,
    });

    const handleHit = resizeHandleAt(e.target);
    if (handleHit) {
      const targetEl = elements.find((el) => el.id === handleHit.id);
      if (targetEl) {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        interactionRef.current = {
          mode: "resize",
          start: p,
          id: targetEl.id,
          handle: handleHit.handle,
          initial: targetEl,
          lastDelta: { x: 0, y: 0 },
        };
        return;
      }
    }

    const hitId = idAt(e.target);

    if (tool === "select") {
      if (hitId) {
        if (e.shiftKey) {
          dispatch({ type: "TOGGLE_SELECT", id: hitId });
        } else if (!selectedIds.includes(hitId)) {
          dispatch({ type: "SELECT_SINGLE", id: hitId });
        }
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        interactionRef.current = {
          mode: "move",
          start: p,
          lastDelta: { x: 0, y: 0 },
        };
      } else {
        if (!e.shiftKey) {
          dispatch({ type: "CLEAR_SELECTION" });
        }
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        const box = { x: p.x, y: p.y, w: 0, h: 0 };
        interactionRef.current = {
          mode: "marquee",
          page,
          start: p,
          append: e.shiftKey,
          box,
        };
        setMarquee({ page, box });
      }
      return;
    }

    if (tool === "erase") {
      if (hitId) {
        dispatch({ type: "DELETE_IDS", ids: [hitId] });
      }
      return;
    }

    if (tool === "text") {
      if (hitId) {
        const existing = elements.find((el) => el.id === hitId);
        if (existing && (existing.type === "text" || existing.type === "sticky")) {
          onBeginEdit({
            id: existing.id,
            targetType: existing.type,
            x: existing.x,
            y: existing.y,
            w: existing.w,
            h: existing.h,
            page,
            value: existing.text,
            color: existing.color,
            fill: existing.fill,
            fontSize: existing.fontSize || style.fontSize,
            fontWeight:
              existing.type === "text"
                ? existing.fontWeight || style.fontWeight
                : "normal",
          });
          return;
        }
      }
      onBeginEdit({
        targetType: "text",
        x: p.x,
        y: p.y,
        page,
        value: "",
        color: style.color,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
      });
      return;
    }

    if (tool === "sticky") {
      const stickyW = 220;
      const stickyH = 160;
      const sx = Math.max(16, Math.min(BOARD_WIDTH - stickyW - 16, p.x - stickyW / 2));
      const sy = Math.max(
        page * BOARD_PAGE_HEIGHT + 16,
        Math.min((page + 1) * BOARD_PAGE_HEIGHT - stickyH - 16, p.y - 30),
      );
      onBeginEdit({
        targetType: "sticky",
        x: sx,
        y: sy,
        w: stickyW,
        h: stickyH,
        page,
        value: "",
        color: style.color,
        fill:
          style.fill && style.fill !== "transparent" ? style.fill : "#fef08a",
        fontSize: 20,
        fontWeight: "normal",
      });
      return;
    }

    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const id = crypto.randomUUID();
    let initialDraft: NoteElement;

    if (tool === "pen") {
      initialDraft = {
        id,
        type: "stroke",
        points: [p],
        color: style.color,
        width: style.width,
        opacity: style.opacity,
        strokeStyle: style.strokeStyle,
      };
    } else if (tool === "highlighter") {
      initialDraft = {
        id,
        type: "highlighter",
        points: [p],
        color: style.color === "#17213b" ? "#facc15" : style.color,
        width: Math.max(18, style.width * 4),
        opacity: 0.38,
        strokeStyle: "solid",
      };
    } else if (tool === "line") {
      initialDraft = {
        id,
        type: "line",
        x1: p.x,
        y1: p.y,
        x2: p.x,
        y2: p.y,
        color: style.color,
        width: style.width,
        opacity: style.opacity,
        strokeStyle: style.strokeStyle,
      };
    } else if (tool === "arrow") {
      initialDraft = {
        id,
        type: "arrow",
        x1: p.x,
        y1: p.y,
        x2: p.x,
        y2: p.y,
        color: style.color,
        width: style.width,
        opacity: style.opacity,
        strokeStyle: style.strokeStyle,
      };
    } else {
      initialDraft = {
        id,
        type: tool === "ellipse" ? "ellipse" : "rect",
        x: p.x,
        y: p.y,
        w: 0,
        h: 0,
        color: style.color,
        fill: style.fill,
        width: style.width,
        opacity: style.opacity,
        strokeStyle: style.strokeStyle,
      };
    }

    interactionRef.current = {
      mode: "draw",
      start: p,
      draft: initialDraft,
    };
    setDraft(initialDraft);
  };

  const handlePointerMove = (
    e: React.PointerEvent<SVGSVGElement>,
    page: number,
  ) => {
    const active = interactionRef.current;
    if (!active) {
      if (tool === "erase" && e.buttons === 1) {
        const hitId = idAt(e.target);
        if (hitId) dispatch({ type: "DELETE_IDS", ids: [hitId] });
      }
      return;
    }

    if (active.mode === "pan") {
      const dx = e.clientX - active.startClient.x;
      const dy = e.clientY - active.startClient.y;
      dispatch({
        type: "SET_PAN",
        pan: {
          x: Math.round(active.initialPan.x + dx),
          y: Math.round(active.initialPan.y + dy),
        },
      });
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const p = screenToBoardPoint({
      clientX: e.clientX,
      clientY: e.clientY,
      svgRect: rect,
      pageIndex: page,
    });

    if (active.mode === "marquee") {
      const box = normalizeShape(active.start, p);
      active.box = box;
      setMarquee({ page: active.page, box });
      return;
    }

    if (active.mode === "move") {
      const dx = p.x - active.start.x;
      const dy = p.y - active.start.y;
      active.lastDelta = { x: dx, y: dy };
      setPreviewElements(
        moveElements(elements, selectedIds, dx, dy, pageCount),
      );
      return;
    }

    if (active.mode === "resize") {
      const dx = p.x - active.start.x;
      const dy = p.y - active.start.y;
      active.lastDelta = { x: dx, y: dy };
      const resized = resizeElement(active.initial, active.handle, dx, dy);
      setPreviewElements(
        elements.map((el) => (el.id === active.id ? resized : el)),
      );
      return;
    }

    if (active.mode === "draw") {
      const d = active.draft;
      let next: NoteElement;
      if (d.type === "stroke" || d.type === "highlighter") {
        next = { ...d, points: [...d.points, p] };
      } else if (d.type === "arrow" || d.type === "line") {
        next = { ...d, x2: p.x, y2: p.y };
      } else if (d.type === "rect" || d.type === "ellipse") {
        next = { ...d, ...normalizeShape(active.start, p) };
      } else {
        next = d;
      }
      active.draft = next;
      setDraft(next);
    }
  };

  const handlePointerUp = () => {
    const active = interactionRef.current;
    interactionRef.current = null;
    if (!active) return;

    if (active.mode === "marquee") {
      setMarquee(null);
      if (active.box.w > 4 || active.box.h > 4) {
        dispatch({
          type: "SELECT_MARQUEE",
          box: active.box,
          append: active.append,
        });
      }
      return;
    }

    if (active.mode === "move") {
      setPreviewElements(null);
      const { x: dx, y: dy } = active.lastDelta;
      if (Math.hypot(dx, dy) >= 1) {
        dispatch({ type: "MOVE_SELECTED", dx, dy });
      }
      return;
    }

    if (active.mode === "resize") {
      setPreviewElements(null);
      const { x: dx, y: dy } = active.lastDelta;
      if (Math.hypot(dx, dy) >= 1) {
        dispatch({
          type: "RESIZE_ELEMENT",
          id: active.id,
          handle: active.handle,
          dx,
          dy,
        });
      }
      return;
    }

    if (active.mode === "draw") {
      const item = active.draft;
      setDraft(null);
      if (item.type === "stroke" || item.type === "highlighter") {
        if (item.points.length < 2) return;
        const smoothed: NoteElement = {
          ...item,
          points: smoothPoints(item.points),
        };
        dispatch({ type: "ADD_ELEMENT", element: smoothed });
        return;
      }
      if (
        (item.type === "rect" || item.type === "ellipse") &&
        (item.w < 4 || item.h < 4)
      ) {
        return;
      }
      if (
        (item.type === "arrow" || item.type === "line") &&
        Math.hypot(item.x2 - item.x1, item.y2 - item.y1) < 4
      ) {
        return;
      }
      dispatch({ type: "ADD_ELEMENT", element: item, selectNew: false });
    }
  };

  const renderElement = (item: NoteElement, page: number) => {
    const isSelected = selectedIds.includes(item.id);
    const opacity = item.opacity ?? (item.type === "highlighter" ? 0.38 : 1);
    const dashArray = item.strokeStyle === "dashed" ? "10 6" : undefined;

    if (item.type === "stroke" || item.type === "highlighter") {
      return (
        <polyline
          key={item.id}
          data-note-id={item.id}
          points={item.points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={item.color}
          strokeWidth={item.width}
          strokeDasharray={dashArray}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={opacity}
          className={isSelected ? "selected-note" : ""}
        />
      );
    }

    if (item.type === "rect") {
      const fill =
        item.fill && item.fill !== "transparent" ? item.fill : "none";
      return (
        <rect
          key={item.id}
          data-note-id={item.id}
          x={item.x}
          y={item.y}
          width={item.w}
          height={item.h}
          rx={4}
          fill={fill}
          stroke={item.color}
          strokeWidth={item.width}
          strokeDasharray={dashArray}
          opacity={opacity}
          className={isSelected ? "selected-note" : ""}
        />
      );
    }

    if (item.type === "ellipse") {
      const fill =
        item.fill && item.fill !== "transparent" ? item.fill : "none";
      return (
        <ellipse
          key={item.id}
          data-note-id={item.id}
          cx={item.x + item.w / 2}
          cy={item.y + item.h / 2}
          rx={item.w / 2}
          ry={item.h / 2}
          fill={fill}
          stroke={item.color}
          strokeWidth={item.width}
          strokeDasharray={dashArray}
          opacity={opacity}
          className={isSelected ? "selected-note" : ""}
        />
      );
    }

    if (item.type === "line") {
      return (
        <line
          key={item.id}
          data-note-id={item.id}
          x1={item.x1}
          y1={item.y1}
          x2={item.x2}
          y2={item.y2}
          stroke={item.color}
          strokeWidth={item.width}
          strokeDasharray={dashArray}
          strokeLinecap="round"
          opacity={opacity}
          className={isSelected ? "selected-note" : ""}
        />
      );
    }

    if (item.type === "arrow") {
      const [tip, left, right] = arrowHead(
        { x: item.x1, y: item.y1 },
        { x: item.x2, y: item.y2 },
      );
      return (
        <g
          key={item.id}
          data-note-id={item.id}
          opacity={opacity}
          className={isSelected ? "selected-note" : ""}
        >
          <line
            x1={item.x1}
            y1={item.y1}
            x2={item.x2}
            y2={item.y2}
            stroke={item.color}
            strokeWidth={item.width}
            strokeDasharray={dashArray}
            strokeLinecap="round"
          />
          <polygon
            points={`${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`}
            fill={item.color}
          />
        </g>
      );
    }

    if (item.type === "sticky") {
      const lines = item.text.split("\n");
      const fontSize = item.fontSize || 20;
      return (
        <g
          key={item.id}
          data-note-id={item.id}
          opacity={opacity}
          className={`wb-sticky-node ${isSelected ? "selected-note" : ""}`}
          onDoubleClick={(e) => {
            e.stopPropagation();
            onBeginEdit({
              id: item.id,
              targetType: "sticky",
              x: item.x,
              y: item.y,
              w: item.w,
              h: item.h,
              page,
              value: item.text,
              color: item.color,
              fill: item.fill || "#fef08a",
              fontSize,
              fontWeight: "normal",
            });
          }}
        >
          <rect
            x={item.x}
            y={item.y}
            width={item.w}
            height={item.h}
            rx={10}
            fill={item.fill || "#fef08a"}
            stroke="#eab308"
            strokeWidth={2}
          />
          {lines.map((line, idx) => (
            <text
              key={idx}
              x={item.x + 16}
              y={item.y + 34 + idx * fontSize * 1.3}
              fill={item.color}
              fontSize={fontSize}
              fontFamily="Arial, sans-serif"
            >
              {line}
            </text>
          ))}
        </g>
      );
    }

    if (item.type === "image") {
      return (
        <g
          key={item.id}
          data-note-id={item.id}
          opacity={opacity}
          className={isSelected ? "selected-note" : ""}
        >
          <image
            href={item.dataUrl}
            x={item.x}
            y={item.y}
            width={item.w}
            height={item.h}
            preserveAspectRatio="none"
          />
        </g>
      );
    }

    const fontSize = item.fontSize || 24;
    const lines = item.text.split("\n");
    return (
      <text
        key={item.id}
        data-note-id={item.id}
        x={item.x}
        y={item.y}
        fill={item.color}
        fontSize={fontSize}
        fontWeight={item.fontWeight || "normal"}
        fontFamily="Arial, sans-serif"
        opacity={opacity}
        className={isSelected ? "selected-note" : ""}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onBeginEdit({
            id: item.id,
            targetType: "text",
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
            page,
            value: item.text,
            color: item.color,
            fontSize,
            fontWeight: item.fontWeight || "normal",
          });
        }}
      >
        {lines.map((line, idx) => (
          <tspan
            key={idx}
            x={item.x}
            dy={idx === 0 ? 0 : fontSize * 1.3}
          >
            {line}
          </tspan>
        ))}
      </text>
    );
  };

  const renderSelectionOverlay = (page: number) => {
    if (!selectedIds.length) return null;
    const low = page * BOARD_PAGE_HEIGHT;
    const high = low + BOARD_PAGE_HEIGHT;
    const bounds = getSelectionBounds(displayedElements, selectedIds);
    if (!bounds) return null;
    if (bounds.y + bounds.h < low || bounds.y > high) return null;

    const singleSelected =
      selectedIds.length === 1
        ? displayedElements.find((el) => el.id === selectedIds[0])
        : null;

    const handles: Array<{ h: ResizeHandle; cx: number; cy: number }> = [
      { h: "nw", cx: bounds.x, cy: bounds.y },
      { h: "ne", cx: bounds.x + bounds.w, cy: bounds.y },
      { h: "sw", cx: bounds.x, cy: bounds.y + bounds.h },
      { h: "se", cx: bounds.x + bounds.w, cy: bounds.y + bounds.h },
    ];

    return (
      <g className="wb-selection-overlay">
        <rect
          x={bounds.x - 4}
          y={bounds.y - 4}
          width={bounds.w + 8}
          height={bounds.h + 8}
          fill="none"
          stroke="#2563eb"
          strokeWidth={2.5}
          strokeDasharray="8 5"
          pointerEvents="none"
        />
        {singleSelected &&
          handles.map(({ h, cx, cy }) => (
            <rect
              key={h}
              data-resize-id={singleSelected.id}
              data-resize-handle={h}
              x={cx - 12}
              y={cy - 12}
              width={24}
              height={24}
              rx={5}
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth={2.5}
              className={`image-resize-handle handle-${h}`}
            />
          ))}
      </g>
    );
  };

  return (
    <div className="board-paper-wrap">
      <div
        className="board-pages"
        style={{
          width: `min(100%, ${Math.round(BOARD_WIDTH * zoom)}px)`,
          transform:
            pan.x !== 0 || pan.y !== 0
              ? `translate(${pan.x}px, ${pan.y}px)`
              : undefined,
        }}
      >
        {Array.from({ length: pageCount }, (_, page) => (
          <div className="board-page-unit" key={page}>
            <div className="board-page-caption">
              <span>LEMBAR A4 · HALAMAN {page + 1}</span>
              <span>
                960 × 1358 px · {page + 1}/{pageCount}
              </span>
            </div>
            <div className="board-paper-box">
              <svg
                viewBox={`0 ${page * BOARD_PAGE_HEIGHT} ${BOARD_WIDTH} ${BOARD_PAGE_HEIGHT}`}
                className={`board-paper tool-${spaceHeld ? "hand" : tool} grid-${gridMode}`}
                role="img"
                aria-label={`Papan gambar A4 halaman ${page + 1}`}
                onPointerEnter={() => onActivePageChange(page)}
                onPointerDown={(e) => handlePointerDown(e, page)}
                onPointerMove={(e) => handlePointerMove(e, page)}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {displayedElements
                  .filter(
                    (item) =>
                      item.id !== draft?.id &&
                      isElementVisibleOnPage(item, page),
                  )
                  .map((item) => renderElement(item, page))}

                {draft &&
                  isElementVisibleOnPage(draft, page) &&
                  renderElement(draft, page)}

                {renderSelectionOverlay(page)}

                {marquee && marquee.page === page && (
                  <rect
                    x={marquee.box.x}
                    y={marquee.box.y}
                    width={marquee.box.w}
                    height={marquee.box.h}
                    fill="rgba(37, 99, 235, 0.1)"
                    stroke="#2563eb"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    pointerEvents="none"
                  />
                )}
              </svg>

              {editing?.page === page && (
                <textarea
                  ref={textareaRef}
                  aria-label="Editor teks di papan"
                  className={`board-inline-text ${editing.targetType === "sticky" ? "is-sticky-editor" : ""}`}
                  maxLength={800}
                  style={{
                    left: `${(editing.x / BOARD_WIDTH) * 100}%`,
                    top: `${((editing.y - page * BOARD_PAGE_HEIGHT) / BOARD_PAGE_HEIGHT) * 100}%`,
                    color: editing.color,
                    backgroundColor:
                      editing.targetType === "sticky"
                        ? editing.fill || "#fef08a"
                        : "#ffffff",
                    fontSize: `${Math.max(14, Math.round(editing.fontSize * 0.78))}px`,
                    fontWeight: editing.fontWeight,
                  }}
                  value={editing.value}
                  onChange={(e) =>
                    onChangeEdit({ ...editing, value: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      onFinishEdit(true);
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      onFinishEdit(false);
                    }
                  }}
                  onBlur={() => onFinishEdit(true)}
                  placeholder="Ketik teks (Enter untuk baris baru, Ctrl+Enter atau klik luar untuk selesai)..."
                />
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          className="board-add-page"
          onClick={() => {
            onFinishEdit(true);
            dispatch({ type: "ADD_PAGE" });
          }}
        >
          <FilePlus2 size={18} aria-hidden="true" /> Tambah halaman A4 ke bawah
        </button>
      </div>
    </div>
  );
}
