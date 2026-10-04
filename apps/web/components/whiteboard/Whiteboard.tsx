"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Circle,
  ClipboardPaste,
  Download,
  Eraser,
  FilePlus2,
  MousePointer2,
  PenLine,
  Redo2,
  RectangleHorizontal,
  Save,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";
import { buildNotePdf } from "@/lib/notePdf";
import {
  BOARD_PAGE_HEIGHT,
  BOARD_WIDTH,
  arrowHead,
  deleteNote,
  normalizeShape,
  readNotes,
  saveNote,
  type ImageItem,
  type Note,
  type NoteElement,
  type Point,
} from "@/lib/notes";

type Tool = "select" | "pen" | "rect" | "ellipse" | "arrow" | "text" | "erase";
type History = {
  past: NoteElement[][];
  present: NoteElement[];
  future: NoteElement[][];
};
type Editing = {
  id?: string;
  x: number;
  y: number;
  page: number;
  value: string;
  color: string;
};
const empty = (): History => ({ past: [], present: [], future: [] });
const tools: { id: Tool; label: string; Icon: typeof PenLine }[] = [
  { id: "select", label: "Pilih", Icon: MousePointer2 },
  { id: "pen", label: "Pena", Icon: PenLine },
  { id: "rect", label: "Kotak", Icon: RectangleHorizontal },
  { id: "ellipse", label: "Lingkaran", Icon: Circle },
  { id: "arrow", label: "Panah", Icon: ArrowUpRight },
  { id: "text", label: "Teks", Icon: Type },
  { id: "erase", label: "Hapus objek", Icon: Eraser },
];
const colors = [
  "#17213b",
  "#2563eb",
  "#6541b5",
  "#d65351",
  "#16834b",
  "#e3a02b",
];

