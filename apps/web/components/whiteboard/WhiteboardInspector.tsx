import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
  ArrowDownToLine,
  ArrowUpToLine,
  Clipboard,
  Copy,
  CopyPlus,
  Scissors,
  Trash2,
} from "lucide-react";
import type {
  StyleConfig,
  WhiteboardAction,
  WhiteboardTool,
} from "@/lib/whiteboard/reducer";

export const STROKE_COLORS = [
  "#17213b",
  "#2563eb",
  "#7c3aed",
  "#e11d48",
  "#16a34a",
  "#d97706",
];

export const FILL_COLORS = [
  { value: "transparent", label: "Tanpa isi" },
  { value: "#dbeafe", label: "Biru muda" },
  { value: "#ede9fe", label: "Ungu muda" },
  { value: "#dcfce7", label: "Hijau muda" },
  { value: "#fef08a", label: "Kuning catatan" },
  { value: "#ffe4e6", label: "Merah muda" },
];

export default function WhiteboardInspector({
  tool,
  style,
  selectedCount,
  hasClipboard,
  hasElements,
  dispatch,
  onRequestClearBoard,
}: {
  tool: WhiteboardTool;
  style: StyleConfig;
  selectedCount: number;
  hasClipboard: boolean;
  hasElements: boolean;
  dispatch: (action: WhiteboardAction) => void;
  onRequestClearBoard: () => void;
}) {
  const showFill =
    tool === "rect" ||
    tool === "ellipse" ||
    tool === "sticky" ||
    selectedCount > 0;
  const showTextProps =
    tool === "text" || tool === "sticky" || selectedCount > 0;

  return (
    <div className="board-options wb-inspector" aria-label="Properti gaya dan objek">
      <div className="wb-prop-group">
        <span className="wb-prop-label">WARNA</span>
        <div className="board-colors" role="group" aria-label="Warna garis dan teks">
          {STROKE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              title={`Warna ${c}`}
              aria-label={`Pilih warna ${c}`}
              aria-pressed={style.color === c}
              onClick={() =>
                dispatch({ type: "UPDATE_STYLE", patch: { color: c } })
              }
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      {showFill && (
        <div className="wb-prop-group">
          <span className="wb-prop-label">ISI</span>
          <div className="wb-fill-colors" role="group" aria-label="Warna isi bentuk">
            {FILL_COLORS.map((fc) => (
              <button
                key={fc.value}
                type="button"
                title={fc.label}
                aria-label={fc.label}
                aria-pressed={style.fill === fc.value}
                className={fc.value === "transparent" ? "fill-transparent" : ""}
                style={
                  fc.value !== "transparent"
                    ? { background: fc.value }
                    : undefined
                }
                onClick={() =>
                  dispatch({
                    type: "UPDATE_STYLE",
                    patch: { fill: fc.value },
                  })
                }
              />
            ))}
          </div>
        </div>
      )}

      <label className="wb-prop-group">
        <span className="wb-prop-label">TEBAL ({style.width}px)</span>
        <input
          aria-label="Ukuran garis"
          type="range"
          min="2"
          max="16"
          value={style.width}
          onChange={(e) =>
            dispatch({
              type: "UPDATE_STYLE",
              patch: { width: Number(e.target.value) },
            })
          }
        />
      </label>

      <div className="wb-prop-group" role="group" aria-label="Gaya garis">
        <span className="wb-prop-label">GARIS</span>
        <div className="wb-segmented">
          <button
            type="button"
            aria-pressed={style.strokeStyle === "solid"}
            className={style.strokeStyle === "solid" ? "active" : ""}
            onClick={() =>
              dispatch({
                type: "UPDATE_STYLE",
                patch: { strokeStyle: "solid" },
              })
            }
          >
            Utuh
          </button>
          <button
            type="button"
            aria-pressed={style.strokeStyle === "dashed"}
            className={style.strokeStyle === "dashed" ? "active" : ""}
            onClick={() =>
              dispatch({
                type: "UPDATE_STYLE",
                patch: { strokeStyle: "dashed" },
              })
            }
          >
            Putus
          </button>
        </div>
      </div>

      <div className="wb-prop-group" role="group" aria-label="Transparansi objek">
        <span className="wb-prop-label">OPASITAS</span>
        <div className="wb-segmented">
          {[
            { label: "100%", val: 1 },
            { label: "65%", val: 0.65 },
            { label: "40%", val: 0.4 },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              aria-pressed={Math.abs(style.opacity - opt.val) < 0.05}
              className={
                Math.abs(style.opacity - opt.val) < 0.05 ? "active" : ""
              }
              onClick={() =>
                dispatch({
                  type: "UPDATE_STYLE",
                  patch: { opacity: opt.val },
                })
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {showTextProps && (
        <div className="wb-prop-group" role="group" aria-label="Ukuran dan ketebalan teks">
          <span className="wb-prop-label">TEKS</span>
          <select
            aria-label="Ukuran huruf"
            className="wb-font-select"
            value={style.fontSize}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_STYLE",
                patch: { fontSize: Number(e.target.value) },
              })
            }
          >
            <option value={18}>Kecil (18)</option>
            <option value={24}>Sedang (24)</option>
            <option value={32}>Besar (32)</option>
            <option value={42}>Judul (42)</option>
          </select>
          <button
            type="button"
            className={`wb-bold-btn ${style.fontWeight === "bold" ? "active" : ""}`}
            aria-pressed={style.fontWeight === "bold"}
            title="Teks tebal"
            onClick={() =>
              dispatch({
                type: "UPDATE_STYLE",
                patch: {
                  fontWeight: style.fontWeight === "bold" ? "normal" : "bold",
                },
              })
            }
          >
            <b>B</b>
          </button>
        </div>
      )}

      {selectedCount > 0 && (
        <div className="wb-selection-bar" role="group" aria-label="Aksi objek terpilih">
          <span className="wb-selection-count">{selectedCount} dipilih</span>

          <button
            type="button"
            className="wb-action-btn"
            title="Bawa ke depan (Bring forward)"
            onClick={() =>
              dispatch({ type: "REORDER_SELECTED", order: "forward" })
            }
          >
            <ArrowUpToLine size={14} aria-hidden="true" /> Maju
          </button>
          <button
            type="button"
            className="wb-action-btn"
            title="Kirim ke belakang (Send backward)"
            onClick={() =>
              dispatch({ type: "REORDER_SELECTED", order: "backward" })
            }
          >
            <ArrowDownToLine size={14} aria-hidden="true" /> Mundur
          </button>

          {selectedCount >= 2 && (
            <div className="wb-align-group" role="group" aria-label="Perataan multi-objek">
              <button
                type="button"
                className="wb-icon-btn"
                aria-label="Rata kiri"
                title="Rata kiri"
                onClick={() =>
                  dispatch({ type: "ALIGN_SELECTED", alignment: "left" })
                }
              >
                <AlignStartVertical size={15} />
              </button>
              <button
                type="button"
                className="wb-icon-btn"
                aria-label="Rata tengah horizontal"
                title="Rata tengah horizontal"
                onClick={() =>
                  dispatch({ type: "ALIGN_SELECTED", alignment: "center" })
                }
              >
                <AlignCenterVertical size={15} />
              </button>
              <button
                type="button"
                className="wb-icon-btn"
                aria-label="Rata kanan"
                title="Rata kanan"
                onClick={() =>
                  dispatch({ type: "ALIGN_SELECTED", alignment: "right" })
                }
              >
                <AlignEndVertical size={15} />
              </button>
              <button
                type="button"
                className="wb-icon-btn"
                aria-label="Rata atas"
                title="Rata atas"
                onClick={() =>
                  dispatch({ type: "ALIGN_SELECTED", alignment: "top" })
                }
              >
                <AlignStartHorizontal size={15} />
              </button>
              <button
                type="button"
                className="wb-icon-btn"
                aria-label="Rata tengah vertikal"
                title="Rata tengah vertikal"
                onClick={() =>
                  dispatch({ type: "ALIGN_SELECTED", alignment: "middle" })
                }
              >
                <AlignCenterHorizontal size={15} />
              </button>
              <button
                type="button"
                className="wb-icon-btn"
                aria-label="Rata bawah"
                title="Rata bawah"
                onClick={() =>
                  dispatch({ type: "ALIGN_SELECTED", alignment: "bottom" })
                }
              >
                <AlignEndHorizontal size={15} />
              </button>
            </div>
          )}

          <button
            type="button"
            className="wb-action-btn"
            title="Salin (Ctrl+C)"
            onClick={() => dispatch({ type: "COPY_SELECTED" })}
          >
            <Copy size={14} aria-hidden="true" /> Salin
          </button>
          <button
            type="button"
            className="wb-action-btn"
            title="Potong (Ctrl+X)"
            onClick={() => dispatch({ type: "CUT_SELECTED" })}
          >
            <Scissors size={14} aria-hidden="true" /> Potong
          </button>
          <button
            type="button"
            className="wb-action-btn"
            title="Duplikat (Ctrl+D)"
            onClick={() => dispatch({ type: "DUPLICATE_SELECTED" })}
          >
            <CopyPlus size={14} aria-hidden="true" /> Duplikat
          </button>
          <button
            type="button"
            className="board-delete-selection"
            title="Hapus pilihan (Delete)"
            onClick={() => dispatch({ type: "DELETE_SELECTED" })}
          >
            <Trash2 size={14} aria-hidden="true" /> Hapus pilihan
          </button>
        </div>
      )}

      {hasClipboard && (
        <button
          type="button"
          className="wb-action-btn"
          title="Tempel objek yang disalin (Ctrl+V)"
          onClick={() => dispatch({ type: "PASTE_CLIPBOARD" })}
        >
          <Clipboard size={14} aria-hidden="true" /> Tempel objek
        </button>
      )}

      <button
        type="button"
        className="board-clear"
        onClick={onRequestClearBoard}
        disabled={!hasElements}
      >
        Kosongkan papan
      </button>
    </div>
  );
}
