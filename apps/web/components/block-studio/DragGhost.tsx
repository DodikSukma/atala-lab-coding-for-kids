import { blockLabels, type BlockKind } from "@/lib/curriculum";
import { blockClass } from "./BlockPalette";
export default function DragGhost({
  kind,
  x,
  y,
}: {
  kind: BlockKind;
  x: number;
  y: number;
}) {
  return (
    <div
      className={`drag-ghost code-block ${blockClass[kind]} kind-${kind}`}
      style={{ left: x + 14, top: y + 14 }}
      aria-hidden="true"
    >
      <span>{blockLabels[kind]}</span><small>LEPAS DI JALUR →</small>
    </div>
  );
}
