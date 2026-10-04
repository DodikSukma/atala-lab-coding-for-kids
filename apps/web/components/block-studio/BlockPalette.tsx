import { useState, type PointerEvent } from "react";
import {
  Blocks,
  Clapperboard,
  Flag,
  GripVertical,
  MoveRight,
  Variable,
} from "lucide-react";
import { blockLabels, type BlockKind } from "@/lib/curriculum";
const groups = [
  { id: "events", name: "Peristiwa", icon: Flag, kinds: ["start", "key"] },
  {
    id: "motion",
    name: "Gerak",
    icon: MoveRight,
    kinds: ["move", "left", "right"],
  },
  { id: "looks", name: "Tampilan", icon: Clapperboard, kinds: ["say", "wait"] },
  { id: "control", name: "Aturan", icon: Blocks, kinds: ["repeat", "ifStar"] },
  { id: "variable", name: "Skor", icon: Variable, kinds: ["score"] },
] as const;
export const blockClass: Record<BlockKind, string> = {
  start: "event",
  key: "event",
  move: "motion",
  left: "motion",
  right: "motion",
  say: "looks",
  wait: "looks",
  repeat: "control",
  ifStar: "control",
  score: "variable",
};
export default function BlockPalette({
  onAdd,
  onDrag,
}: {
  onAdd: (kind: BlockKind) => void;
  onDrag: (
    source: { type: "palette"; kind: BlockKind },
    event: PointerEvent<HTMLButtonElement>,
  ) => void;
}) {
  const [selected, setSelected] =
    useState<(typeof groups)[number]["id"]>("events");
  const current = groups.find((g) => g.id === selected)!;
  return (
    <div className="studio-pane studio-palette">
      <div className="pane-head">
        <span className="pane-step">01</span>
        <div>
          <h3>Blok perintah</h3>
          <p>Pilih blok, lalu bawa ke jalur di kanan.</p>
        </div>
      </div>
      <div
        className="palette-categories"
        role="tablist"
        aria-label="Kategori blok"
      >
        {groups.map(({ id, name, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={selected === id}
            className={`category-tab ${selected === id ? "active" : ""}`}
            onClick={() => setSelected(id)}
          >
            <Icon size={17} />
            <span>{name}</span>
          </button>
        ))}
      </div>
      <div className="palette-content">
        <span className="pane-kicker">
          {current.name.toUpperCase()} · {current.kinds.length} BLOK
        </span>
        <div className="palette-items">
          {current.kinds.map((kind) => (
            <div key={kind} className={`palette-item ${blockClass[kind]} kind-${kind}`}>
              <button
                type="button"
                className="palette-add"
                aria-label={`Tambahkan blok ${blockLabels[kind]}`}
                onClick={() => onAdd(kind)}
              >
                {blockLabels[kind]}
              </button>
              <button
                type="button"
                className="drag-handle"
                aria-label={`Seret blok ${blockLabels[kind]}`}
                title="Seret ke area kerja"
                onPointerDown={(e) => onDrag({ type: "palette", kind }, e)}
              >
                <GripVertical size={17} />
              </button>
            </div>
          ))}
        </div>
        <p className="palette-help">
          Seret dari titik-titik ke jalur program. Klik nama blok untuk menambah tanpa menyeret.
        </p>
      </div>
    </div>
  );
}
