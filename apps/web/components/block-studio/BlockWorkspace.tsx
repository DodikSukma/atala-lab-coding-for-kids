import type { PointerEvent } from "react";
import { ArrowDown, ArrowUp, GripVertical, Trash2 } from "lucide-react";
import { blockLabels, type Block } from "@/lib/curriculum";
import { blockClass } from "./BlockPalette";
export default function BlockWorkspace({
  blocks,
  activeId,
  dropIndex,
  dragging,
  draggedId,
  onMove,
  onRemove,
  onUpdate,
  onDrag,
}: {
  blocks: Block[];
  activeId: string;
  dropIndex: number | null;
  dragging: boolean;
  draggedId: string | null;
  onMove: (index: number, dir: number) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, value: string) => void;
  onDrag: (
    source: { type: "workspace"; id: string },
    event: PointerEvent<HTMLButtonElement>,
  ) => void;
}) {
  return (
    <div className={`studio-pane studio-workspace ${dragging ? "is-dragging" : ""}`}>
      <div className="pane-head">
        <span className="pane-step">03</span>
        <div>
          <h3>Jalur program</h3>
          <p>Rangkai blok seperti keping puzzle.</p>
        </div>
        <span className="block-count">{blocks.length} / 80</span>
      </div>
      <div
        className="workspace-scroll"
        data-workspace
        data-block-count={blocks.length}
      >
        <div className="workspace-ruler"><span>PROGRAM UTAMA</span><span>ATAS → BAWAH</span></div>
        {blocks.length === 0 && (
          <div className="workspace-empty">
            Seret blok ke sini untuk memulai. Kamu juga bisa klik blok di
            sebelah kiri.
          </div>
        )}
        {blocks.map((block, i) => (
          <div key={block.id}>
            <div
              data-drop-index={i}
              className={`drop-slot ${dropIndex === i ? "visible" : ""}`}
              aria-hidden="true"
            ><span>LEPAS DI SINI</span></div>
            <div
              className={`stack-row ${activeId === block.id ? "is-active" : ""} ${draggedId === block.id ? "is-dragged" : ""}`}
              data-row-index={i}
            >
              <span className="stack-index">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className={`code-block ${blockClass[block.kind]} kind-${block.kind}`}>
                <span className="block-label">{blockLabels[block.kind]}</span>
                {block.kind === "say" && (
                  <input
                    aria-label="Pesan yang diucapkan"
                    value={String(block.value || "Halo!")}
                    maxLength={40}
                    onChange={(e) => onUpdate(block.id, e.target.value)}
                  />
                )}
                {block.kind === "repeat" && (
                  <label className="block-inline-input">
                    Kali{" "}
                    <input
                      aria-label="Jumlah pengulangan"
                      type="number"
                      min="2"
                      max="12"
                      value={String(block.value || 3)}
                      onChange={(e) => onUpdate(block.id, e.target.value)}
                    />
                  </label>
                )}
              </div>
              <div className="block-actions">
                <button
                  type="button"
                  className="drag-handle"
                  aria-label={`Seret blok ${i + 1}`}
                  title="Seret untuk mengurutkan"
                  onPointerDown={(e) =>
                    onDrag({ type: "workspace", id: block.id }, e)
                  }
                >
                  <GripVertical size={16} />
                </button>
                <button
                  aria-label={`Naikkan blok ${i + 1}`}
                  onClick={() => onMove(i, -1)}
                  disabled={i === 0}
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  aria-label={`Turunkan blok ${i + 1}`}
                  onClick={() => onMove(i, 1)}
                  disabled={i === blocks.length - 1}
                >
                  <ArrowDown size={15} />
                </button>
                <button
                  aria-label={`Hapus blok ${i + 1}`}
                  onClick={() => onRemove(block.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
        <div
          data-drop-index={blocks.length}
          className={`drop-slot ${dropIndex === blocks.length ? "visible" : ""}`}
          aria-hidden="true"
        ><span>LEPAS DI SINI</span></div>
      </div>
      <div className="workspace-foot">
        Seret blok ke celah bercahaya · Tombol panah untuk keyboard
      </div>
    </div>
  );
}