export default function Whiteboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteId, setNoteId] = useState(() => crypto.randomUUID());
  const [title, setTitle] = useState("Catatan baru");
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(colors[0]);
  const [lineWidth, setLineWidth] = useState(4);
  const [pageCount, setPageCount] = useState(1);
  const [history, setHistory] = useState<History>(empty);
  const [draft, setDraft] = useState<NoteElement | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [status, setStatus] = useState("Pilih alat lalu gambar di papan.");
  const origin = useRef<Point | null>(null);
  const drawing = useRef<NoteElement | null>(null);
  const transform = useRef<{
    mode: "move" | "resize";
    start: Point;
    initial: ImageItem;
  } | null>(null);
  const transformDraft = useRef<ImageItem | null>(null);
  const activePage = useRef(0);
  const presentRef = useRef<NoteElement[]>([]);
  const editingRef = useRef<Editing | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  useEffect(() => setNotes(readNotes()), []);
  useEffect(() => {
    if (editing) textarea.current?.focus();
  }, [editing?.id, editing?.x, editing?.y]);

  const commit = (next: NoteElement[]) => {
    presentRef.current = next;
    setHistory((h) => ({
      past: [...h.past, h.present].slice(-40),
      present: next,
      future: [],
    }));
    setStatus("Ada perubahan yang belum disimpan.");
  };
  const beginEdit = (next: Editing) => {
    editingRef.current = next;
    setEditing(next);
  };
  const finishEdit = (save = true): NoteElement[] => {
    const current = editingRef.current;
    if (!current) return presentRef.current;
    editingRef.current = null;
    setEditing(null);
    const value = current.value.trim();
    if (!save || !value) return presentRef.current;
    const next: NoteElement[] = current.id
      ? presentRef.current.map((item) =>
          item.id === current.id && item.type === "text"
            ? { ...item, text: value }
            : item,
        )
      : [
          ...presentRef.current,
          {
            id: crypto.randomUUID(),
            type: "text",
            x: current.x,
            y: current.y,
            text: value,
            color: current.color,
          },
        ];
    commit(next);
    return next;
  };
  const fresh = () => {
    finishEdit(false);
    presentRef.current = [];
    setNoteId(crypto.randomUUID());
    setTitle("Catatan baru");
    setHistory(empty());
    setPageCount(1);
    setDraft(null);
    setSelected(null);
    setStatus("Papan baru siap digunakan.");
  };
  const open = (note: Note) => {
    finishEdit(false);
    presentRef.current = note.elements;
    setNoteId(note.id);
    setTitle(note.title);
    setHistory({ ...empty(), present: note.elements });
    setPageCount(note.pageCount || 1);
    setDraft(null);
    setSelected(null);
    setStatus("Catatan dibuka. Kamu bisa melanjutkan menggambar.");
  };
  const save = () => {
    const elements = finishEdit();
    const note: Note = {
      id: noteId,
      title: (title.trim() || "Catatan baru").slice(0, 100),
      elements,
      pageCount,
      updatedAt: new Date().toISOString(),
    };
    try {
      saveNote(note);
      setNotes(readNotes());
      setStatus("Semua halaman tersimpan di browser ini.");
    } catch {
      setStatus("Penyimpanan penuh. Unduh PDF dan coba lagi.");
    }
  };
  const remove = () => {
    if (!confirm("Hapus catatan ini dari browser?")) return;
    deleteNote(noteId);
    setNotes(readNotes());
    fresh();
  };
  const undo = () => {
    setHistory((h) => {
      const next = h.past.length
        ? {
            past: h.past.slice(0, -1),
            present: h.past.at(-1)!,
            future: [h.present, ...h.future],
          }
        : h;
      presentRef.current = next.present;
      return next;
    });
    setStatus("Ada perubahan yang belum disimpan.");
  };
  const redo = () => {
    setHistory((h) => {
      const next = h.future.length
        ? {
            past: [...h.past, h.present],
            present: h.future[0],
            future: h.future.slice(1),
          }
        : h;
      presentRef.current = next.present;
      return next;
    });
    setStatus("Ada perubahan yang belum disimpan.");
  };
  const point = (e: React.MouseEvent<SVGSVGElement>, page: number): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(
        0,
        Math.min(
          BOARD_WIDTH,
          ((e.clientX - rect.left) * BOARD_WIDTH) / rect.width,
        ),
      ),
      y:
        page * BOARD_PAGE_HEIGHT +
        Math.max(
          0,
          Math.min(
            BOARD_PAGE_HEIGHT,
            ((e.clientY - rect.top) * BOARD_PAGE_HEIGHT) / rect.height,
          ),
        ),
    };
  };
  const pasteImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setStatus("Clipboard tidak berisi gambar.");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    try {
      const source = new Image();
      await new Promise<void>((resolve, reject) => {
        source.onload = () => resolve();
        source.onerror = () => reject(new Error("Gambar tidak dapat dibaca."));
        source.src = objectUrl;
      });
      const scale = Math.min(
        1,
        720 / source.naturalWidth,
        850 / source.naturalHeight,
      );
      const w = Math.max(1, Math.round(source.naturalWidth * scale));
      const h = Math.max(1, Math.round(source.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Gambar tidak dapat diproses.");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, w, h);
      context.drawImage(source, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.84);
      if (dataUrl.length >= 4_000_000)
        throw new Error(
          "Gambar terlalu besar. Potong screenshot lalu coba lagi.",
        );
      const page = Math.min(activePage.current, pageCount - 1);
      const item: ImageItem = {
        id: crypto.randomUUID(),
        type: "image",
        x: (BOARD_WIDTH - w) / 2,
        y: page * BOARD_PAGE_HEIGHT + 130,
        w,
        h,
        dataUrl,
        color: "#17213b",
      };
      commit([...presentRef.current, item]);
      setSelected(item.id);
      setStatus(
        `Gambar ditempel di halaman ${page + 1}. Pilih untuk memindah atau ubah ukuran.`,
      );
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Gambar gagal ditempel.",
      );
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      )
        return;
      const file = Array.from(event.clipboardData?.items || [])
        .find((item) => item.type.startsWith("image/"))
        ?.getAsFile();
      if (file) {
        event.preventDefault();
        void pasteImage(file);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  });
  const pasteFromButton = async () => {
    try {
      if (!navigator.clipboard?.read)
        throw new Error("Gunakan Cmd/Ctrl+V untuk menempel gambar.");
      const entries = await navigator.clipboard.read();
      const entry = entries.find((item) =>
        item.types.some((type) => type.startsWith("image/")),
      );
      const type = entry?.types.find((type) => type.startsWith("image/"));
      if (!entry || !type) throw new Error("Clipboard tidak berisi gambar.");
      const blob = await entry.getType(type);
      await pasteImage(new File([blob], "gambar-clipboard", { type }));
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Gunakan Cmd/Ctrl+V untuk menempel gambar.",
      );
    }
  };
  const idAt = (target: EventTarget | null) =>
    target instanceof Element
      ? target.closest("[data-note-id]")?.getAttribute("data-note-id")
      : null;
  const down = (e: React.PointerEvent<SVGSVGElement>, page: number) => {
    if (e.button !== 0) return;
    activePage.current = page;
    finishEdit();
    const p = point(e, page);
    const hit = idAt(e.target);
    if (tool === "select") {
      setSelected(hit || null);
      const item = presentRef.current.find((element) => element.id === hit);
      if (item?.type === "image") {
        const resize =
          e.target instanceof Element && !!e.target.closest("[data-resize-id]");
        transform.current = {
          mode: resize ? "resize" : "move",
          start: p,
          initial: item,
        };
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
      }
      return;
    }
    if (tool === "erase") {
      if (hit) commit(history.present.filter((item) => item.id !== hit));
      setSelected(null);
      return;
    }
    if (
      hit &&
      history.present.some((item) => item.id === hit && item.type === "text")
    )
      return;
    if (tool === "text") return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    origin.current = p;
    const id = crypto.randomUUID();
    const item: NoteElement =
      tool === "pen"
        ? { id, type: "stroke", points: [p], color, width: lineWidth }
        : tool === "arrow"
          ? {
              id,
              type: "arrow",
              x1: p.x,
              y1: p.y,
              x2: p.x,
              y2: p.y,
              color,
              width: lineWidth,
            }
          : {
              id,
              type: tool,
              x: p.x,
              y: p.y,
              w: 0,
              h: 0,
              color,
              width: lineWidth,
            };
    drawing.current = item;
    setDraft(item);
  };
  const move = (e: React.PointerEvent<SVGSVGElement>, page: number) => {
    if (transform.current) {
      const p = point(e, page);
      const { mode, start, initial } = transform.current;
      const dx = p.x - start.x,
        dy = p.y - start.y;
      const low = page * BOARD_PAGE_HEIGHT;
      const next: ImageItem =
        mode === "move"
          ? {
              ...initial,
              x: Math.max(0, Math.min(BOARD_WIDTH - initial.w, initial.x + dx)),
              y: Math.max(
                low,
                Math.min(low + BOARD_PAGE_HEIGHT - initial.h, initial.y + dy),
              ),
            }
          : {
              ...initial,
              w: Math.max(
                40,
                Math.min(BOARD_WIDTH - initial.x, initial.w + dx),
              ),
              h: Math.max(
                40,
                Math.min(low + BOARD_PAGE_HEIGHT - initial.y, initial.h + dy),
              ),
            };
      transformDraft.current = next;
      setDraft(next);
      return;
    }
    if (!drawing.current || !origin.current) return;
    const p = point(e, page);
    const d = drawing.current;
    const next: NoteElement =
      d.type === "stroke"
        ? { ...d, points: [...d.points, p] }
        : d.type === "arrow"
          ? { ...d, x2: p.x, y2: p.y }
          : { ...d, ...normalizeShape(origin.current, p) };
    drawing.current = next;
    setDraft(next);
  };
  const up = () => {
    if (transform.current) {
      const previous = transform.current.initial;
      transform.current = null;
      const next = transformDraft.current;
      transformDraft.current = null;
      const changed =
        next &&
        (next.x !== previous.x ||
          next.y !== previous.y ||
          next.w !== previous.w ||
          next.h !== previous.h);
      if (changed && next)
        commit(
          presentRef.current.map((item) =>
            item.id === previous.id ? next : item,
          ),
        );
      setDraft(null);
      return;
    }
    const item = drawing.current;
    drawing.current = null;
    origin.current = null;
    setDraft(null);
    if (
      !item ||
      (item.type === "stroke" && item.points.length < 2) ||
      ((item.type === "rect" || item.type === "ellipse") &&
        (item.w < 3 || item.h < 3)) ||
      (item.type === "arrow" &&
        Math.hypot(item.x2 - item.x1, item.y2 - item.y1) < 3)
    )
      return;
    commit([...presentRef.current, item]);
  };
  const exportPdf = () => {
    const elements = finishEdit();
    try {
      buildNotePdf(title, elements, pageCount).save(
        `atala-catatan-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "kelas"}.pdf`,
      );
      setStatus(`PDF A4 ${pageCount} halaman berhasil diunduh.`);
    } catch {
      setStatus("PDF gagal dibuat. Coba ulangi.");
    }
  };
  const render = (item: NoteElement) => {
    const common = {
      "data-note-id": item.id,
      stroke: item.color,
      strokeWidth:
        item.type === "text" || item.type === "image" ? 0 : item.width,
      fill: "none",
      className: selected === item.id ? "selected-note" : "",
    };
    if (item.type === "stroke")
      return (
        <polyline
          key={item.id}
          {...common}
          points={item.points.map((p) => `${p.x},${p.y}`).join(" ")}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    if (item.type === "rect")
      return (
        <rect
          key={item.id}
          {...common}
          x={item.x}
          y={item.y}
          width={item.w}
          height={item.h}
        />
      );
    if (item.type === "ellipse")
      return (
        <ellipse
          key={item.id}
          {...common}
          cx={item.x + item.w / 2}
          cy={item.y + item.h / 2}
          rx={item.w / 2}
          ry={item.h / 2}
        />
      );
    if (item.type === "arrow") {
      const [tip, left, right] = arrowHead(
        { x: item.x1, y: item.y1 },
        { x: item.x2, y: item.y2 },
      );
      return (
        <g
          key={item.id}
          data-note-id={item.id}
          className={selected === item.id ? "selected-note" : ""}
        >
          <line
            x1={item.x1}
            y1={item.y1}
            x2={item.x2}
            y2={item.y2}
            stroke={item.color}
            strokeWidth={item.width}
            strokeLinecap="round"
          />
          <polygon
            points={`${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`}
            fill={item.color}
          />
        </g>
      );
    }
    if (item.type === "image")
      return (
        <g
          key={item.id}
          data-note-id={item.id}
          className={selected === item.id ? "selected-note" : ""}
        >
          <image
            href={item.dataUrl}
            x={item.x}
            y={item.y}
            width={item.w}
            height={item.h}
            preserveAspectRatio="none"
          />
          {selected === item.id && (
            <>
              <rect
                x={item.x}
                y={item.y}
                width={item.w}
                height={item.h}
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeDasharray="10 6"
                pointerEvents="none"
              />
              <rect
                data-resize-id={item.id}
                x={item.x + item.w - 17}
                y={item.y + item.h - 17}
                width="34"
                height="34"
                rx="5"
                fill="#2563eb"
                stroke="#fff"
                strokeWidth="3"
                className="image-resize-handle"
              />
            </>
          )}
        </g>
      );
    return (
      <text
        key={item.id}
        {...common}
        x={item.x}
        y={item.y}
        fill={item.color}
        fontSize="24"
        fontFamily="Arial, sans-serif"
        onDoubleClick={(e) => {
          e.stopPropagation();
          setTool("text");
          beginEdit({
            id: item.id,
            x: item.x,
            y: item.y,
            page: Math.floor(item.y / BOARD_PAGE_HEIGHT),
            value: item.text,
            color: item.color,
          });
        }}
      >
        {item.text}
      </text>
    );
  };
  const visibleOnPage = (item: NoteElement, page: number) => {
    const low = page * BOARD_PAGE_HEIGHT;
    const high = low + BOARD_PAGE_HEIGHT;
    if (item.type === "stroke")
      return item.points.some((p) => p.y >= low && p.y <= high);
    if (item.type === "arrow") return item.y1 >= low && item.y1 < high;
    return item.y >= low && item.y < high;
  };
  return (
    <div className="board-shell">
      <aside className="board-library">
        <div className="board-library-head">
          <span>PERPUSTAKAAN</span>
          <h2>Catatan saya</h2>
          <button className="button outline" onClick={fresh}>
            <FilePlus2 size={16} /> Baru
          </button>
        </div>
        <div className="note-list">
          {notes.length ? (
            notes.map((note) => (
              <button
                key={note.id}
                className={`note-list-item ${note.id === noteId ? "active" : ""}`}
                onClick={() => open(note)}
              >
                <span className="note-list-mark" />
                <strong>{note.title}</strong>
                <small>
                  {note.pageCount || 1} halaman ·{" "}
                  {new Date(note.updatedAt).toLocaleDateString("id-ID")}
                </small>
              </button>
            ))
          ) : (
            <p>Belum ada catatan. Gambar lalu tekan Simpan.</p>
          )}
        </div>
        <div className="library-tip">
          <b>Untuk guru</b>
          <p>
            Gulir ke bawah dan tambah halaman sesuka hati. Semua halaman ikut
            saat mengunduh PDF.
          </p>
        </div>
      </aside>
      <section className="board-main">
        <div className="board-topbar">
          <div>
            <label htmlFor="note-title">JUDUL CATATAN</label>
            <input
              id="note-title"
              value={title}
              maxLength={100}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="board-top-actions">
            <button className="button outline" onClick={save}>
              <Save size={16} /> Simpan
            </button>
            <button className="button primary" onClick={exportPdf}>
              <Download size={16} /> Unduh PDF
            </button>
          </div>
        </div>
        <div className="board-tool-row">
          <div
            className="board-tools"
            role="group"
            aria-label="Alat menggambar"
          >
            {tools.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={tool === id ? "active" : ""}
                aria-pressed={tool === id}
                title={label}
                onClick={() => {
                  finishEdit();
                  setTool(id);
                }}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <div className="board-history">
            <button
              aria-label="Urungkan"
              title="Urungkan"
              onClick={undo}
              disabled={!history.past.length}
            >
              <Undo2 size={17} />
            </button>
            <button
              aria-label="Ulangi"
              title="Ulangi"
              onClick={redo}
              disabled={!history.future.length}
            >
              <Redo2 size={17} />
            </button>
          </div>
        </div>
        <div className="board-options">
          <div className="board-colors" role="group" aria-label="Warna pena">
            {colors.map((c) => (
              <button
                key={c}
                title={`Warna ${c}`}
                aria-label={`Pilih warna ${c}`}
                aria-pressed={color === c}
                onClick={() => setColor(c)}
                style={{ background: c }}
              />
            ))}
          </div>
          <label>
            Ukuran{" "}
            <input
              aria-label="Ukuran pena"
              type="range"
              min="2"
              max="12"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
            />
          </label>
          {tool === "text" && (
            <span className="board-text-help">
              Klik papan untuk mengetik. Klik dua kali teks untuk mengubahnya.
            </span>
          )}
          <button
            className="board-paste"
            onClick={pasteFromButton}
            title="Tempel screenshot dari clipboard"
          >
            <ClipboardPaste size={15} /> Tempel gambar
          </button>
          {selected && (
            <button
              className="board-delete-selection"
              onClick={() => {
                commit(history.present.filter((i) => i.id !== selected));
                setSelected(null);
              }}
            >
              <Trash2 size={15} /> Hapus pilihan
            </button>
          )}
          <button
            className="board-clear"
            onClick={() => {
              if (
                history.present.length &&
                confirm("Kosongkan semua isi papan?")
              )
                commit([]);
            }}
            disabled={!history.present.length}
          >
            Kosongkan papan
          </button>
        </div>
        <div className="board-paper-wrap">
          <div className="board-pages">
            {Array.from({ length: pageCount }, (_, page) => (
              <div className="board-page-unit" key={page}>
                <div className="board-page-caption">
                  <span>HALAMAN {page + 1}</span>
                  <span>
                    A4 · {page + 1}/{pageCount}
                  </span>
                </div>
                <div className="board-paper-box">
                  <svg
                    viewBox={`0 ${page * BOARD_PAGE_HEIGHT} ${BOARD_WIDTH} ${BOARD_PAGE_HEIGHT}`}
                    className={`board-paper tool-${tool}`}
                    role="img"
                    aria-label={`Papan gambar halaman ${page + 1}`}
                    onPointerEnter={() => {
                      activePage.current = page;
                    }}
                    onPointerDown={(e) => down(e, page)}
                    onPointerMove={(e) => move(e, page)}
                    onPointerUp={up}
                    onPointerCancel={up}
                    onClick={(e) => {
                      if (tool === "text" && !idAt(e.target)) {
                        const p = point(e, page);
                        beginEdit({ x: p.x, y: p.y, page, value: "", color });
                      }
                    }}
                  >
                    {history.present
                      .filter(
                        (item) =>
                          item.id !== draft?.id && visibleOnPage(item, page),
                      )
                      .map(render)}
                    {draft && visibleOnPage(draft, page) && render(draft)}
                  </svg>
                  {editing?.page === page && (
                    <textarea
                      ref={textarea}
                      aria-label="Teks di papan"
                      className="board-inline-text"
                      maxLength={200}
                      style={{
                        left: `${(editing.x / BOARD_WIDTH) * 100}%`,
                        top: `${((editing.y - page * BOARD_PAGE_HEIGHT) / BOARD_PAGE_HEIGHT) * 100}%`,
                        color: editing.color,
                      }}
                      value={editing.value}
                      onChange={(e) => {
                        const next = { ...editing, value: e.target.value };
                        editingRef.current = next;
                        setEditing(next);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          finishEdit();
                        }
                        if (e.key === "Escape") finishEdit(false);
                      }}
                      onBlur={() => finishEdit()}
                      placeholder="Ketik di sini..."
                    />
                  )}
                </div>
              </div>
            ))}
            <button
              className="board-add-page"
              onClick={() => {
                finishEdit();
                setPageCount((n) => n + 1);
                setStatus("Halaman baru ditambahkan. Jangan lupa simpan.");
              }}
            >
              <FilePlus2 size={18} /> Tambah halaman A4
            </button>
          </div>
        </div>
        <div className="board-footer">
          <p role="status">{status}</p>
          <button
            className="board-delete-note"
            onClick={remove}
            disabled={!notes.some((n) => n.id === noteId)}
          >
            <Trash2 size={15} /> Hapus catatan
          </button>
        </div>
      </section>
    </div>
  );
}
