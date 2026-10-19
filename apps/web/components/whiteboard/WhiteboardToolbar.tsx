import {
  ArrowUpRight,
  Circle,
  ClipboardPaste,
  Eraser,
  Grid3X3,
  Hand,
  Highlighter,
  ImagePlus,
  Maximize2,
  Minimize2,
  Minus,
  MousePointer2,
  PenLine,
  Plus,
  RectangleHorizontal,
  Redo2,
  Scan,
  Slash,
  StickyNote,
  Type,
  Undo2,
} from "lucide-react";
import type {
  GridMode,
  WhiteboardAction,
  WhiteboardTool,
} from "@/lib/whiteboard/reducer";

const TOOL_ITEMS: Array<{
  id: WhiteboardTool;
  label: string;
  shortcut: string;
  Icon: typeof PenLine;
}> = [
  { id: "select", label: "Pilih", shortcut: "V", Icon: MousePointer2 },
  { id: "hand", label: "Geser", shortcut: "H", Icon: Hand },
  { id: "pen", label: "Pena", shortcut: "P", Icon: PenLine },
  { id: "highlighter", label: "Stabilo", shortcut: "M", Icon: Highlighter },
  { id: "rect", label: "Kotak", shortcut: "R", Icon: RectangleHorizontal },
  { id: "ellipse", label: "Lingkaran", shortcut: "O", Icon: Circle },
  { id: "line", label: "Garis", shortcut: "L", Icon: Slash },
  { id: "arrow", label: "Panah", shortcut: "A", Icon: ArrowUpRight },
  { id: "text", label: "Teks", shortcut: "T", Icon: Type },
  { id: "sticky", label: "Sticky", shortcut: "S", Icon: StickyNote },
  { id: "erase", label: "Hapus", shortcut: "E", Icon: Eraser },
];

export default function WhiteboardToolbar({
  tool,
  zoom,
  gridMode,
  canUndo,
  canRedo,
  isFullscreen,
  dispatch,
  onPasteClipboardImage,
  onUploadImageClick,
  onFitToPage,
  onToggleFullscreen,
}: {
  tool: WhiteboardTool;
  zoom: number;
  gridMode: GridMode;
  canUndo: boolean;
  canRedo: boolean;
  isFullscreen: boolean;
  dispatch: (action: WhiteboardAction) => void;
  onPasteClipboardImage: () => void;
  onUploadImageClick: () => void;
  onFitToPage: () => void;
  onToggleFullscreen: () => void;
}) {
  return (
    <div className="board-tool-row wb-toolbar">
      <div
        className="board-tools"
        role="toolbar"
        aria-label="Alat menggambar papan guru"
      >
        {TOOL_ITEMS.map(({ id, label, shortcut, Icon }) => (
          <button
            key={id}
            type="button"
            className={`wb-tool-btn ${tool === id ? "active" : ""}`}
            aria-pressed={tool === id}
            title={`${label} (${shortcut})`}
            onClick={() => dispatch({ type: "SET_TOOL", tool: id })}
          >
            <Icon size={17} aria-hidden="true" />
            <span>{label}</span>
            <kbd className="wb-kbd">{shortcut}</kbd>
          </button>
        ))}

        <button
          type="button"
          className="wb-tool-btn"
          title="Unggah gambar dari perangkat"
          onClick={onUploadImageClick}
        >
          <ImagePlus size={17} aria-hidden="true" />
          <span>Gambar</span>
        </button>

        <button
          type="button"
          className="wb-tool-btn"
          title="Tempel screenshot dari clipboard (Ctrl/Cmd+V)"
          onClick={onPasteClipboardImage}
        >
          <ClipboardPaste size={17} aria-hidden="true" />
          <span>Tempel</span>
        </button>
      </div>

      <div className="wb-toolbar-right">
        <div className="board-history" role="group" aria-label="Riwayat perubahan">
          <button
            type="button"
            aria-label="Urungkan (Ctrl+Z)"
            title="Urungkan (Ctrl+Z)"
            onClick={() => dispatch({ type: "UNDO" })}
            disabled={!canUndo}
          >
            <Undo2 size={17} />
          </button>
          <button
            type="button"
            aria-label="Ulangi (Ctrl+Y)"
            title="Ulangi (Ctrl+Y)"
            onClick={() => dispatch({ type: "REDO" })}
            disabled={!canRedo}
          >
            <Redo2 size={17} />
          </button>
        </div>

        <div className="wb-zoom-controls" role="group" aria-label="Kontrol zoom kanvas">
          <button
            type="button"
            aria-label="Perkecil tampilan"
            title="Perkecil (-)"
            onClick={() => dispatch({ type: "ZOOM_BY", delta: -0.15 })}
          >
            <Minus size={15} />
          </button>
          <button
            type="button"
            className="wb-zoom-readout"
            title="Reset zoom ke 100% (0)"
            onClick={() => dispatch({ type: "RESET_VIEW" })}
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            aria-label="Perbesar tampilan"
            title="Perbesar (+)"
            onClick={() => dispatch({ type: "ZOOM_BY", delta: 0.15 })}
          >
            <Plus size={15} />
          </button>
          <button
            type="button"
            className="wb-fit-btn"
            title="Sesuaikan lebar halaman A4 (Fit to page)"
            onClick={onFitToPage}
          >
            <Scan size={15} aria-hidden="true" />
            <span>Pas Halaman</span>
          </button>
        </div>

        <div className="wb-view-toggles">
          <button
            type="button"
            className="wb-grid-btn"
            title="Ubah latar kisi kertas (Titik / Kotak / Polos)"
            onClick={() => {
              const next: GridMode =
                gridMode === "dots"
                  ? "grid"
                  : gridMode === "grid"
                    ? "plain"
                    : "dots";
              dispatch({ type: "SET_GRID_MODE", gridMode: next });
            }}
          >
            <Grid3X3 size={15} aria-hidden="true" />
            <span>
              {gridMode === "dots"
                ? "Titik"
                : gridMode === "grid"
                  ? "Kotak"
                  : "Polos"}
            </span>
          </button>
          <button
            type="button"
            className="wb-fullscreen-btn"
            aria-label={isFullscreen ? "Keluar layar penuh" : "Mode layar penuh"}
            title={isFullscreen ? "Keluar layar penuh" : "Mode layar penuh"}
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
