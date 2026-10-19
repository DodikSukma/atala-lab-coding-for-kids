"use client";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { CheckCircle2, Clock, Download, Save, Trash2 } from "lucide-react";
import { buildNotePdf } from "@/lib/notePdf";
import {
  BOARD_PAGE_HEIGHT,
  BOARD_WIDTH,
  NOTE_SCHEMA_VERSION,
  deleteNote,
  readNotes,
  saveNote,
  type ImageItem,
  type Note,
  type NoteElement,
} from "@/lib/notes";
import {
  createInitialWhiteboardState,
  whiteboardReducer,
} from "@/lib/whiteboard/reducer";
import { fitToPageZoom } from "@/lib/whiteboard/transform";
import {
  checkStorageQuotaWarning,
  downloadNoteJson,
  exportPageAsPng,
  importNoteFromFile,
} from "@/lib/whiteboard/persistence";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import WhiteboardSidebar from "./WhiteboardSidebar";
import WhiteboardToolbar from "./WhiteboardToolbar";
import WhiteboardInspector from "./WhiteboardInspector";
import WhiteboardCanvas, {
  type InlineEditingState,
} from "./WhiteboardCanvas";
import { useWhiteboardShortcuts } from "./useWhiteboardShortcuts";

export default function Whiteboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [state, dispatch] = useReducer(
    whiteboardReducer,
    undefined,
    () => createInitialWhiteboardState(crypto.randomUUID()),
  );
  const [editing, setEditing] = useState<InlineEditingState | null>(null);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [status, setStatus] = useState(
    "Pilih alat gambar, gunakan pintasan keyboard, atau seret untuk memilih beberapa objek.",
  );
  const [quotaInfo, setQuotaInfo] = useState({
    usedBytes: 0,
    nearLimit: false,
    percentUsed: 0,
  });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const activePageRef = useRef(0);
  const editingRef = useRef<InlineEditingState | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const jsonInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setNotes(readNotes());
    setQuotaInfo(checkStorageQuotaWarning());
  }, []);

  useEffect(() => {
    if (editing) textareaRef.current?.focus();
  }, [editing?.id, editing?.x, editing?.y]);

  const beginEdit = useCallback((next: InlineEditingState) => {
    editingRef.current = next;
    setEditing(next);
  }, []);

  const changeEdit = useCallback((next: InlineEditingState) => {
    editingRef.current = next;
    setEditing(next);
  }, []);

  const finishEdit = useCallback(
    (save = true): NoteElement[] => {
      const current = editingRef.current;
      if (!current) return state.present.elements;
      editingRef.current = null;
      setEditing(null);
      const value = current.value.trim();
      if (!save || !value) return state.present.elements;

      if (current.id) {
        const updated = state.present.elements.map((item) =>
          item.id === current.id &&
          (item.type === "text" || item.type === "sticky")
            ? {
                ...item,
                text: value,
                color: current.color,
                fontSize: current.fontSize,
                ...(item.type === "text"
                  ? { fontWeight: current.fontWeight }
                  : { fill: current.fill }),
              }
            : item,
        );
        dispatch({ type: "REPLACE_ELEMENTS", elements: updated });
        return updated;
      }

      const newElement: NoteElement =
        current.targetType === "sticky"
          ? {
              id: crypto.randomUUID(),
              type: "sticky",
              x: current.x,
              y: current.y,
              w: current.w || 220,
              h: current.h || 160,
              text: value,
              color: current.color,
              fill: current.fill || "#fef08a",
              fontSize: current.fontSize || 20,
            }
          : {
              id: crypto.randomUUID(),
              type: "text",
              x: current.x,
              y: current.y,
              text: value,
              color: current.color,
              fontSize: current.fontSize || 24,
              fontWeight: current.fontWeight || "normal",
            };
      dispatch({ type: "ADD_ELEMENT", element: newElement });
      return [...state.present.elements, newElement];
    },
    [state.present.elements],
  );

  // Debounced local autosave whenever changes are made
  useEffect(() => {
    if (!state.isDirty) return;
    if (!state.present.elements.length && !notes.some((n) => n.id === state.noteId)) {
      return;
    }
    const timer = setTimeout(() => {
      const note: Note = {
        id: state.noteId,
        title: (state.title.trim() || "Catatan baru").slice(0, 100),
        elements: state.present.elements,
        pageCount: state.present.pageCount,
        schemaVersion: NOTE_SCHEMA_VERSION,
        updatedAt: new Date().toISOString(),
      };
      try {
        saveNote(note);
        setNotes(readNotes());
        setQuotaInfo(checkStorageQuotaWarning());
        dispatch({ type: "MARK_SAVED", savedAt: note.updatedAt });
      } catch {
        setStatus("Penyimpanan browser penuh. Unduh PDF atau JSON cadangan.");
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [
    state.isDirty,
    state.noteId,
    state.title,
    state.present.elements,
    state.present.pageCount,
    notes,
  ]);

  useWhiteboardShortcuts({
    dispatch,
    isInlineEditing: Boolean(editing),
    onSpaceHoldChange: setSpaceHeld,
  });

  const handleManualSave = () => {
    const elements = finishEdit(true);
    const now = new Date().toISOString();
    const note: Note = {
      id: state.noteId,
      title: (state.title.trim() || "Catatan baru").slice(0, 100),
      elements,
      pageCount: state.present.pageCount,
      schemaVersion: NOTE_SCHEMA_VERSION,
      updatedAt: now,
    };
    try {
      saveNote(note);
      setNotes(readNotes());
      setQuotaInfo(checkStorageQuotaWarning());
      dispatch({ type: "MARK_SAVED", savedAt: now });
      setStatus("Semua halaman berhasil disimpan di browser ini.");
    } catch {
      setStatus("Penyimpanan penuh. Unduh PDF/JSON dan coba lagi.");
    }
  };

  const handleNewNote = () => {
    finishEdit(false);
    dispatch({ type: "NEW_NOTE", id: crypto.randomUUID() });
    setStatus("Lembar papan baru siap digunakan.");
  };

  const handleOpenNote = (note: Note) => {
    finishEdit(false);
    dispatch({ type: "LOAD_NOTE", note });
    setStatus(`Catatan “${note.title}” dibuka.`);
  };

  const handleConfirmDeleteNote = () => {
    deleteNote(state.noteId);
    setNotes(readNotes());
    setQuotaInfo(checkStorageQuotaWarning());
    setConfirmDeleteOpen(false);
    dispatch({ type: "NEW_NOTE", id: crypto.randomUUID() });
    setStatus("Catatan dihapus dari browser.");
  };

  const processImageFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setStatus("File atau clipboard tidak berisi gambar.");
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      try {
        const source = new Image();
        await new Promise<void>((resolve, reject) => {
          source.onload = () => resolve();
          source.onerror = () =>
            reject(new Error("Gambar tidak dapat dibaca."));
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
        const page = Math.min(
          activePageRef.current,
          state.present.pageCount - 1,
        );
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
        dispatch({ type: "ADD_ELEMENT", element: item, selectNew: true });
        dispatch({ type: "SET_TOOL", tool: "select" });
        setStatus(
          `Gambar ditempel di halaman ${page + 1}. Seret untuk memindah atau tarik sudut untuk mengubah ukuran.`,
        );
      } catch (error) {
        setStatus(
          error instanceof Error ? error.message : "Gambar gagal ditempel.",
        );
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    },
    [state.present.pageCount],
  );

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
        void processImageFile(file);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [processImageFile]);

  const pasteFromButton = async () => {
    try {
      if (!navigator.clipboard?.read)
        throw new Error("Gunakan Cmd/Ctrl+V atau tombol Gambar untuk menempel.");
      const entries = await navigator.clipboard.read();
      const entry = entries.find((item) =>
        item.types.some((type) => type.startsWith("image/")),
      );
      const type = entry?.types.find((t) => t.startsWith("image/"));
      if (!entry || !type) throw new Error("Clipboard tidak berisi gambar.");
      const blob = await entry.getType(type);
      await processImageFile(new File([blob], "gambar-clipboard", { type }));
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Gunakan Cmd/Ctrl+V untuk menempel gambar.",
      );
    }
  };

  const handleExportPdf = () => {
    const elements = finishEdit(true);
    try {
      buildNotePdf(state.title, elements, state.present.pageCount).save(
        `atala-catatan-${state.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "kelas"}.pdf`,
      );
      setStatus(
        `PDF A4 (${state.present.pageCount} halaman) berhasil diunduh.`,
      );
    } catch {
      setStatus("PDF gagal dibuat. Coba ulangi.");
    }
  };

  const handleExportPng = async () => {
    const elements = finishEdit(true);
    const page = Math.min(activePageRef.current, state.present.pageCount - 1);
    try {
      await exportPageAsPng(state.title, elements, page);
      setStatus(`Gambar PNG halaman ${page + 1} berhasil diunduh.`);
    } catch {
      setStatus("Gagal mengekspor PNG halaman aktif.");
    }
  };

  const handleExportJson = () => {
    const elements = finishEdit(true);
    downloadNoteJson({
      id: state.noteId,
      title: state.title.trim() || "Catatan baru",
      elements,
      pageCount: state.present.pageCount,
      schemaVersion: NOTE_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
    });
    setStatus("File cadangan JSON catatan berhasil diunduh.");
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importNoteFromFile(file);
      saveNote(imported);
      setNotes(readNotes());
      setQuotaInfo(checkStorageQuotaWarning());
      dispatch({ type: "LOAD_NOTE", note: imported });
      setStatus(`Catatan “${imported.title}” berhasil diimpor!`);
    } catch (err) {
      setStatus(
        err instanceof Error ? err.message : "Gagal mengimpor catatan JSON.",
      );
    }
    e.target.value = "";
  };

  const handleFitToPage = () => {
    const wrapWidth =
      shellRef.current?.querySelector(".board-paper-wrap")?.clientWidth || 880;
    const nextZoom = fitToPageZoom(wrapWidth, 56);
    dispatch({ type: "SET_ZOOM", zoom: nextZoom });
    dispatch({ type: "SET_PAN", pan: { x: 0, y: 0 } });
    setStatus(`Tampilan disesuaikan ke lebar halaman (${Math.round(nextZoom * 100)}%).`);
  };

  return (
    <div
      ref={shellRef}
      className={`board-shell ${isFullscreen ? "board-fullscreen" : ""}`}
    >
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void processImageFile(f);
          e.target.value = "";
        }}
      />
      <input
        ref={jsonInputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={handleImportJson}
      />

      <WhiteboardSidebar
        notes={notes}
        activeNoteId={state.noteId}
        nearQuota={quotaInfo.nearLimit}
        percentUsed={quotaInfo.percentUsed}
        onNewNote={handleNewNote}
        onOpenNote={handleOpenNote}
        onExportPdf={handleExportPdf}
        onExportPng={handleExportPng}
        onExportJson={handleExportJson}
        onImportJsonClick={() => jsonInputRef.current?.click()}
      />

      <section className="board-main" aria-label="Area kerja papan catatan">
        <div className="board-topbar">
          <div className="board-title-group">
            <label htmlFor="note-title">JUDUL CATATAN</label>
            <input
              id="note-title"
              value={state.title}
              maxLength={100}
              onChange={(e) =>
                dispatch({ type: "SET_TITLE", title: e.target.value })
              }
            />
          </div>

          <div className="board-top-actions">
            <span
              className={`wb-save-indicator ${state.isDirty ? "unsaved" : "saved"}`}
              role="status"
              aria-live="polite"
            >
              {state.isDirty ? (
                <>
                  <Clock size={14} aria-hidden="true" /> Belum tersimpan
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} aria-hidden="true" /> Tersimpan
                </>
              )}
            </span>
            <button
              type="button"
              className="button outline"
              onClick={handleManualSave}
            >
              <Save size={16} aria-hidden="true" /> Simpan
            </button>
            <button
              type="button"
              className="button primary"
              onClick={handleExportPdf}
            >
              <Download size={16} aria-hidden="true" /> Unduh PDF
            </button>
          </div>
        </div>

        <WhiteboardToolbar
          tool={state.tool}
          zoom={state.zoom}
          gridMode={state.gridMode}
          canUndo={state.past.length > 0}
          canRedo={state.future.length > 0}
          isFullscreen={isFullscreen}
          dispatch={dispatch}
          onPasteClipboardImage={pasteFromButton}
          onUploadImageClick={() => imageInputRef.current?.click()}
          onFitToPage={handleFitToPage}
          onToggleFullscreen={() => setIsFullscreen((v) => !v)}
        />

        <WhiteboardInspector
          tool={state.tool}
          style={state.style}
          selectedCount={state.selectedIds.length}
          hasClipboard={state.clipboard.length > 0}
          hasElements={state.present.elements.length > 0}
          dispatch={dispatch}
          onRequestClearBoard={() => setConfirmClearOpen(true)}
        />

        <WhiteboardCanvas
          elements={state.present.elements}
          pageCount={state.present.pageCount}
          tool={state.tool}
          style={state.style}
          selectedIds={state.selectedIds}
          zoom={state.zoom}
          pan={state.pan}
          gridMode={state.gridMode}
          spaceHeld={spaceHeld}
          editing={editing}
          textareaRef={textareaRef}
          dispatch={dispatch}
          onActivePageChange={(p) => {
            activePageRef.current = p;
          }}
          onBeginEdit={beginEdit}
          onChangeEdit={changeEdit}
          onFinishEdit={finishEdit}
        />

        <div className="board-footer">
          <p role="status" aria-live="polite">
            {status}
          </p>
          <div className="board-footer-right">
            <span>
              {state.present.elements.length} objek · {state.present.pageCount}{" "}
              halaman A4
            </span>
            <button
              type="button"
              className="board-delete-note"
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={!notes.some((n) => n.id === state.noteId)}
            >
              <Trash2 size={15} aria-hidden="true" /> Hapus catatan
            </button>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={confirmClearOpen}
        title="Kosongkan seluruh isi papan?"
        description="Semua objek di lembar ini akan dihapus (kamu masih bisa menekan Urungkan / Ctrl+Z setelahnya)."
        confirmLabel="Ya, kosongkan papan"
        cancelLabel="Batal"
        tone="danger"
        onConfirm={() => {
          dispatch({ type: "CLEAR_BOARD" });
          setConfirmClearOpen(false);
          setStatus("Papan dikosongkan. Tekan Urungkan (Ctrl+Z) bila tidak sengaja.");
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        title={`Hapus catatan “${state.title}”?`}
        description="Catatan ini akan dihapus dari penyimpanan browser perangkat ini."
        confirmLabel="Ya, hapus catatan"
        cancelLabel="Batal"
        tone="danger"
        onConfirm={handleConfirmDeleteNote}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}
